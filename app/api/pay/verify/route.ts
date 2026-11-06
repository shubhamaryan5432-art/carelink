import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { markPaid, sigOk } from "@/lib/payments";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return fail("Please sign in.", 401);
  const b = await req.json().catch(() => ({}));
  const orderId = String(b.razorpay_order_id ?? "");
  const paymentId = String(b.razorpay_payment_id ?? "");
  const sig = String(b.razorpay_signature ?? "");
  if (!sigOk(`${orderId}|${paymentId}`, sig, process.env.RAZORPAY_KEY_SECRET!)) {
    return fail("Payment could not be verified.", 400);
  }
  const { data: pay } = await supabaseAdmin()
    .from("payments").select("appointment_id").eq("razorpay_order_id", orderId).maybeSingle();
  if (!pay) return fail("Payment not found.", 404);
  const { data: appt } = await sb.from("appointments").select("patient_id").eq("id", pay.appointment_id).maybeSingle();
  if (!appt || appt.patient_id !== user.id) return fail("Not allowed.", 403);
  await markPaid(orderId, paymentId);
  return NextResponse.json({ ok: true });
}
