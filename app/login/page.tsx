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
  const digits = id.replace(/\D/g, "");
  const phone = "+91" + digits.slice(-10);
  const email = id.trim().toLowerCase();
  const isEmail = mode === "email";
  const ok = isEmail ? /^\S+@\S+\.\S+$/.test(email) : digits.length >= 10;
  const pick = (m: "email" | "phone") => {
    setMode(m); setId(""); setCode(""); setSent(false); setMsg("");
  };

  async function send() {
    setMsg("");
    const r = isEmail
      ? await sb.auth.signInWithOtp({ email })
      : await sb.auth.signInWithOtp({ phone });
    if (r.error) setMsg(r.error.message);
    else setSent(true);
  }

  async function verify() {
    setMsg("");
    const t = code.trim();
    const r = isEmail
      ? await sb.auth.verifyOtp({ email, token: t, type: "email" })
      : await sb.auth.verifyOtp({ phone, token: t, type: "sms" });
    if (r.error) setMsg(r.error.message);
    else { router.push("/"); router.refresh(); }
  }

  const st = { display: "block", width: "100%", padding: 10, margin: "6px 0 12px", fontSize: 16 } as const;
  const tab = (on: boolean) =>
    ({ flex: 1, padding: 12, fontSize: 16, borderRadius: 8, border: "1px solid #0f5c57",
       background: on ? "#0f5c57" : "#fff", color: on ? "#fff" : "#222" }) as const;

  return (
    <main style={{ maxWidth: 380, margin: "40px auto", padding: 16 }}>
      <h1>Sign in (email or mobile)</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => pick("email")} style={tab(isEmail)}>Use email</button>
        <button type="button" onClick={() => pick("phone")} style={tab(!isEmail)}>Use mobile</button>
      </div>
      {!sent ? (
        <>
          <label>{isEmail ? "Email address" : "Mobile number (10 digits)"}
            <input value={id} onChange={(e) => setId(e.target.value)} type={isEmail ? "email" : "tel"}
              placeholder={isEmail ? "you@example.com" : "9876543210"} style={st} />
          </label>
          <button onClick={send} disabled={!ok}>Send code</button>
        </>
      ) : (
        <>
          <label>Enter the code sent to {isEmail ? email : phone}
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" style={st} />
          </label>
          <button onClick={verify} disabled={code.trim().length < 4}>Verify</button>{" "}
          <button type="button" onClick={() => { setSent(false); setCode(""); }}>Back</button>
        </>
      )}
      <p role="alert" style={{ color: "#b3261e" }}>{msg}</p>
    </main>
  );
}
