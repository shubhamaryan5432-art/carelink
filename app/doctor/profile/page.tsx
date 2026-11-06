import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import SignaturePad from "./SignaturePad";

async function saveProfile(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const clean = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max) || null;
  const upd: Record<string, string | null> = {
    qualification: clean("qualification", 120),
    contact_phone: clean("contact_phone", 20),
    contact_email: clean("contact_email", 120),
  };
  const sig = String(formData.get("signature") ?? "");
  if (sig) {
    if (!sig.startsWith("data:image/png;base64,") || sig.length > 200000) {
      redirect("/doctor/profile?error=" + encodeURIComponent("The signature could not be used. Please sign again."));
    }
    upd.signature = sig;
  }
  const { error } = await sb.from("doctors").update(upd).eq("id", user.id);
  redirect(error ? "/doctor/profile?error=" + encodeURIComponent("Could not save.") : "/doctor/profile?saved=1");
}

export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (me?.role !== "doctor") redirect("/");
  const { data: d } = await sb
    .from("doctors")
    .select("specialty, registration_council, registration_number, qualification, contact_phone, contact_email, signature")
    .eq("id", user.id)
    .single();

  const box = { display: "block", width: "100%" } as const;
  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>My doctor profile</h1>
      <p>
        <b>{me.full_name}</b><br />
        {d?.specialty}<br />
        Registration: {d?.registration_council} / {d?.registration_number}
      </p>
      <p>These details and your signature appear on every prescription you issue.</p>
      <form action={saveProfile} style={{ display: "grid", gap: 12 }}>
        <label>Qualification (e.g. MBBS, MD)<input name="qualification" defaultValue={d?.qualification ?? ""} style={box} /></label>
        <label>Contact phone<input name="contact_phone" defaultValue={d?.contact_phone ?? ""} required style={box} /></label>
        <label>Contact email<input name="contact_email" type="email" defaultValue={d?.contact_email ?? ""} style={box} /></label>
        <SignaturePad existing={d?.signature ?? null} />
        <button type="submit">Save profile</button>
        {saved && <p role="status" style={{ color: "#1b7a4a" }}>Saved.</p>}
        {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}
      </form>
    </main>
  );
}
