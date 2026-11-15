import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

async function saveName(formData: FormData) {
  "use server";
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  if (name.length < 2) redirect("/welcome?error=" + encodeURIComponent("Please enter your full name."));
  await sb.from("profiles").update({ full_name: name }).eq("id", user.id);
  redirect("/doctors");
}

export default async function Welcome({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await sb.from("profiles").select("full_name").eq("id", user.id).single();
  if (data?.full_name && data.full_name.trim().length >= 2) redirect("/doctors");

  return (
    <main style={{ maxWidth: 380, margin: "40px auto", padding: 16 }}>
      <h1>Welcome to Care for You</h1>
      <p style={{ color: "#4a6b71" }}>Please tell us your name so the doctor knows who to expect.</p>
      <form action={saveName}>
        <label>Full name
          <input name="name" required minLength={2} maxLength={80} autoComplete="name"
            style={{ display: "block", width: "100%", padding: 10, margin: "6px 0 12px", fontSize: 16 }} />
        </label>
        <button type="submit" style={{ padding: "10px 18px", fontSize: 16 }}>Continue</button>
      </form>
      {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}
    </main>
  );
}
