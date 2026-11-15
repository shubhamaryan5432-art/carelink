"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginForm({ title, next, note }: { title: string; next: string; note?: string }) {
  const sb = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const mail = email.trim().toLowerCase();
  const ok = /^\S+@\S+\.\S+$/.test(mail);

  async function send() {
    setBusy(true); setMsg("");
    const r = await sb.auth.signInWithOtp({ email: mail });
    setBusy(false);
    if (r.error) setMsg(r.error.message);
    else setSent(true);
  }

  async function verify() {
    setBusy(true); setMsg("");
    const r = await sb.auth.verifyOtp({ email: mail, token: code.trim(), type: "email" });
    if (r.error) { setBusy(false); setMsg(r.error.message); }
    else { router.push(next); router.refresh(); }
  }

  const st = { display: "block", width: "100%", padding: 10, margin: "6px 0 12px", fontSize: 16 } as const;
  const go = { padding: "10px 18px", fontSize: 16 } as const;

  return (
    <main style={{ maxWidth: 380, margin: "40px auto", padding: 16 }}>
      <h1>{title}</h1>
      {note && <p style={{ color: "#4a6b71" }}>{note}</p>}
      {!sent ? (
        <>
          <label>Email address
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email"
              placeholder="you@example.com" style={st} />
          </label>
          <button onClick={send} disabled={!ok || busy} style={go}>{busy ? "Sending..." : "Send code"}</button>
        </>
      ) : (
        <>
          <label>Enter the code sent to {mail}
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" style={st} />
          </label>
          <button onClick={verify} disabled={code.trim().length < 4 || busy} style={go}>{busy ? "Checking..." : "Verify"}</button>{" "}
          <button type="button" onClick={() => { setSent(false); setCode(""); setMsg(""); }} style={go}>Back</button>
        </>
      )}
      <p role="alert" style={{ color: "#b3261e" }}>{msg}</p>
    </main>
  );
}
