import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata = { title: SITE.name, description: "Consult a doctor by video" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <style>{`@media print { .site-footer { display: none !important; } }`}</style>
        {children}
        <footer className="site-footer" style={{ borderTop: "1px solid #ccc", padding: 16, textAlign: "center", fontSize: 14, marginTop: 40 }}>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "center" }}>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact us</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/terms">Terms and Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refund">Refund and Cancellation</Link>
          </nav>
          <p>© {SITE.name}. Not for emergencies: call 112.</p>
        </footer>
      </body>
    </html>
  );
}
