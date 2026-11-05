import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h1>CareLink</h1>
      <p>See a doctor on video.</p>
      <p><Link href="/login">Sign in</Link></p>
      <p><Link href="/doctor/apply">Apply as a doctor</Link></p>
      <p><Link href="/admin">Admin</Link></p>
    </main>
  );
}
