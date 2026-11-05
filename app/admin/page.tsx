import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function decide(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  await sb.rpc("approve_doctor", {
    target: String(formData.get("id")),
    approve: formData.get("approve") === "1",
  });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <h1>Doctor applications</h1>
      {rows.length === 0 && <p>No pending applications.</p>}
      {rows.map((d) => (
        <form key={d.id} action={decide} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, margin: "12px 0" }}>
          <input type="hidden" name="id" value={d.id} />
          <b>{d.profiles?.full_name ?? "Unnamed"}</b> ({d.profiles?.phone})
          <div>{d.specialty}, {d.years_experience} yrs, ₹{d.fee_inr}</div>
          <div>Registration: {d.registration_council} / {d.registration_number}</div>
          <button name="approve" value="1">Approve</button>{" "}
          <button name="approve" value="0">Reject</button>
        </form>
      ))}
    </main>
  );
}
