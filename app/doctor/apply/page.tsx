"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Apply() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return router.push("/login");
    const f = new FormData(e.currentTarget);
    await sb.from("profiles").update({ full_name: String(f.get("name")) }).eq("id", user.id);
    const { error } = await sb.from("doctors").insert({
      id: user.id,
      specialty: String(f.get("specialty")),
      registration_council: String(f.get("council")),
      registration_number: String(f.get("regno")),
      years_experience: Number(f.get("years")),
      fee_inr: Number(f.get("fee")),
    });
    setMsg(error ? error.message : "Application submitted. We will verify your registration, then approve your account.");
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Apply as a doctor</h1>
      <form onSubmit={submit}>
        <label>Full name<input name="name" required /></label>
        <label>Specialty<input name="specialty" required /></label>
        <label>Medical council (e.g. NMC, state council)<input name="council" required /></label>
        <label>Registration number<input name="regno" required /></label>
        <label>Years of experience<input name="years" type="number" min={0} required /></label>
        <label>Consultation fee (₹)<input name="fee" type="number" min={0} required /></label>
        <button type="submit">Submit application</button>
      </form>
      <p role="status">{msg}</p>
    </main>
  );
}
