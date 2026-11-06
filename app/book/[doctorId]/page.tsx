import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const IST = "Asia/Kolkata";
type Slot = { id: string; starts_at: string };

async function book(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const doctorId = String(formData.get("doctorId"));
  const slotId = String(formData.get("slotId") ?? "");
  const back = `/book/${doctorId}`;
  if (!slotId) redirect(`${back}?error=Please+choose+a+time`);
  if (formData.get("consent") !== "on") redirect(`${back}?error=Please+tick+the+consent+box`);
  const name = String(formData.get("name") ?? "").trim();
  if (name) await sb.from("profiles").update({ full_name: name }).eq("id", user.id);
  await sb.rpc("expire_unpaid");
  const { data: created, error } = await sb
    .from("appointments")
    .insert({
      doctor_id: doctorId,
      slot_id: slotId,
      reason: String(formData.get("reason") ?? "").slice(0, 500),
      consent_given_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !created) {
    const m = error?.code === "23505"
      ? "Sorry, that time was just taken. Please pick another."
      : "Could not book. Please try again.";
    redirect(`${back}?error=${encodeURIComponent(m)}`);
  }
  redirect(`/pay/${created.id}`);
}

export default async function Book({
  params,
  searchParams,
}: {
  params: Promise<{ doctorId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { doctorId } = await params;
  const { error } = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: doc } = await sb
    .from("doctor_directory")
    .select("id, full_name, specialty, fee_inr")
    .eq("id", doctorId)
    .maybeSingle();
  if (!doc) redirect("/doctors");
  const { data: mine } = await sb.from("profiles").select("full_name").eq("id", user.id).single();
  await sb.rpc("expire_unpaid");
  const { data } = await sb.rpc("free_slots", { doc: doctorId });
  const slots = (data ?? []) as Slot[];

  const days = new Map<string, Slot[]>();
  slots.forEach((s) => {
    const k = new Date(s.starts_at).toLocaleDateString("en-IN", {
      timeZone: IST, weekday: "long", day: "numeric", month: "short",
    });
    days.set(k, [...(days.get(k) ?? []), s]);
  });
  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit" });

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>{doc.full_name ?? "Doctor"}</h1>
      <p>{doc.specialty}. Fee: ₹{doc.fee_inr}. Times are in IST.</p>
      {slots.length === 0 ? (
        <p>No free times right now. Please check again later.</p>
      ) : (
        <form action={book} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" name="doctorId" value={doctorId} />
          {Array.from(days.entries()).map(([day, list]) => (
            <fieldset key={day}>
              <legend><b>{day}</b></legend>
              {list.map((s) => (
                <label key={s.id} style={{ display: "inline-block", margin: "6px 12px 6px 0" }}>
                  <input type="radio" name="slotId" value={s.id} required /> {time(s.starts_at)}
                </label>
              ))}
            </fieldset>
          ))}
          <label>Your name<input name="name" defaultValue={mine?.full_name ?? ""} required style={{ display: "block", width: "100%" }} /></label>
          <label>What do you want to discuss?<textarea name="reason" style={{ display: "block", width: "100%" }} /></label>
          <label>
            <input type="checkbox" name="consent" /> I agree to a video consultation and to sharing my details with the doctor.
          </label>
          <button type="submit">Continue to payment</button>
          {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}
        </form>
      )}
    </main>
  );
}
