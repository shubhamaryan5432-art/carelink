import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

export default async function Home() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  let role = "";
  if (user) {
    const { data } = await sb.from("profiles").select("role").eq("id", user.id).single();
    role = data?.role ?? "";
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h1>CareLink</h1>
      {user ? (
        <>
          <p>Signed in as <b>{user.email ?? user.phone}</b></p>
          <p><Link href="/doctors">Find a doctor</Link></p>
          <p><Link href="/appointments">My appointments</Link></p>
          {role === "doctor" && (
            <>
              <p><Link href="/doctor/slots">My available times</Link></p>
              <p><Link href="/doctor/profile">My doctor profile</Link></p>
            </>
          )}
          {role === "patient" && <p><Link href="/doctor/apply">Apply as a doctor</Link></p>}
          {role === "admin" && <p><Link href="/admin">Admin</Link></p>}
          <form action={signOut}><button type="submit">Sign out</button></form>
        </>
      ) : (
        <>
          <p>See a doctor on video.</p>
          <p><Link href="/login">Sign in</Link></p>
        </>
      )}
    </main>
  );
}
