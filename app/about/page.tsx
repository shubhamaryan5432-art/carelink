import Link from "next/link";
import { SITE } from "@/lib/site";

export default function About() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, lineHeight: 1.6 }}>
      <h1>About {SITE.name}</h1>
      <p>{SITE.name} is an online service for video consultations with a registered doctor. You book a time, pay by UPI, consult by video, and receive an electronic prescription.</p>
      <p>The service is run by {SITE.owner} as an individual (sole proprietor) from {SITE.address}.</p>
      <p>Consultations are given by registered medical practitioners. A video consultation does not replace an in-person examination, and it is not for emergencies. In an emergency, call 112 or go to the nearest hospital.</p>
      <p>Questions? See our <Link href="/contact">Contact page</Link>.</p>
    </main>
  );
}
