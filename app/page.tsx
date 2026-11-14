
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
  const {
    data: { user },
  } = await sb.auth.getUser();

  let role = "";

  if (user) {
    const { data } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    role = data?.role ?? "";
  }

  return (
    <main style={{
      maxWidth: "900px",
      margin: "60px auto",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
      color: "#123b42"
    }}>
      <h1 style={{ color: "#087f80", fontSize: "36px" }}>
        Care For You
      </h1>

      <h2>Quality Healthcare, Just a Click Away.</h2>

      <p>
        Connect with doctors and access convenient online healthcare.
      </p>

      <Link href="/doctors">Find a Doctor</Link>

      <h2 style={{ marginTop: "40px" }}>Our Speciality</h2>

      <div style={{
        padding: "20px",
        background: "#eaf7f5",
        borderRadius: "12px"
      }}>
        <h3>🩺 General Physician</h3>
        <p>Consultation for general medical problems and healthcare.</p>
      </div>

      {user ? (
        <>
          <p>Signed in as {user.email ?? user.phone}</p>

          <p><Link href="/appointments">My Appointments</Link></p>

          {role === "doctor" && (
            <>
              <p><Link href="/doctor/slots">My Available Times</Link></p>
              <p><Link href="/doctor/profile">My Doctor Profile</Link></p>
            </>
          )}

          {role === "patient" && (
            <p><Link href="/doctor/apply">Apply as a Doctor</Link></p>
          )}

          {role === "admin" && (
            <p><Link href="/admin">Admin Dashboard</Link></p>
          )}

          <form action={signOut}>
            <button type="submit">Sign Out</button>
          </form>
        </>
      ) : (
        <p><Link href="/login">Sign In / Register</Link></p>
      )}
    </main>
  );
}
