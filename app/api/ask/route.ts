import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MECHVI_JSON_SCHEMA } from "./mechvi_schema";

type Mode = "quick" | "report";
type Access = "FREE" | "PAY_PER_REPORT" | "SUBSCRIBER";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Per-IP anonymous quick verdicts (resets monthly UTC). In-memory = best-effort per server instance. */
const anonQuickByIp = new Map<string, { monthKey: string; count: number }>();

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function getAnonQuickCount(ip: string, monthKey: string) {
  const row = anonQuickByIp.get(ip);
  if (!row || row.monthKey !== monthKey) return 0;
  return row.count;
}

function recordAnonQuickSuccess(ip: string, monthKey: string) {
  const row = anonQuickByIp.get(ip);
  if (!row || row.monthKey !== monthKey) {
    anonQuickByIp.set(ip, { monthKey, count: 1 });
  } else {
    row.count += 1;
  }
}

function numEnv(name: string, fallback: number) {
  const v = Number(process.env[name] || "");
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function monthKeyUTC(d = new Date()) {
  // YYYY-MM
  return d.toISOString().slice(0, 7);
}

function modelFor(access: Access, economy: boolean) {
  if (economy) return process.env.MECHVI_ECONOMY_MODEL || "gpt-5-nano";
  if (access === "FREE") return process.env.MECHVI_MODEL_FREE || "gpt-5-nano";
  if (access === "PAY_PER_REPORT") return process.env.MECHVI_MODEL_REPORT || "gpt-5-mini";
  return process.env.MECHVI_MODEL_SUBSCRIBER || "gpt-5.2";
}

function maxOutFor(access: Access, economy: boolean, mode: Mode) {
  if (economy) return numEnv("MECHVI_ECONOMY_MAX_OUT", 450);
  if (access === "FREE") return mode === "quick" ? 650 : 900;
  if (access === "PAY_PER_REPORT") return 1900;
  return 2200;
}

function paywallResponse(mode: Mode) {
  const isReport = mode === "report";
  const bullets = isReport
    ? [
        "This is a placeholder paywall.",
        "In production, Stripe will unlock 1 report credit.",
        "Subscribers get the best answers + Garage + alerts.",
      ]
    : ["You used all FREE quick verdicts for this month.", "Get a $2.99 report, or subscribe for full access."];

  return {
    meta: { assistant: "mechvi", version: "1.2", access_level: "FREE", locale: "en-AU", intent: "buy", disclaimer_level: "light" },
    status: { needs_clarification: false, clarifying_questions: [], data_confidence: "low" },
    vehicle_summary: { label: "MechVi", km: null, notes: ["Paywall response (no AI call)."] },
    entitlements: {
      garage: { can_save_vehicle: true, free_slots_total: 1, free_slots_used: 0 },
      alerts: { enabled: false },
      logbook: { enabled: false },
      personalised_plan: { enabled: false },
    },
    cards: [
      {
        type: "paywall_notice",
        title: isReport ? "Report requires payment" : "Free limit reached",
        severity: "warning",
        bullets,
        table: { columns: [], rows: [] },
        score: { label: "", value: null, scale_max: 10, bands: [] },
        actions: [
          {
            id: "pay_report",
            label: "Get $2.99 Report (placeholder)",
            action_type: "paywall",
            payload: { product: "mechvi_report", price_aud: 2.99 },
          },
          {
            id: "subscribe",
            label: "Subscribe $7.99/m (placeholder)",
            action_type: "subscribe",
            payload: { plan: "plus", price_aud_per_month: 7.99 },
          },
        ],
      },
      {
        type: "next_steps",
        title: "Next step",
        severity: "info",
        bullets: [
          "Subscribe to unlock Garage + alerts + personalised plan.",
          "Or buy a one-off report for a full buying checklist.",
        ],
        table: { columns: [], rows: [] },
        score: { label: "", value: null, scale_max: 10, bands: [] },
        actions: [],
      },
    ],
    cta: {
      label: "Subscribe $7.99/m (placeholder)",
      action_type: "subscribe",
      payload: { plan: "plus", price_aud_per_month: 7.99 },
    },
  };
}

function buildQuickPrompt(v: {
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  cylinders: string;
  km: number | null;
  locale: string;
}) {
  const vehicleLabel = `${v.year} ${v.make} ${v.model}`.trim();
  const kmText = v.km ? `${v.km} km` : "unknown km";

  return `
You are MechVi — "your mechanic in your pocket" for Australia.
Write like a confident senior mechanic talking to a total beginner: clear, direct, practical.
Tone: premium, helpful, human. No fluff. No vague generic advice.

Goal of QUICK (FREE) verdict:
- Make the user feel "wow, this is useful" AND curious to unlock the $2.99 full report.
- Be realistic: if info is missing, say what you assumed.

Vehicle:
- ${vehicleLabel}
- Transmission=${v.transmission}, Fuel=${v.fuel}, Cylinders=${v.cylinders}, Odometer=${kmText}
Market context: Australia (AU).

Return JSON ONLY matching the MechVi schema. No markdown.

Rules for QUICK (FREE) — follow exactly:
- Set vehicle_summary.label to exactly: "${vehicleLabel}" (same spelling as above).
- Use exactly 4 cards in this order: summary, risk_flags, costs, checklist (types must match).
- MANDATORY: every one of those four cards MUST have a "bullets" array with at least 3 strings and at most 5. Never [] or null — every bullet must be useful for THIS vehicle, not filler like "see manual".
- summary: bullets[0] MUST be exactly "Fit: Good ✅" OR "Fit: Mixed 🤔" OR "Fit: Lemon 🍋" matching summary.score.value (3=Good, 2=Mixed, 1=Lemon). Then add at least 3 more bullets (AU-specific buying or ownership reality).
- risk_flags: at least 3 bullets — concrete things to verify on this model/era in AU (leaks, rust spots, gearbox feel, timing chain/belt, DPF if diesel, etc.).
- costs: (1) at least 3 bullets on realistic AU running costs for this car; (2) table.rows MUST have at least 3 rows, columns exactly ["Item","What to expect"], each row two plain strings (e.g. tyres, brakes, scheduled service).
- checklist: at least 3 bullets — 10-minute pre-purchase checks (torch, phone torch, fluids, tyres, cold start).

CTA:
- If FREE: cta.label = "Unlock the full $2.99 pre-purchase checklist (placeholder)" action_type="paywall"
- If SUBSCRIBER: cta.label = "Save to Garage (placeholder)" action_type="save_vehicle"
`.trim();
}

function padBulletList(existing: unknown, minCount: number, defaults: string[], maxOut: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  if (Array.isArray(existing)) {
    for (const x of existing) {
      const s = String(x ?? "").trim();
      if (s && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
  }
  for (const d of defaults) {
    if (out.length >= minCount) break;
    const s = d.trim();
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out.slice(0, maxOut);
}

function summaryPad(label: string) {
  return [
    `For the ${label}: cold start first — rattles, long crank, or blue smoke on start-up are serious haggle points.`,
    `AU check: sills, boot floor, and windscreen gutters for rust — repairs here get expensive fast.`,
    `Service history beats shiny paint — receipts for belts/chains, fluids, and brakes matter more than km alone.`,
  ];
}

function riskPad(label: string) {
  return [
    `Walk around the ${label}: panel gaps, overspray, and mismatched tyres often mean crash repair or neglect.`,
    `On the test drive in traffic — lazy gearbox shifts, vague steering, or hot smells need answers before you pay.`,
    `Look up this exact generation for known faults — what’s “normal” on forums is what you’ll pay for later.`,
  ];
}

function costsPad(label: string) {
  return [
    `Budget beyond the sticker: the ${label} still needs tyres, brakes, fluids, and rego — plan yearly AU workshop costs.`,
    `Some badges charge more for filters, suspension bits, or electronics — ring a local specialist for a ballpark.`,
    `Insurance varies by postcode and driver — get a quote before you commit, not after.`,
  ];
}

function checklistPad(label: string) {
  return [
    `Under bonnet on the ${label}: oil level, coolant colour, crusty reservoirs, cracked belts — photos if unsure.`,
    `Tyres: tread depth inside and out, uneven wear, and date codes — odd wear hints alignment or shocks.`,
    `Dash lights: engine, ABS, airbag — anything lit needs a reason; cleared codes can hide a recent problem.`,
  ];
}

function ensureQuickCards(parsed: any) {
  if (!parsed || typeof parsed !== "object") parsed = {};
  if (!parsed.meta) parsed.meta = { assistant: "mechvi", version: "1.2", access_level: "FREE", locale: "en-AU", intent: "buy", disclaimer_level: "light" };
  if (!parsed.status) parsed.status = { needs_clarification: false, clarifying_questions: [], data_confidence: "low" };
  if (!parsed.vehicle_summary) parsed.vehicle_summary = { label: "MechVi", km: null, notes: [] };
  if (!parsed.entitlements) parsed.entitlements = { garage: { can_save_vehicle: true, free_slots_total: 1, free_slots_used: 0 }, alerts: { enabled: false }, logbook: { enabled: false }, personalised_plan: { enabled: false } };
  if (!Array.isArray(parsed.cards)) parsed.cards = [];

  const wantOrder = ["summary", "risk_flags", "costs", "checklist"];
  const byType: Record<string, any> = {};
  for (const c of parsed.cards) if (c && c.type) byType[c.type] = c;

  function baseCard(type: string, title: string) {
    return {
      type,
      title,
      severity: "info",
      bullets: [],
      table: { columns: [], rows: [] },
      score: { label: "", value: null, scale_max: 3, bands: [] },
      actions: [],
    };
  }

  if (!byType.summary) byType.summary = baseCard("summary", "Quick Verdict");
  if (!byType.risk_flags) byType.risk_flags = baseCard("risk_flags", "Red Flags (Australia)");
  if (!byType.costs) byType.costs = baseCard("costs", "Running Costs Snapshot");
  if (!byType.checklist) byType.checklist = baseCard("checklist", "10-Minute Checks (Beginner)");

  const label = String(parsed.vehicle_summary?.label || "").trim() || "This vehicle";

  const raw = Number(byType.summary?.score?.value);
  const normalized = raw === 3 ? 3 : raw === 1 ? 1 : 2;
  const fitName = normalized === 3 ? "Good ✅" : normalized === 2 ? "Mixed 🤔" : "Lemon 🍋";

  byType.summary.title = "Quick Verdict";
  byType.summary.severity = normalized === 1 ? "warning" : "info";
  byType.summary.score = byType.summary.score || {};
  byType.summary.score.label = "Fit";
  byType.summary.score.value = normalized;
  byType.summary.score.scale_max = 3;
  byType.summary.score.bands = [
    { name: "Good", min: 3, max: 3 },
    { name: "Mixed", min: 2, max: 2 },
    { name: "Lemon", min: 1, max: 1 },
  ];

  const sb: string[] = Array.isArray(byType.summary.bullets) ? byType.summary.bullets.map((x: any) => String(x || "").trim()).filter(Boolean) : [];
  const filtered = sb.filter((b) => !/^fit:\s*/i.test(b));
  const summaryRest = padBulletList(filtered, 3, summaryPad(label), 4);
  byType.summary.bullets = [`Fit: ${fitName}`, ...summaryRest].slice(0, 5);

  byType.risk_flags.title = "Red Flags (Australia)";
  byType.risk_flags.severity = normalized === 1 ? "critical" : "warning";
  byType.risk_flags.bullets = padBulletList(byType.risk_flags.bullets, 3, riskPad(label), 5);

  byType.costs.title = "Running Costs Snapshot";
  byType.costs.severity = "info";
  if (!byType.costs.table || !Array.isArray(byType.costs.table.columns) || !Array.isArray(byType.costs.table.rows)) {
    byType.costs.table = { columns: ["Item", "What to expect"], rows: [] };
  }
  if (!byType.costs.table.columns.length) byType.costs.table.columns = ["Item", "What to expect"];
  const costRowsIn = Array.isArray(byType.costs.table.rows) ? byType.costs.table.rows : [];
  const goodCostRows = costRowsIn.filter(
    (r: any) => Array.isArray(r) && r.length >= 2 && String(r[0] ?? "").trim() && String(r[1] ?? "").trim(),
  );
  const costRowsDefault: string[][] = [
    [`${label} — scheduled service`, "Typical AU interval service; add if filters, fluids, or spark plugs are overdue."],
    ["Tyres & brakes", "Most owners feel these first — check pad life, shudder under braking, and tyre date codes."],
    ["Fluids & leaks", "Oil weeps, coolant stains, or dark ATF are leverage on price — don’t ignore them."],
  ];
  const mergedCostRows = [...goodCostRows];
  let cri = 0;
  while (mergedCostRows.length < 3 && cri < costRowsDefault.length) {
    mergedCostRows.push(costRowsDefault[cri]);
    cri++;
  }
  byType.costs.table.rows = mergedCostRows.slice(0, 6);
  byType.costs.bullets = padBulletList(byType.costs.bullets, 3, costsPad(label), 5);

  byType.checklist.title = "10-Minute Checks (Beginner)";
  byType.checklist.severity = "info";
  byType.checklist.bullets = padBulletList(byType.checklist.bullets, 3, checklistPad(label), 6);

  parsed.cards = wantOrder.map((t) => byType[t]);
  for (const c of parsed.cards) c.actions = [];
  return parsed;
}

function logAskWarning(stage: string, detail?: Record<string, unknown>) {
  try {
    console.error("[mechvi/ask]", stage, detail ? JSON.stringify(detail) : "");
  } catch {
    /* ignore */
  }
}

/** Prefer SDK output_text; if empty, stitch text parts from output[] (Responses API may omit output_text). */
function extractResponsesOutputText(resp: any): string {
  const direct = typeof resp?.output_text === "string" ? resp.output_text.trim() : "";
  if (direct) return direct;
  const out = resp?.output;
  if (!Array.isArray(out)) return "";
  const parts: string[] = [];
  for (const item of out) {
    if (item?.type === "message" && Array.isArray(item.content)) {
      for (const part of item.content) {
        if (typeof part?.text === "string") parts.push(part.text);
      }
    }
    if (typeof item?.text === "string") parts.push(item.text);
  }
  return parts.join("").trim();
}

function parseModelJsonText(raw: string): { parsed: unknown } | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    return { parsed: JSON.parse(t) };
  } catch {
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      try {
        return { parsed: JSON.parse(fence[1].trim()) };
      } catch {
        /* continue */
      }
    }
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return { parsed: JSON.parse(t.slice(start, end + 1)) };
      } catch {
        /* empty */
      }
    }
    return null;
  }
}

