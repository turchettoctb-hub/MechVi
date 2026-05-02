"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const r = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const j = await r.json();
    if (!r.ok) return setErr(j?.error || "Register failed");

    setOk(true);
    setTimeout(() => router.push("/login"), 600);
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Create account</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password (min 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {ok && <p style={{ color: "green" }}>Account created. Redirecting…</p>}
      <p style={{ marginTop: 12 }}><a href="/login">Back to login</a></p>
    </main>
  );
}
