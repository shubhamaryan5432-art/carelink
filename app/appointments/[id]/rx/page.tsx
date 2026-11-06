import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const num = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const txt = (v: FormDataEntryValue | null, max = 1000) => String(v ?? "").trim().slice(0, max) || null;

async function saveRx(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id"));
  const back = `/appointments/${id}/rx`;
  const fail = (m: string) => redirect(`${back}?error=${encodeURIComponent(m)}`);

  const { data: appt } = await sb.from("appointments").select("patient_id, doctor_id").eq("id", id).maybeSingle();
  if (!appt || appt.doctor_id !== user.id) redirect("/appointments");
  const { data: doc } = await sb
    .from("doctors")
    .select("specialty, registration_council, registration_number, qualification, contact_phone, contact_email, signature")
    .eq("id", user.id)
    .single();
  const { data: me } = await sb.from("profiles").select("full_name").eq("id", user.id).single();
  if (!doc?.signature || !doc.contact_phone) {
    redirect("/doctor/profile?error=" + encodeURIComponent("Add your contact number and signature first."));
  }

  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  const medicines = String(formData.get("medicines") ?? "")
    .split("\n").map((m) => m.trim()).filter(Boolean).slice(0, 20);
  if (!diagnosis || medicines.length === 0) fail("Enter a diagnosis and at least one medicine.");

  const age = num(formData.get("age"));
  const weight = num(formData.get("weight"));
  const height = num(formData.get("height"));
  const gender = String(formData.get("gender") ?? "");

  const { error } = await sb.from("prescriptions").insert({
    appointment_id: id,
    patient_id: appt.patient_id,
    diagnosis,
    medicines,
    advice: txt(formData.get("advice")),
    follow_up: txt(formData.get("follow_up"), 200),
    patient_age: age !== null && age >= 0 && age <= 120 ? Math.round(age) : null,
    patient_gender: ["Male", "Female", "Other"].includes(gender) ? gender : null,
    weight_kg: weight !== null && weight > 0 && weight <= 500 ? weight : null,
    height_cm: height !== null && height > 0 && height <= 300 ? height : null,
    vitals: {
      bp: txt(formData.get("bp"), 20),
      pulse: txt(formData.get("pulse"), 10),
      temp: txt(formData.get("temp"), 10),
      spo2: txt(formData.get("spo2"), 10),
    },
    past_history: txt(formData.get("past_history")),
    family_history: txt(formData.get("family_history")),
    investigations: txt(formData.get("investigations")),
    doctor_info: {
      name: me?.full_name ?? null,
      qualification: doc.qualification,
      specialty: doc.specialty,
      registration_council: doc.registration_council,
      registration_number: doc.registration_number,
      contact_phone: doc.contact_phone,
      contact_email: doc.contact_email,
      signature: doc.signature,
    },
  });
  if (error) fail("Could not save the prescription.");
  redirect(`/appointments/${id}/prescription`);
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
  const { data: appt } = await sb.from("appointments").select("doctor_id, patient_id").eq("id", id).maybeSingle();
  if (!appt || appt.doctor_id !== user.id) redirect("/appointments");
  const { data: existing } = await sb.from("prescriptions").select("id").eq("appointment_id", id).maybeSingle();
  if (existing) redirect(`/appointments/${id}/prescription`);
  const { data: doc } = await sb.from("doctors").select("signature, contact_phone").eq("id", user.id).single();
  const { data: pt } = await sb.from("profiles").select("full_name").eq("id", appt.patient_id).maybeSingle();

  if (!doc?.signature || !doc.contact_phone) {
    return (
      <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
        <h1>Set up your profile first</h1>
        <p>Add your contact number and signature once. They appear on every prescription.</p>
        <p><Link href="/doctor/profile">Open my doctor profile</Link></p>
      </main>
    );
  }

  const box = { display: "block", width: "100%" } as const;
  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>Write prescription</h1>
      <p>Patient: <b>{pt?.full_name ?? "Patient"}</b></p>
      <form action={saveRx} style={{ display: "grid", gap: 12 }}>
        <input type="hidden" name="id" value={id} />
        <fieldset><legend><b>Patient details</b></legend>
          <label>Age (years)<input name="age" type="number" min={0} max={120} style={box} /></label>
          <label>Gender
            <select name="gender" style={box} defaultValue="">
              <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          </label>
          <label>Weight (kg)<input name="weight" type="number" step="0.1" style={box} /></label>
          <label>Height (cm)<input name="height" type="number" step="0.1" style={box} /></label>
        </fieldset>
        <fieldset><legend><b>Vitals (as reported by patient)</b></legend>
          <label>BP (e.g. 120/80)<input name="bp" style={box} /></label>
          <label>Pulse (per min)<input name="pulse" style={box} /></label>
          <label>Temperature<input name="temp" style={box} /></label>
          <label>SpO2 (%)<input name="spo2" style={box} /></label>
        </fieldset>
        <label>Past illness history<textarea name="past_history" rows={3} style={box} /></label>
        <label>Family history<textarea name="family_history" rows={3} style={box} /></label>
        <label>Investigations (if any)<textarea name="investigations" rows={3} style={box} /></label>
        <label>Diagnosis (provisional)<input name="diagnosis" required style={box} /></label>
        <label>Medicines (one per line: name, dose, how long)<textarea name="medicines" rows={5} required style={box} /></label>
        <label>Advice<textarea name="advice" rows={3} style={box} /></label>
        <label>Follow-up<input name="follow_up" style={box} /></label>
        <button type="submit">Sign and save prescription</button>
        {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}
      </form>
    </main>
  );
                              }
