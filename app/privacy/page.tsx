import { SITE } from "@/lib/site";

export default function Privacy() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {SITE.updated}. This explains what {SITE.name} collects and why.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Your name and your email address or mobile number, to log you in and contact you.</li>
        <li>Booking details: the doctor, the time, and the reason you give.</li>
        <li>Health details you share for a consultation, such as age, gender, weight, height, vitals, history, and the prescription written for you.</li>
        <li>Payment references from Razorpay. We do not see or store your UPI PIN or bank details.</li>
      </ul>
      <h2>Why we use it</h2>
      <p>To run your booking and consultation, to let the doctor write your prescription, to take payment, and to send you login codes and booking messages. We do not sell your data and we do not use it for advertising.</p>
      <h2>Who sees it</h2>
      <p>The doctor you book can see your booking and the health details for your consultation. Service providers process data for us: Supabase (database and login), Vercel (website hosting), Razorpay (payments), Jitsi (video calls), and Google (login emails). We share data otherwise only when the law requires it.</p>
      <h2>How long we keep it</h2>
      <p>We keep consultation records and prescriptions as long as needed to provide the service and meet legal and medical record requirements.</p>
      <h2>Your rights</h2>
      <p>You can ask to see, correct, or delete your data, and to withdraw consent, by writing to us. We may need to keep some records the law requires. Under India&apos;s Digital Personal Data Protection Act, 2023, you can also complain to us as our grievance officer.</p>
      <h2>Security</h2>
      <p>Data is stored with access controls so that patients see only their own records. No online service is perfectly secure, so please keep your login code private.</p>
      <h2>Contact and grievances</h2>
      <p>{SITE.owner}, {SITE.email}, {SITE.phone}, {SITE.address}.</p>
    </main>
  );
}
