import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Start() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/doctor/login");
  const { data } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role === "doctor") redirect("/doctor/slots");
  if (data?.role === "admin") redirect("/admin");
  const { data: app } = await sb.from("doctors").select("status").eq("id", user.id).maybeSingle();
  if (app?.status === "pending") {
    return (
      <main style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
        <h1>Application under review</h1>
        <p>We will approve your account after checking your registration details.</p>
      </main>
    );
  }
  redirect("/doctor/apply");
}
