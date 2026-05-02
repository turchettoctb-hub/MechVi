"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "quick" | "report";

type Table = { columns: string[]; rows: string[][] };

type MechviCard = {
  type: string;
  title: string;
  severity: "info" | "warning" | "critical";
  bullets: string[];
  table?: Table;
  score?: { label: string; value: number | null; scale_max: number; bands: { name: string; min: number; max: number }[] };
  actions?: any[];
};

type MechviResponse = {
  meta?: any;
  status?: any;
  vehicle_summary?: { label: string; km: number | null; notes: string[] };
  cards?: MechviCard[];
  cta?: { label: string; action_type: string; payload: any };
};

function fitLabel(v: number | null | undefined) {
  if (v === 3) return "Good ✅";
  if (v === 2) return "Mixed 🤔";
  if (v === 1) return "Lemon 🍋";
  return "Mixed 🤔";
}

function badgeStyle(label: string) {
  if (label.startsWith("Good")) return { background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.35)", color: "rgba(220,252,231,1)" };
  if (label.startsWith("Lemon")) return { background: "rgba(239,68,68,0.16)", border: "1px solid rgba(239,68,68,0.35)", color: "rgba(254,226,226,1)" };
  return { background: "rgba(245,158,11,0.16)", border: "1px solid rgba(245,158,11,0.35)", color: "rgba(255,237,213,1)" };
}

function severityGlow(sev: string) {
  if (sev === "critical") return "0 0 0 1px rgba(239,68,68,0.35), 0 18px 60px rgba(239,68,68,0.08)";
  if (sev === "warning") return "0 0 0 1px rgba(245,158,11,0.35), 0 18px 60px rgba(245,158,11,0.06)";
  return "0 0 0 1px rgba(255,255,255,0.14), 0 18px 60px rgba(0,0,0,0.35)";
}

function Card({ c }: { c: MechviCard }) {
  const hasTable = c.table && Array.isArray(c.table.columns) && Array.isArray(c.table.rows) && c.table.rows.length > 0;

  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        background: "rgba(10,10,12,0.70)",
        backdropFilter: "blur(14px)",
        boxShadow: severityGlow(c.severity),
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 950, fontSize: 16, letterSpacing: -0.3 }}>{c.title || c.type}</div>
</div>

      {c.bullets?.length > 0 && (
        <ul style={{ margin: "10px 0 0", paddingLeft: 18, lineHeight: 1.45 }}>
          {c.bullets.map((b, i) => (
            <li key={i} style={{ marginBottom: 6, opacity: 0.92 }}>{b}</li>
          ))}
        </ul>
      )}

      {hasTable && (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                {c.table!.columns.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: "left",
                      padding: "10px 10px",
                      background: "rgba(255,255,255,0.06)",
                      borderTopLeftRadius: i === 0 ? 12 : 0,
                      borderTopRightRadius: i === c.table!.columns.length - 1 ? 12 : 0,
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderBottom: "none",
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: 900,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.table!.rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "10px 10px",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderTop: "none",
                        background: "rgba(255,255,255,0.03)",
                        color: "rgba(255,255,255,0.92)",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function VehicleForm({ initial, autoRun }: { initial?: any; autoRun?: Mode }) {
  const [data, setData] = useState<MechviResponse | null>(null);
  const [raw, setRaw] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [statusLine, setStatusLine] = useState("Ready");
  const [showRaw, setShowRaw] = useState(false);

  const profile = useMemo(() => {
    if (!initial?.make || !initial?.model || !initial?.year) return null;
    return {
      make: String(initial.make),
      model: String(initial.model),
      year: Number(initial.year),
      transmission: String(initial.transmission || "unknown"),
      fuel: String(initial.fuel || "unknown"),
      cylinders: String(initial.cylinders || "unknown"),
      km: initial.km === null || initial.km === undefined ? null : Number(initial.km),
    };
  }, [initial?.make, initial?.model, initial?.year, initial?.transmission, initial?.fuel, initial?.cylinders, initial?.km]);

  const summaryCard = useMemo(() => (data?.cards || []).find((c) => c.type === "summary") || null, [data]);
  const fit = useMemo(() => fitLabel(summaryCard?.score?.value ?? null), [summaryCard]);

  async function submitProfile(mode: Mode) {
    if (!profile) return;

    setLoading(true);
    setData(null);
    setRaw("");
    setStatusLine("Working...");

    try {
      const payload = { mode, locale: "en-AU", intentHint: "buy", vehicleProfile: profile };
      const r = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const text = await r.text();
      setStatusLine(`HTTP ${r.status} ${r.ok ? "OK" : "ERROR"}`);
      setRaw(text || "(empty)");

      if (r.ok && text) {
        try { setData(JSON.parse(text)); } catch {}
      }
    } catch (e: any) {
      setStatusLine("Request failed");
      setRaw(String(e?.message || e || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoRun) return;
    if (!profile) return;
    submitProfile(autoRun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, profile?.make, profile?.model, profile?.year]);

  const title = data?.vehicle_summary?.label || (profile ? `${profile.year} ${profile.make} ${profile.model}` : "Your Verdict");

  return (
    <div style={{ padding: 16, borderRadius: 20, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 24px 90px rgba(0,0,0,0.45)", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 950, fontSize: 18, letterSpacing: -0.4 }}>{title}</div>
          {summaryCard?.score && (
            <div style={{ padding: "6px 10px", borderRadius: 999, fontWeight: 950, fontSize: 12, ...badgeStyle(fit) }}>
              {fit}
            </div>
          )}
          <div style={{ opacity: 0.75, fontSize: 12 }}>
            {profile ? `${profile.transmission} • ${profile.fuel} • ${profile.cylinders} cyl` : ""}
          </div>
        </div>
        <div style={{ opacity: 0.75, fontSize: 12 }}>{statusLine}</div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button disabled={!profile || loading} onClick={() => submitProfile("quick")}
          style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "#0b0b0d", color: "#fff", fontWeight: 950, cursor: "pointer" }}>
          {loading ? "Working..." : "Quick verdict (Free)"}
        </button>

        <button disabled={!profile || loading} onClick={() => submitProfile("report")}
          style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
          Full report $2.99 (placeholder)
        </button>

        <button onClick={() => setShowRaw((s) => !s)}
          style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.92)", fontWeight: 900, cursor: "pointer" }}>
          {showRaw ? "Hide debug" : "Show debug"}
        </button>
      </div>

      {data?.cards?.length ? (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {data.cards.map((c, i) => <Card key={i} c={c} />)}
        </div>
      ) : null}

      {showRaw && (
        <pre style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.92)", whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12 }}>
          {raw || "(no response yet)"}
        </pre>
      )}
    </div>
  );
}

