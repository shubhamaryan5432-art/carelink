import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Contact() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Contact us</h1>
      <p><b>Business:</b> {SITE.name}, operated by {SITE.owner} (sole proprietor)</p>
      <p><b>Phone:</b> {SITE.phone}</p>
      <p><b>Email:</b> {SITE.email}</p>
      <p><b>Address:</b> {SITE.address}</p>
      <h2>Grievance officer</h2>
      <p>{SITE.owner}, {SITE.email}, {SITE.phone}. Write to us about any complaint and we will reply as soon as we can.</p>
      <p>For cancellations and refunds, see the <Link href="/refund">Refund and Cancellation page</Link>.</p>
    </main>
  );
}
