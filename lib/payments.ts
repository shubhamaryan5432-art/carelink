import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

export function sigOk(payload: string, sig: string, secret: string) {
  const expected = Buffer.from(createHmac("sha256", secret).update(payload).digest("hex"));
  const given = Buffer.from(sig || "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function markPaid(orderId: string, paymentId: string) {
  const db = supabaseAdmin();
  const { data: pay } = await db
    .from("payments").select("id, appointment_id, status").eq("razorpay_order_id", orderId).maybeSingle();
  if (!pay) return false;
  if (pay.status === "paid") return true;
  const { data: appt } = await db.from("appointments").select("status").eq("id", pay.appointment_id).single();
  const now = new Date().toISOString();
  if (appt?.status === "pending_payment") {
    await db.from("appointments").update({ status: "confirmed" }).eq("id", pay.appointment_id);
    await db.from("payments").update({ status: "paid", razorpay_payment_id: paymentId, paid_at: now }).eq("id", pay.id);
  } else if (appt?.status === "confirmed" || appt?.status === "completed") {
    await db.from("payments").update({ status: "paid", razorpay_payment_id: paymentId, paid_at: now }).eq("id", pay.id);
  } else {
    // paid after the booking expired: needs a manual refund
    await db.from("payments").update({ status: "needs_refund", razorpay_payment_id: paymentId }).eq("id", pay.id);
  }
  return true;
}
