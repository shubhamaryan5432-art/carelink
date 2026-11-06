import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const IST = "Asia/Kolkata";
type Slot = { starts_at: string; ends_at: string };
type Appt = {
  id: string;
  status: string;
  reason: string | null;
  patient_id: string;
  doctor_id: string;
  created_at: string;
  slots: Slot | Slot[] | null;
};
const LABEL: Record<string, string> = {
  pending_payment: "Waiting for payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled (not paid in time)",
};

export default async function Appointments() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  await sb.rpc("expire_unpaid");
  const { data } = await sb
    .from("appointments")
    .select("id, status, reason, patient_id, doctor_id, created_at, slots(starts_at, ends_at)")
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
  const { data: rxs } = await sb
    .from("prescriptions")
    .select("appointment_id")
    .in("appointment_id", appts.map((a) => a.id));
  const names = new Map<string, string>();
  (dirs ?? []).forEach((d) => names.set(d.id, d.full_name ?? "Doctor"));
  (pats ?? []).forEach((p) => names.set(p.id, p.full_name ?? "Patient"));
  const hasRx = new Set((rxs ?? []).map((r) => r.appointment_id));

  const slotOf = (s: Appt["slots"]) => (Array.isArray(s) ? s[0] : s);
  const now = Date.now();

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>My appointments</h1>
      <p><Link href="/doctors">Book another</Link></p>
      {appts.length === 0 && <p>No appointments yet.</p>}
      {appts.map((a) => {
        const s = slotOf(a.slots);
        const start = s ? new Date(s.starts_at).getTime() : 0;
        const end = s ? new Date(s.ends_at).getTime() : 0;
        const live = a.status === "confirmed" && now >= start - 10 * 60000 && now <= end + 15 * 60000;
        const isDoctor = a.doctor_id === user.id;
        const room = `https://meet.jit.si/carelink-${a.id.replace(/-/g, "")}`;
        return (
          <div key={a.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, margin: "12px 0" }}>
            <b>{isDoctor ? names.get(a.patient_id) : names.get(a.doctor_id)}</b>
            <div>
              {s
                ? new Date(s.starts_at).toLocaleString("en-IN", {
                    timeZone: IST, weekday: "short", day: "numeric", month: "short",
                    hour: "numeric", minute: "2-digit",
                  })
                : ""}{" "}(IST)
            </div>
            {a.reason && <div>Reason: {a.reason}</div>}
            <div>{LABEL[a.status] ?? a.status}</div>
            {!isDoctor && a.status === "pending_payment" && (
              <p><Link href={`/pay/${a.id}`}><b>Pay now to confirm</b></Link></p>
            )}
            {a.status === "confirmed" && (
              live ? (
                <p><a href={room} target="_blank" rel="noopener noreferrer"><b>Join video consult</b></a></p>
              ) : (
                <p>The video link opens 10 minutes before the start time.</p>
              )
            )}
            {isDoctor && !hasRx.has(a.id) && (a.status === "confirmed" || a.status === "completed") && (
              <p><Link href={`/appointments/${a.id}/rx`}>Write prescription</Link></p>
            )}
            {hasRx.has(a.id) && (
              <p><Link href={`/appointments/${a.id}/prescription`}><b>View prescription</b></Link></p>
            )}
          </div>
        );
      })}
    </main>
  );
}
