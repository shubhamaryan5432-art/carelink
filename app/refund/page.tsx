import { SITE } from "@/lib/site";

export default function Refund() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Refund and Cancellation Policy</h1>
      <p>Last updated: {SITE.updated}</p>
      <h2>Cancelling</h2>
      <p>To cancel a paid booking, email {SITE.email} or call {SITE.phone}, quoting your name and appointment time. Cancel at least 2 hours before the start time.</p>
      <h2>When you get a full refund</h2>
      <ul>
        <li>You cancel at least 2 hours before the appointment.</li>
        <li>The doctor does not attend or cancels the appointment.</li>
        <li>The consultation cannot take place because of a technical failure on our side.</li>
        <li>You are charged twice for the same booking.</li>
      </ul>
      <h2>When there is no refund</h2>
      <ul>
        <li>You do not attend, or cancel less than 2 hours before the appointment.</li>
        <li>The consultation took place, since the service has been delivered.</li>
      </ul>
      <h2>How refunds are paid</h2>
      <p>Refunds go back to the same UPI or bank account used to pay, within 5 to 7 working days of approval.</p>
      <h2>Unpaid bookings</h2>
      <p>If payment is not completed within 20 minutes, the booking is cancelled automatically and nothing is charged.</p>
      <h2>Delivery</h2>
      <p>The service is delivered online by video. Nothing is shipped.</p>
      <p>Questions: {SITE.email}, {SITE.phone}.</p>
    </main>
  );
}
