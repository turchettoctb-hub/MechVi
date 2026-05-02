"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) return setErr("Invalid email or password.");
    router.push("/");
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Sign in</button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <p style={{ marginTop: 12 }}>No account? <a href="/register">Create one</a></p>
    </main>
  );
}