function buildFallbackResponse(mode: Mode, access: Access, vehicleLabel: string, reason: string) {
  const parsed = ensureQuickCards({
    vehicle_summary: { label: vehicleLabel, km: null, notes: [reason] },
  });
  if (mode === "quick" && access !== "SUBSCRIBER") {
    parsed.cta = {
      label: "Unlock the full $2.99 pre-purchase checklist (placeholder)",
      action_type: "paywall",
      payload: { product: "mechvi_report", price_aud: 2.99 },
    };
  }
  return parsed;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode: Mode = (body.mode || "quick") as Mode;

    const vp = body.vehicleProfile || {};
    const make = String(vp.make || "").trim();
    const model = String(vp.model || "").trim();
    const year = Number(vp.year || 0);
    const transmission = String(vp.transmission || "unknown");
    const fuel = String(vp.fuel || "unknown");
    const cylinders = String(vp.cylinders || "unknown");
    const km = vp.km === null || vp.km === undefined ? null : Number(vp.km);
    const locale = String(body.locale || "en-AU");
    const mk = monthKeyUTC();

    if (!make || !model || !year) {
      return NextResponse.json({ error: "Missing vehicleProfile fields (make/model/year)." }, { status: 400 });
    }

    const vehicleLabel = `${year} ${make} ${model}`.trim();

    // Determine access
    let access: Access = "FREE";
    let userId: string | null = null;
    let economy = false;

    const session = await auth();
    if (session?.user?.email) {
      const email = String(session.user.email).toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        userId = user.id;
        access = (user.tier === "SUBSCRIBER" ? "SUBSCRIBER" : user.tier === "REPORT" ? "PAY_PER_REPORT" : "FREE") as Access;
      }
    }

    // Paywall for anonymous report
    if (!userId && mode === "report") {
      return NextResponse.json(paywallResponse("report"), { status: 200 });
    }

    // Anonymous quick: small per-IP monthly cap (in-memory)
    if (!userId && mode === "quick") {
      const anonLimit = numEnv("MECHVI_ANON_IP_LIMIT", 3);
      const ip = getClientIp(req);
      if (getAnonQuickCount(ip, mk) >= anonLimit) {
        return NextResponse.json(paywallResponse("quick"), { status: 200 });
      }
    }

    // Usage limits for logged-in users (quota charged only after successful model response below)
    if (userId) {
      const freeLimit = numEnv("MECHVI_FREE_MONTHLY_LIMIT", 3);
      const subLimit = numEnv("MECHVI_SUBSCRIBER_MONTHLY_LIMIT", 300);

      const row = await prisma.usage.upsert({
        where: { userId_monthKey: { userId, monthKey: mk } },
        update: {},
        create: { userId, monthKey: mk, count: 0 },
      });

      const usageCount = row.count;

      if (access === "FREE" && mode === "quick" && usageCount >= freeLimit) {
        return NextResponse.json(paywallResponse("quick"), { status: 200 });
      }

      if (access === "SUBSCRIBER" && usageCount >= subLimit) economy = true;
    }

    const prompt =
      mode === "quick"
        ? buildQuickPrompt({ make, model, year, transmission, fuel, cylinders, km, locale })
        : `
You are MechVi — your mechanic in your pocket (Australia).
Write for a total beginner. Practical, no fluff.

Vehicle:
- ${year} ${make} ${model}
- Transmission=${transmission}, Fuel=${fuel}, Cylinders=${cylinders}, Km=${km ?? "unknown"}

Return JSON ONLY in the same schema as quick mode, but more detailed:
Include cards: summary, risk_flags, costs, checklist, plan.
In checklist, be step-by-step and detailed for a beginner.
In plan, give first 30 days actions + what to service first.
`.trim();

    const modelName = modelFor(access, economy);
    const max_output_tokens = maxOutFor(access, economy, mode);

    const resp = await client.responses.create({
      model: modelName,
      input: prompt,
      max_output_tokens,
      text: {
        format: {
          type: "json_schema",
          name: "mechvi_response_v1_2",
          schema: MECHVI_JSON_SCHEMA as any,
        },
      },
    });

    const jsonText = extractResponsesOutputText(resp);

    if (!jsonText) {
      logAskWarning("empty_model_output", {
        model: modelName,
        has_response_error: !!resp?.error,
      });
      return NextResponse.json(buildFallbackResponse(mode, access, vehicleLabel, "Model returned no text output."), {
        status: 200,
      });
    }

    const parsedJson = parseModelJsonText(jsonText);
    if (!parsedJson) {
      logAskWarning("json_parse_failed", {
        model: modelName,
        sample_len: jsonText.length,
      });
      return NextResponse.json(buildFallbackResponse(mode, access, vehicleLabel, "Could not parse model JSON."), {
        status: 200,
      });
    }

    let parsed: any = parsedJson.parsed;

    // Enforce quick structure before billing / response (avoid charging if normalization fails)
    if (mode === "quick") {
      try {
        parsed = parsed && typeof parsed === "object" ? parsed : {};
        const prevVs = typeof parsed.vehicle_summary === "object" && parsed.vehicle_summary ? parsed.vehicle_summary : {};
        parsed.vehicle_summary = { ...prevVs, label: vehicleLabel };
        parsed = ensureQuickCards(parsed);
      } catch (cardErr: any) {
        logAskWarning("ensure_quick_cards_failed", { name: cardErr?.name });
        return NextResponse.json(
          buildFallbackResponse(mode, access, vehicleLabel, "Could not normalize quick cards."),
          { status: 200 },
        );
      }
    }

    try {
      if (userId) {
        await prisma.usage.upsert({
          where: { userId_monthKey: { userId, monthKey: mk } },
          update: { count: { increment: 1 } },
          create: { userId, monthKey: mk, count: 1 },
        });
      } else if (mode === "quick") {
        recordAnonQuickSuccess(getClientIp(req), mk);
      }
    } catch (usageErr: any) {
      logAskWarning("usage_increment_failed", {
        model: modelName,
        code: usageErr?.code,
        name: usageErr?.name,
      });
    }

    // CTA enforcement
    if (mode === "quick" && access !== "SUBSCRIBER") {
      parsed.cta = { label: "Unlock the full $2.99 pre-purchase checklist (placeholder)", action_type: "paywall", payload: { product: "mechvi_report", price_aud: 2.99 } };
    }

    try {
      return NextResponse.json(parsed, { status: 200 });
    } catch (serializeErr: any) {
      logAskWarning("response_serialize_failed", { name: serializeErr?.name });
      return NextResponse.json(
        buildFallbackResponse(mode, access, vehicleLabel, "Response could not be serialized."),
        { status: 200 },
      );
    }
  } catch (e: any) {
    logAskWarning("ask_unhandled", {
      name: e?.name,
      message: typeof e?.message === "string" ? e.message.slice(0, 240) : undefined,
    });
    return NextResponse.json({ error: e?.message || "Ask failed" }, { status: 500 });
  }
}

