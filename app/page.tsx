import { auth } from "@/auth";
import Link from "next/link";
import HomeClient from "@/app/components/HomeClient";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <main style={{ maxWidth: 820, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
        <h1>MechVi</h1>
        <p>Your mechanic in your pocket — Australia MVP</p>
        <p><b>You are not logged in.</b></p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login">Login</Link>
          <Link href="/register">Create account</Link>
        </div>
      </main>
    );
  }

  return <HomeClient email={session.user.email} />;
}
