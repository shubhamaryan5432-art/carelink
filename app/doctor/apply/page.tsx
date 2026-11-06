"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Apply() {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setMsg("Submitting...");
    try {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        setMsg("Please sign in first.");
        router.push("/login");
        return;
      }
      const a = await sb.from("profiles").update({ full_name: String(f.get("name")) }).eq("id", user.id);
      if (a.error) { setMsg("Error: " + a.error.message); return; }
      const b = await sb.from("doctors").insert({
        id: user.id,
        specialty: String(f.get("specialty")),
        registration_council: String(f.get("council")),
        registration_number: String(f.get("regno")),
        years_experience: Number(f.get("years")),
        fee_inr: Number(f.get("fee")),
      });
      setMsg(b.error ? "Error: " + b.error.message : "Application submitted. We will verify your registration, then approve your account.");
    } catch (err) {
      setMsg("Unexpected error: " + String(err));
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Apply as a doctor</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label>Full name<input name="name" required style={{ display: "block", width: "100%" }} /></label>
        <label>Specialty<input name="specialty" required style={{ display: "block", width: "100%" }} /></label>
        <label>Medical council (e.g. NMC, state council)<input name="council" required style={{ display: "block", width: "100%" }} /></label>
        <label>Registration number<input name="regno" required style={{ display: "block", width: "100%" }} /></label>
        <label>Years of experience<input name="years" type="number" min={0} required style={{ display: "block", width: "100%" }} /></label>
        <label>Consultation fee (₹)<input name="fee" type="number" min={0} required style={{ display: "block", width: "100%" }} /></label>
        <button type="submit">Submit application</button>
      </form>
      <p role="status">{msg}</p>
    </main>
  );
}
