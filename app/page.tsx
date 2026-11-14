import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

async function signOut() {
  "use server";
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

const css = `
.hp{background:linear-gradient(180deg,#dff1ee 0,#f6fbfa 520px,#fff 100%);color:#123b42;font-family:Arial,sans-serif;min-height:100vh}
.hp a{color:inherit;text-decoration:none}
.hp .w{max-width:1040px;margin:0 auto;padding:0 20px}
.hp nav{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
.hp .logo{font-weight:700;font-size:22px;color:#087f80}
.hp .links{display:none;gap:24px}
.hp .links a{color:#355c63;font-size:15px}
.hp .btn{display:inline-block;background:#087f80;color:#fff;padding:12px 22px;border-radius:10px;font-size:16px;border:0;cursor:pointer}
.hp .btn2{display:inline-block;border:2px solid #087f80;color:#087f80;padding:10px 20px;border-radius:10px;font-size:16px;background:transparent}
.hp .hero{display:grid;gap:28px;padding:20px 0 50px;align-items:center}
.hp h1{font-size:40px;line-height:1.1;margin:0 0 14px}
.hp .sub{color:#4a6b71;max-width:460px;line-height:1.6;margin:0 0 22px}
.hp .row{display:flex;gap:12px;flex-wrap:wrap}
.hp .art{position:relative;height:300px;display:flex;align-items:center;justify-content:center}
.hp .circle{width:260px;height:260px;border-radius:50%;background:#5b9f98;display:flex;align-items:center;justify-content:center;font-size:110px}
.hp .chip{position:absolute;background:#fff;border-radius:14px;padding:10px 14px;font-size:14px;box-shadow:0 6px 18px rgba(8,127,128,.15)}
.hp .c1{top:14px;right:4px}
.hp .c2{bottom:20px;left:0}
.hp .book{background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(8,127,128,.14);padding:18px;display:grid;gap:14px;margin-bottom:50px}
.hp small{color:#6a868b;display:block}
.hp h2{font-size:26px;margin:0 0 16px}
.hp .grid3{display:grid;gap:14px}
.hp .card{background:#fff;border:1px solid #cfe5e2;border-radius:14px;padding:18px}
.hp .tint{background:#eaf7f5;border-radius:14px;padding:20px}
.hp section{margin-bottom:50px}
.hp .me p{margin:8px 0}
@media(min-width:800px){
.hp .links{display:flex}
.hp .hero{grid-template-columns:1.1fr 1fr}
.hp h1{font-size:52px}
.hp .art{height:360px}
.hp .circle{width:320px;height:320px;font-size:140px}
.hp .grid3{grid-template-columns:repeat(3,1fr)}
.hp .book{grid-template-columns:1fr 1fr 1fr auto;align-items:center}
}
.hp .art{--r:130px;height:calc(var(--r)*2 + 60px)}
.hp .circle{width:calc(var(--r)*2);height:calc(var(--r)*2)}
.hp .c1{top:50%;left:50%;right:auto;bottom:auto;transform:translate(calc(-50% - var(--r)*0.5),calc(-50% - var(--r)*0.866))}
@media(min-width:800px){.hp .art{--r:160px}}
`;

export default async function Home() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  let role = "";
  if (user) {
    const { data } = await sb.from("profiles").select("role").eq("id", user.id).single();
    role = data?.role ?? "";
  }
  const steps = [
    ["1", "Choose a time", "Pick a doctor and a free slot that suits you."],
    ["2", "Pay by UPI", "Pay securely to confirm your booking."],
    ["3", "Consult by video", "Talk to the doctor and get your prescription."],
  ];

  return (
    <div className="hp">
      <style>{css}</style>
      <div className="w">
        <nav>
          <Link href="/" className="logo">Care for You</Link>
          <div className="links">
            <a href="#how">How it works</a>
            <Link href="/about">About us</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">Contact</Link>
          </div>
          {user ? (
            <Link href="/appointments" className="btn2">My appointments</Link>
          ) : (
            <Link href="/login" className="btn">Sign in / Sign up</Link>
          )}
        </nav>

        <header className="hero">
          <div>
            <h1>Find a doctor for you</h1>
            <p className="sub">Consult a registered doctor on video from home. Book a time, pay by UPI, and get your prescription online.</p>
            <div className="row">
              <Link href="/doctors" className="btn">Get started</Link>
              <a href="#how" className="btn2">How it works</a>
            </div>
          </div>
          <div className="art">
                                    <div className="circle" style={{ overflow: "hidden" }}>
              <img src="/1794655300202.png" alt="Doctor" style={{ width: "70%", height: "70%", objectFit: "cover", objectPosition: "60% 8%", borderRadius: 18 }} />
            </div>
            <div className="chip c1">🔒 Private and secure</div>
            <div className="chip c2">💳 Pay by UPI</div>
          </div>
        </header>

        <div className="book">
          <div><small>Speciality</small><b>General Physician</b></div>
          <div><small>Consultation</small><b>Video, about 15 minutes</b></div>
          <div><small>Fee</small><b>{SITE.fee}</b></div>
          <Link href="/doctors" className="btn">Book now</Link>
        </div>

        <section id="how">
          <h2>How it works</h2>
          <div className="grid3">
            {steps.map(([n, t, d]) => (
              <div key={n} className="card">
                <b style={{ color: "#087f80" }}>{n}. {t}</b>
                <p style={{ margin: "6px 0 0" }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Our Speciality</h2>
          <div className="tint">
            <h3 style={{ marginTop: 0 }}>🩺 General Physician</h3>
            <p style={{ marginBottom: 0 }}>Consultation for general medical problems and healthcare.</p>
          </div>
        </section>

        <section>
          <h2>About us</h2>
          <p style={{ lineHeight: 1.6, color: "#4a6b71" }}>
            Care for You makes it simple to see a registered doctor without travelling or waiting.{" "}
            <Link href="/about" style={{ color: "#087f80" }}>Read more</Link>
          </p>
        </section>

        {user && (
          <section className="me">
            <p>Signed in as {user.email ?? user.phone}</p>
            <p><Link href="/appointments" style={{ color: "#087f80" }}>My Appointments</Link></p>
            {role === "doctor" && (
              <>
                <p><Link href="/doctor/slots" style={{ color: "#087f80" }}>My Available Times</Link></p>
                <p><Link href="/doctor/profile" style={{ color: "#087f80" }}>My Doctor Profile</Link></p>
              </>
            )}
            {role === "patient" && <p><Link href="/doctor/apply" style={{ color: "#087f80" }}>Apply as a Doctor</Link></p>}
            {role === "admin" && <p><Link href="/admin" style={{ color: "#087f80" }}>Admin Dashboard</Link></p>}
            <form action={signOut}><button type="submit" className="btn2">Sign out</button></form>
          </section>
        )}
      </div>
    </div>
  );
}
