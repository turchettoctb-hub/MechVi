import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
  try {
    const key = process.env.OPENAI_API_KEY || "";
    if (!key || key.length < 10) {
      return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing in .env.local" }, { status: 500 });
    }

    const client = new OpenAI({ apiKey: key });

    const resp = await client.responses.create({
      model: process.env.MECHVI_MODEL_FREE || "gpt-5-nano",
      input: "Reply with the single word OK.",
      max_output_tokens: 20,
    });

    // @ts-ignore
    const out = resp.output_text || "";
    const text = String(out).trim();

    return NextResponse.json({ ok: true, model: process.env.MECHVI_MODEL_FREE || "gpt-5-nano", sample: text || "(empty)" });
  } catch (e: any) {
    // Return safe error message (no secrets)
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error", name: e?.name || "Error" },
      { status: 500 }
    );
  }
}
