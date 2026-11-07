"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Login() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const digits = id.replace(/\D/g, "");
  const phone = "+91" + digits.slice(-10);
  const email = id.trim().toLowerCase();
  const valid = mode === "email" ? /^\S+@\S+\.\S+$/.test(email) : digits.length >= 10;

  function switchMode(m: "email" | "phone") {
    setMode(m); setId(""); setCode(""); setSent(false); setMsg("");
  }

  async function send() {
    setBusy(true); setMsg("");
    const { error } =
      mode === "email"
        ? await sb.auth.signInWithOtp({ email })
        : await sb.auth.signInWithOtp({ phone });
    setBusy(false);
    if (error) setMsg(error.message);
    else setSent(true);
  }

  async function verify() {
    setBusy(true); setMsg("");
    const { error } =
      mode === "email"
        ? await sb.auth.verifyOtp({ email, token: code.trim(), type: "email" })
        : await sb.auth.verifyOtp({ phone, token: code.trim(), type: "sms" });
    setBusy(false);
    if (error) setMsg(error.message);
    else { router.push("/"); router.refresh(); }
  }

  const box = { display: "block", width: "100%", padding: 8, margin: "6px 0 12px" } as const;
  return (
    <main style={{ maxWidth: 360, margin: "40px auto", padding: 16 }}>
      <h1>Sign in</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => switchMode("email")} disabled={mode === "email"}>Email</button>
        <button type="button" onClick={() => switchMode("phone")} disabled={mode === "phone"}>Mobile</button>
      </div>
      {!sent ? (
        <>
          <label>
            {mode === "email" ? "Email address" : "Mobile number"}
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              type={mode === "email" ? "email" : "tel"}
              inputMode={mode === "email" ? "email" : "numeric"}
              placeholder={mode === "email" ? "you@example.com" : "10-digit number"}
              style={box}
            />
          </label>
          <button onClick={send} disabled={!valid || busy}>{busy ? "Sending..." : "Send code"}</button>
        </>
      ) : (
        <>
          <label>
            Enter the code sent to {mode === "email" ? email : phone}
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" style={box} />
          </label>
          <button onClick={verify} disabled={code.trim().length < 4 || busy}>{busy ? "Checking..." : "Verify"}</button>
          <button type="button" onClick={() => { setSent(false); setCode(""); setMsg(""); }} style={{ marginLeft: 8 }}>Back</button>
        </>
      )}
      <p role="alert" style={{ color: "#b3261e" }}>{msg}</p>
    </main>
  );
}
