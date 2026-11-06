import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Doctors() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await sb
    .from("doctor_directory")
    .select("id, full_name, specialty, years_experience, fee_inr");
  const docs = data ?? [];

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>Choose a doctor</h1>
      {docs.length === 0 && <p>No doctors available yet.</p>}
      {docs.map((d) => (
        <div key={d.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, margin: "12px 0" }}>
          <b>{d.full_name ?? "Doctor"}</b>
          <div>{d.specialty}, {d.years_experience ?? 0} yrs</div>
          <div>Fee: ₹{d.fee_inr}</div>
          <p><Link href={`/book/${d.id}`}>See times and book</Link></p>
        </div>
      ))}
    </main>
  );
}
