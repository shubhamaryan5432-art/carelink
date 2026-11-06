import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import PrintButton from "./PrintButton";

const IST = "Asia/Kolkata";
type DocInfo = {
  name: string | null; qualification: string | null; specialty: string | null;
  registration_council: string | null; registration_number: string | null;
  contact_phone: string | null; contact_email: string | null; signature: string | null;
};
type Vitals = { bp?: string | null; pulse?: string | null; temp?: string | null; spo2?: string | null };
type Rx = {
  patient_id: string; diagnosis: string; medicines: string[]; advice: string | null; follow_up: string | null;
  patient_age: number | null; patient_gender: string | null; weight_kg: number | null; height_cm: number | null;
  vitals: Vitals | null; past_history: string | null; family_history: string | null; investigations: string | null;
  doctor_info: DocInfo | null; signed_at: string;
};
type SlotRow = { starts_at: string };

const NOTES = [
  "This prescription is issued through a teleconsultation by the RMP based on information shared by the patient/ caregiver.",
  "The diagnosis and treatment are provisional. An in-person visit to a registered medical practitioner is advised for thorough examination.",
  "The prescription is valid only for the period and dosage advised.",
  "The contents of this prescription are confidential and meant solely for the intended recipient. It is not valid for medico-legal purposes.",
];

function Row({ k, v }: { k: string; v: string | number | null | undefined }) {
  if (v === null || v === undefined || v === "") return null;
  return <div style={{ margin: "4px 0" }}><b>{k}:</b> {v}</div>;
}

export default async function PrescriptionView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await sb.from("prescriptions").select("*").eq("appointment_id", id).maybeSingle();
  const rx = data as Rx | null;
  if (!rx) redirect("/appointments");
  const { data: pt } = await sb.from("profiles").select("full_name").eq("id", rx.patient_id).maybeSingle();
  const { data: ap } = await sb.from("appointments").select("slots(starts_at)").eq("id", id).maybeSingle();
  const s = (ap as unknown as { slots: SlotRow | SlotRow[] | null } | null)?.slots;
  const slot = Array.isArray(s) ? s[0] : s;

  const di = rx.doctor_info;
  const v = rx.vitals ?? {};
  const bmi = rx.weight_kg && rx.height_cm ? (rx.weight_kg / Math.pow(rx.height_cm / 100, 2)).toFixed(1) : null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  const drName = di?.name ? (/^dr\.?\s/i.test(di.name) ? di.name : `Dr. ${di.name}`) : "Doctor";

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <style>{`@media print { .no-print { display: none !important; } main { margin: 0 !important; padding: 0 !important; } }`}</style>
      <div className="no-print" style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link href="/appointments">Back</Link>
        <PrintButton />
      </div>
      <div style={{ border: "1px solid #333", padding: 20, marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, borderBottom: "2px solid #333", paddingBottom: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>{drName}</h2>
            {di?.qualification && <div>{di.qualification}</div>}
            {di?.specialty && <div>{di.specialty}</div>}
            {di?.registration_number && <div>Reg. No: {di.registration_council} / {di.registration_number}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            {di?.contact_phone && <div>Phone: {di.contact_phone}</div>}
            {di?.contact_email && <div>{di.contact_email}</div>}
            <div>CareLink teleconsultation</div>
          </div>
        </div>

        <div style={{ margin: "12px 0" }}>
          <Row k="Patient" v={pt?.full_name} />
          <Row k="Age" v={rx.patient_age} />
          <Row k="Gender" v={rx.patient_gender} />
          <Row k="Weight" v={rx.weight_kg ? `${rx.weight_kg} kg` : null} />
          <Row k="Height" v={rx.height_cm ? `${rx.height_cm} cm` : null} />
          <Row k="BMI" v={bmi} />
          <Row k="Consultation" v={slot ? fmt(slot.starts_at) + " (IST)" : null} />
        </div>

        {(v.bp || v.pulse || v.temp || v.spo2) && (
          <div style={{ margin: "12px 0" }}>
            <b>Vitals (as reported)</b>
            <Row k="BP" v={v.bp} />
            <Row k="Pulse" v={v.pulse} />
            <Row k="Temperature" v={v.temp} />
            <Row k="SpO2" v={v.spo2} />
          </div>
        )}

        <Row k="Past history" v={rx.past_history} />
        <Row k="Family history" v={rx.family_history} />
        <Row k="Investigations" v={rx.investigations} />
        <Row k="Diagnosis (provisional)" v={rx.diagnosis} />

        <div style={{ margin: "12px 0" }}>
          <b>Medicines</b>
          <ol>{(rx.medicines ?? []).map((m, i) => <li key={i}>{m}</li>)}</ol>
        </div>
        <Row k="Advice" v={rx.advice} />
        <Row k="Follow-up" v={rx.follow_up} />

        <div style={{ marginTop: 24, textAlign: "right" }}>
          {di?.signature && <img src={di.signature} alt="Doctor signature" style={{ maxWidth: 220, height: "auto" }} />}
          <div><b>{drName}</b></div>
          {di?.registration_number && <div>Reg. No: {di.registration_council} / {di.registration_number}</div>}
          <div style={{ fontSize: 13 }}>Electronically signed on {fmt(rx.signed_at)} (IST)</div>
        </div>

        <div style={{ marginTop: 20, borderTop: "1px solid #999", paddingTop: 10, fontSize: 13 }}>
          <b>Note:</b>
          <ol>{NOTES.map((n, i) => <li key={i}>{n}</li>)}</ol>
        </div>
      </div>
    </main>
  );
}
