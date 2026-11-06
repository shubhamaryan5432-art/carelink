import { markPaid, sigOk } from "@/lib/payments";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!sigOk(raw, sig, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
    return new Response("bad signature", { status: 400 });
  }
  const evt = JSON.parse(raw);
  const p = evt?.payload?.payment?.entity;
  if ((evt.event === "payment.captured" || evt.event === "order.paid") && p?.order_id) {
    await markPaid(p.order_id, p.id);
  }
  return new Response("ok");
}
