"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type RzResponse = Record<string, string>;
type RzInstance = {
  open: () => void;
  on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void;
};
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RzInstance;
  }
}

function loadScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PayButton({ appointmentId, amount }: { appointmentId: string; amount: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    setMsg("");
    try {
      if (!(await loadScript()) || !window.Razorpay) throw new Error("Could not load the payment window.");
      const r = await fetch("/api/pay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });
      const o = await r.json();
      if (!r.ok) throw new Error(o.error || "Could not start payment.");

      const rz = new window.Razorpay({
        key: o.keyId,
        order_id: o.orderId,
        amount: o.amount,
        currency: "INR",
        name: "CareLink",
        description: "Teleconsultation",
        config: {
          display: {
            blocks: { upi: { name: "Pay with UPI", instruments: [{ method: "upi" }] } },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: false },
          },
        },
        handler: async (resp: RzResponse) => {
          const v = await fetch("/api/pay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resp),
          });
          if (v.ok) {
            router.push("/appointments");
            router.refresh();
          } else {
            setMsg("Payment received. Your booking will be confirmed within a minute. Check My appointments.");
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rz.on("payment.failed", (e) => {
        setMsg(e.error?.description || "Payment failed. Please try again.");
        setBusy(false);
      });
      rz.open();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={pay} disabled={busy} style={{ padding: "10px 18px", fontSize: 16 }}>
        {busy ? "Please wait..." : `Pay ₹${amount} by UPI`}
      </button>
      {msg && <p role="alert" style={{ color: "#b3261e" }}>{msg}</p>}
    </div>
  );
}
