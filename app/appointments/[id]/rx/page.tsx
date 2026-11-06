import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

async function saveRx(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id"));
  const back = `/appointments/${id}/rx`;
  const { data: appt } = await sb
    .from("appointments")
    .select("patient_id, doctor_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!appt || appt.doctor_id !== user.id) redirect("/appointments");
  const medicines = String(formData.get("medicines") ?? "")
    .split("\n").map((m) => m.trim()).filter(Boolean).slice(0, 20);
  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  if (!diagnosis || medicines.length === 0) {
    redirect(`${back}?error=${encodeURIComponent("Enter a diagnosis and at least one medicine.")}`);
  }
  const { error } = await sb.from("prescriptions").insert({
    appointment_id: id,
    patient_id: appt.patient_id,
    diagnosis,
    medicines,
    advice: String(formData.get("advice") ?? "").trim() || null,
    follow_up: String(formData.get("follow_up") ?? "").trim() || null,
  });
  if (error) redirect(`${back}?error=${encodeURIComponent("Could not save the prescription.")}`);
  redirect("/appointments");
}

export default async function RxPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: appt } = await sb
    .from("appointments")
    .select("doctor_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!appt || appt.doctor_id !== user.id) redirect("/appointments");

  const box = { display: "block", width: "100%" } as const;
  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>Write prescription</h1>
      <form action={saveRx} style={{ display: "grid", gap: 12 }}>
        <input type="hidden" name="id" value={id} />
        <label>Diagnosis<input name="diagnosis" required style={box} /></label>
        <label>Medicines (one per line: name, dose, how long)<textarea name="medicines" rows={5} required style={box} /></label>
        <label>Advice<textarea name="advice" rows={3} style={box} /></label>
        <label>Follow-up<input name="follow_up" style={box} /></label>
        <button type="submit">Save prescription</button>
        {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}
      </form>
    </main>
  );
}
