import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const IST = "Asia/Kolkata";
type Slot = { starts_at: string };
type Appt = {
  id: string;
  status: string;
  reason: string | null;
  patient_id: string;
  doctor_id: string;
  slots: Slot | Slot[] | null;
};
const LABEL: Record<string, string> = {
  pending_payment: "Booked, payment step coming soon",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function Appointments() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await sb
    .from("appointments")
    .select("id, status, reason, patient_id, doctor_id, slots(starts_at)")
    .order("created_at", { ascending: false });
  const appts = (data ?? []) as unknown as Appt[];

  const { data: dirs } = await sb
    .from("doctor_directory")
    .select("id, full_name")
    .in("id", appts.map((a) => a.doctor_id));
  const { data: pats } = await sb
    .from("profiles")
    .select("id, full_name")
    .in("id", appts.map((a) => a.patient_id));
  const names = new Map<string, string>();
  (dirs ?? []).forEach((d) => names.set(d.id, d.full_name ?? "Doctor"));
  (pats ?? []).forEach((p) => names.set(p.id, p.full_name ?? "Patient"));

  const when = (s: Appt["slots"]) => {
    const one = Array.isArray(s) ? s[0] : s;
    return one
      ? new Date(one.starts_at).toLocaleString("en-IN", {
          timeZone: IST, weekday: "short", day: "numeric", month: "short",
          hour: "numeric", minute: "2-digit",
        })
      : "";
  };

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>My appointments</h1>
      <p><Link href="/doctors">Book another</Link></p>
      {appts.length === 0 && <p>No appointments yet.</p>}
      {appts.map((a) => (
        <div key={a.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, margin: "12px 0" }}>
          <b>{a.patient_id === user.id ? names.get(a.doctor_id) : names.get(a.patient_id)}</b>
          <div>{when(a.slots)} (IST)</div>
          {a.reason && <div>Reason: {a.reason}</div>}
          <div>{LABEL[a.status] ?? a.status}</div>
        </div>
      ))}
    </main>
  );
}
