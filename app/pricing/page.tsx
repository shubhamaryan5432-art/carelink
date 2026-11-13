import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Pricing() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Pricing</h1>
      <p>A video consultation of about 15 minutes costs {SITE.fee}. Payment is in Indian rupees (INR), by UPI, when you book.</p>
      <p>The fee is shown on the booking page before you pay. The amount shown at checkout is the full amount you pay, with no other charges from us.</p>
      <p>Your booking is confirmed only after payment succeeds. If you do not pay within 20 minutes, the time slot is released.</p>
      <p>Prices may change. A new price applies only to future bookings.</p>
      <p>Cancellations and refunds: see the <Link href="/refund">Refund and Cancellation page</Link>.</p>
    </main>
  );
}
