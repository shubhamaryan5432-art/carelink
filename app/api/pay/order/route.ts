import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return fail("Please sign in.", 401);
  const body = await req.json().catch(() => ({}));
  const { data: appt } = await sb
    .from("appointments")
    .select("id, doctor_id, patient_id, status, created_at")
    .eq("id", String(body.appointmentId ?? ""))
    .maybeSingle();
  if (!appt || appt.patient_id !== user.id) return fail("Booking not found.", 404);
  if (appt.status !== "pending_payment") return fail("This booking is not waiting for payment.", 400);
  if (Date.now() - new Date(appt.created_at).getTime() > 20 * 60000) {
    return fail("This booking expired. Please book again.", 400);
  }
  const db = supabaseAdmin();
  const { data: doc } = await db.from("doctors").select("fee_inr").eq("id", appt.doctor_id).single();
  const amount = Number(doc?.fee_inr) || 0;
  if (amount < 1) return fail("This doctor's fee is not set.", 400);

  const basic = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      receipt: appt.id,
      notes: { appointment_id: appt.id },
    }),
  });
  const order = await r.json();
  if (!r.ok) return fail("Could not start payment. Please try again.", 502);
  await db.from("payments").insert({ appointment_id: appt.id, razorpay_order_id: order.id, amount_inr: amount });
  return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
}
