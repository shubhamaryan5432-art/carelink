"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Login() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");
  const full = "+91" + phone.replace(/\D/g, "").slice(-10);

  async function send() {
    const { error } = await sb.auth.signInWithOtp({ phone: full });
    if (error) setMsg(error.message);
    else { setSent(true); setMsg(""); }
  }
  async function verify() {
    const { error } = await sb.auth.verifyOtp({ phone: full, token: code, type: "sms" });
    if (error) setMsg(error.message);
    else { router.push("/"); router.refresh(); }
  }

  return (
    <main style={{ maxWidth: 360, margin: "40px auto", padding: 16 }}>
      <h1>Sign in</h1>
      {!sent ? (
        <>
          <label>Mobile number<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" placeholder="10-digit number" /></label>
          <button onClick={send} disabled={phone.replace(/\D/g, "").length < 10}>Send OTP</button>
        </>
      ) : (
        <>
          <label>Enter the OTP sent to {full}<input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" /></label>
          <button onClick={verify} disabled={code.length < 4}>Verify</button>
        </>
      )}
      <p role="alert" style={{ color: "#b3261e" }}>{msg}</p>
    </main>
  );
}
