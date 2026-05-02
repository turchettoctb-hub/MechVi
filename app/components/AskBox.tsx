"use client";

import { useState } from "react";

type AskMode = "basic" | "report";

export default function AskBox() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<AskMode>("basic");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<string>("");

  async function ask(selectedMode: AskMode) {
    setMode(selectedMode);
    setLoading(true);
    setOut("");

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: q, mode: selectedMode, locale: "en-AU", intentHint: "unknown" }),
      });

      const text = await r.text();
      try {
        const j = JSON.parse(text);
        setOut(JSON.stringify(j, null, 2));
      } catch {
        setOut(text);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <b>Ask MechVi</b>
        <span style={{ opacity: 0.7, fontSize: 12 }}>FREE is limited to 3 questions/month.</span>
      </div>

      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder='Try: "Is a used BMW 3 Series a good buy in Australia?"'
        style={{ width: "100%", marginTop: 10, minHeight: 90, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => ask("basic")}
          disabled={loading || q.trim().length < 3}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}
        >
          {loading && mode === "basic" ? "Thinking..." : "Ask (Free)"}
        </button>

        <button
          onClick={() => ask("report")}
          disabled={loading || q.trim().length < 3}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#fff", color: "#111" }}
        >
          {loading && mode === "report" ? "Building report..." : "Get $2.99 Report (placeholder)"}
        </button>
      </div>

      <pre style={{ marginTop: 12, padding: 12, background: "#fafafa", border: "1px solid #eee", borderRadius: 12, whiteSpace: "pre-wrap" }}>
        {out || "Response will show here (JSON)."}
      </pre>
    </div>
  );
}
