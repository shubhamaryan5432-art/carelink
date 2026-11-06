import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

type Person = { full_name: string | null; phone: string | null };
type Row = {
  id: string;
  specialty: string;
  registration_council: string;
  registration_number: string;
  years_experience: number | null;
  fee_inr: number;
  profiles: Person | Person[] | null;
};

async function decide(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  const approve = String(formData.get("decision")) === "approve";
  const { error } = await sb.rpc("approve_doctor", {
    target: String(formData.get("id")),
    approve,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export default async function Admin() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/");

  const { data } = await sb
    .from("doctors")
    .select("id, specialty, registration_council, registration_number, years_experience, fee_inr, profiles(full_name, phone)")
    .eq("status", "pending");
  const rows = (data ?? []) as unknown as Row[];

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <h1>Doctor applications</h1>
      {rows.length === 0 && <p>No pending applications.</p>}
      {rows.map((d) => {
        const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
        return (
          <div key={d.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, margin: "12px 0" }}>
            <b>{p?.full_name ?? "Unnamed"}</b> ({p?.phone})
            <div>{d.specialty}, {d.years_experience} yrs, ₹{d.fee_inr}</div>
            <div>Registration: {d.registration_council} / {d.registration_number}</div>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <form action={decide}>
                <input type="hidden" name="id" value={d.id} />
                <input type="hidden" name="decision" value="approve" />
                <button type="submit">Approve</button>
              </form>
              <form action={decide}>
                <input type="hidden" name="id" value={d.id} />
                <input type="hidden" name="decision" value="reject" />
                <button type="submit">Reject</button>
              </form>
            </div>
          </div>
        );
      })}
    </main>
  );
}
