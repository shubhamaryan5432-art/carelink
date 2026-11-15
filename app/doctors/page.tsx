import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Doctors({ searchParams }: { searchParams: Promise<{ speciality?: string }> }) {
  const { speciality } = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  let q = sb.from("doctor_directory").select("id, full_name, specialty, years_experience, fee_inr");
  if (speciality) q = q.ilike("specialty", `%${speciality.replace(/[%_]/g, "")}%`);
  const { data } = await q;
  const docs = data ?? [];

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>{speciality ? `Choose a ${speciality} doctor` : "Choose a doctor"}</h1>
      {docs.length === 0 && (
        <p>
          {speciality ? `No ${speciality} doctor is available yet. Please check back soon.` : "No doctors available yet."}{" "}
          {speciality && <Link href="/doctors">See all doctors</Link>}
        </p>
      )}
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
