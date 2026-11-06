import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import PayButton from "./PayButton";

type Slot = { starts_at: string };

export default async function Pay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  await sb.rpc("expire_unpaid");

  const { data: appt } = await sb
    .from("appointments")
    .select("id, doctor_id, patient_id, status, slots(starts_at)")
    .eq("id", id)
    .maybeSingle();
  if (!appt || appt.patient_id !== user.id || appt.status !== "pending_payment") redirect("/appointments");

  const { data: doc } = await sb
    .from("doctor_directory")
    .select("full_name, fee_inr")
    .eq("id", appt.doctor_id)
    .maybeSingle();
  const raw = appt.slots as unknown as Slot | Slot[] | null;
  const slot = Array.isArray(raw) ? raw[0] : raw;
  const when = slot
    ? new Date(slot.starts_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short",
        hour: "numeric", minute: "2-digit",
      })
    : "";

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>Pay to confirm</h1>
      <p><b>{doc?.full_name ?? "Doctor"}</b><br />{when} (IST)</p>
      <p>Fee: <b>₹{doc?.fee_inr}</b></p>
      <p>Your time is held for 20 minutes. Pay by UPI to confirm it.</p>
      <PayButton appointmentId={id} amount={Number(doc?.fee_inr) || 0} />
      <p><Link href="/appointments">Back to my appointments</Link></p>
    </main>
  );
}
