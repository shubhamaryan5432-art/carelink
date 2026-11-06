import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

const IST = "Asia/Kolkata";

async function addSlots(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  const date = String(formData.get("date"));
  const from = String(formData.get("from"));
  const to = String(formData.get("to"));
  const mins = Math.min(120, Math.max(10, Number(formData.get("mins")) || 15));
  const start = new Date(`${date}T${from}:00+05:30`).getTime();
  const end = new Date(`${date}T${to}:00+05:30`).getTime();
  if (isNaN(start) || isNaN(end) || end <= start || start < Date.now()) return;

  const rows: { doctor_id: string; starts_at: string; ends_at: string }[] = [];
  for (let t = start; t + mins * 60000 <= end && rows.length < 48; t += mins * 60000) {
    rows.push({
      doctor_id: user.id,
      starts_at: new Date(t).toISOString(),
      ends_at: new Date(t + mins * 60000).toISOString(),
    });
  }
  if (rows.length) {
    await sb.from("slots").upsert(rows, { onConflict: "doctor_id,starts_at", ignoreDuplicates: true });
  }
  revalidatePath("/doctor/slots");
}

async function removeSlot(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("slots").delete().eq("id", String(formData.get("id"))).eq("doctor_id", user.id);
  revalidatePath("/doctor/slots");
}

export default async function Slots() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "doctor") redirect("/");

  const { data: slots } = await sb
    .from("slots")
    .select("id, starts_at, ends_at")
    .eq("doctor_id", user.id)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at");
  const { data: booked } = await sb
    .from("appointments")
    .select("slot_id")
    .eq("doctor_id", user.id)
    .in("status", ["pending_payment", "confirmed"]);
  const taken = new Set((booked ?? []).map((b) => b.slot_id));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: IST });
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      timeZone: IST, weekday: "short", day: "numeric", month: "short",
      hour: "numeric", minute: "2-digit",
    });

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>My available times</h1>
      <p>Times are in Indian time (IST). Add a window and it is split into slots.</p>

      <form action={addSlots} style={{ display: "grid", gap: 10, margin: "16px 0" }}>
        <label>Date<input type="date" name="date" min={today} required style={{ display: "block", width: "100%" }} /></label>
        <label>From<input type="time" name="from" required style={{ display: "block", width: "100%" }} /></label>
        <label>To<input type="time" name="to" required style={{ display: "block", width: "100%" }} /></label>
        <label>Minutes per consult<input type="number" name="mins" defaultValue={15} min={10} max={120} style={{ display: "block", width: "100%" }} /></label>
        <button type="submit">Add slots</button>
      </form>

      <h2>Upcoming slots</h2>
      {(slots ?? []).length === 0 && <p>No slots yet.</p>}
      {(slots ?? []).map((s) => (
        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #ddd" }}>
          <span>{fmt(s.starts_at)}</span>
          {taken.has(s.id) ? (
            <b>Booked</b>
          ) : (
            <form action={removeSlot}>
              <input type="hidden" name="id" value={s.id} />
              <button type="submit">Remove</button>
            </form>
          )}
        </div>
      ))}
    </main>
  );
}
