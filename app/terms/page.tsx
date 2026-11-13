import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Terms() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Terms and Conditions</h1>
      <p>Last updated: {SITE.updated}. By using {SITE.name} you agree to these terms.</p>
      <h2>The service</h2>
      <p>{SITE.name}, run by {SITE.owner} (sole proprietor), lets you book a video consultation with a registered doctor and receive an electronic prescription. The service is delivered online. Nothing is shipped.</p>
      <h2>Not for emergencies</h2>
      <p>This service is not for emergencies. In an emergency call 112 or go to the nearest hospital.</p>
      <h2>Nature of teleconsultation</h2>
      <p>Advice is based on what you tell the doctor. Any diagnosis and treatment are provisional, and the doctor may advise an in-person visit. A prescription is valid only for the period and dosage advised.</p>
      <h2>Your responsibilities</h2>
      <ul>
        <li>You are 18 or older, or booking for a child as their parent or guardian.</li>
        <li>You give correct and complete information about yourself and your health.</li>
        <li>You keep your login code private and use the service lawfully.</li>
      </ul>
      <h2>Payments</h2>
      <p>Payments are in INR, by UPI, through Razorpay. A booking is confirmed only after payment succeeds. See our <Link href="/pricing">Pricing</Link> and <Link href="/refund">Refund and Cancellation</Link> pages.</p>
      <h2>Liability</h2>
      <p>To the extent the law allows, we are not liable for loss arising from the use of the service, or from delays or technical problems outside our control, beyond the fee you paid for the consultation concerned.</p>
      <h2>Changes and law</h2>
      <p>We may update these terms, and the updated date above will change. These terms are governed by the laws of India, and the courts at Vaishali, Bihar have jurisdiction.</p>
      <p>Contact: {SITE.email}, {SITE.phone}.</p>
    </main>
  );
}
