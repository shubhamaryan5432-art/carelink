
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}
const specialties = [
  {
    icon: "🩺",
    name: "General Physician",
    desc: "Consultation for common health problems and general medical care",
  },
];

export default async function Home() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  let role = "";
  if (user) {
    const { data } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = data?.role ?? "";
  }

  const primaryLink = user ? "/doctors" : "/login";

  return (
    <main className="cfy">
      <style>{`
        * { box-sizing: border-box; }
        .cfy {
          --teal: #087f80;
          --dark: #123b42;
          --muted: #64777b;
          --pale: #eaf7f5;
          color: var(--dark);
          font-family: Arial, Helvetica, sans-serif;
          background: #fff;
          overflow: hidden;
        }
        .cfy a { text-decoration: none; }
        .cfy-header {
          max-width: 1180px; margin: auto; padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px;
        }
        .cfy-logo { font-size: 25px; font-weight: 800; color: var(--dark); }
        .cfy-logo span { color: var(--teal); }
        .cfy-nav { display: flex; align-items: center; gap: 28px; }
        .cfy-nav a { color: #40575b; font-size: 14px; font-weight: 600; }
        .cfy-nav a:hover { color: var(--teal); }
        .cfy-btn {
          display: inline-flex; justify-content: center; align-items: center;
          background: var(--teal); color: white !important;
          padding: 14px 23px; border-radius: 9px;
          font-weight: 700; font-size: 14px; border: 0;
          cursor: pointer; transition: .2s;
        }
        .cfy-btn:hover { background: #05696a; transform: translateY(-2px); }
        .cfy-outline {
          border: 1px solid #b8d9d5; padding: 12px 20px;
          border-radius: 9px; color: var(--teal) !important;
          font-weight: 700; display: inline-flex;
        }
        .cfy-hero {
          background: linear-gradient(115deg, #eff9f7, #f5fbff);
          padding: 75px 24px 85px;
        }
        .cfy-hero-inner {
          max-width: 1180px; margin: auto;
          display: grid; grid-template-columns: 1.15fr .85fr;
          align-items: center; gap: 50px;
        }
        .cfy-tag {
          display: inline-block; background: #d9f0eb; color: #087f80;
          border-radius: 30px; padding: 9px 15px;
          font-size: 12px; font-weight: 800; letter-spacing: .6px;
        }
        .cfy-hero h1 {
          font-size: clamp(39px, 5.3vw, 63px);
          line-height: 1.12; letter-spacing: -2px;
          margin: 23px 0; color: #143e45;
        }
        .cfy-hero h1 span { color: var(--teal); }
        .cfy-lead {
          font-size: 17px; line-height: 1.8;
          color: var(--muted); max-width: 530px; margin-bottom: 30px;
        }
        .cfy-actions { display: flex; flex-wrap: wrap; gap: 13px; }
        .cfy-art {
          min-height: 350px; border-radius: 35px;
          background: linear-gradient(145deg, #c9e9e2, #e5f4f7);
          display: flex; justify-content: center; align-items: center;
          position: relative; padding: 25px;
        }
        .cfy-doctor {
          width: 230px; height: 250px; border-radius: 120px 120px 35px 35px;
          background: #fff; display: flex; align-items: center;
          justify-content: center; flex-direction: column;
          box-shadow: 0 20px 55px #245b5520;
        }
        .cfy-doctor-face { font-size: 83px; }
        .cfy-doctor-coat { font-size: 68px; margin-top: -7px; }
        .cfy-float {
          position: absolute; background: white; border-radius: 14px;
          padding: 15px 18px; box-shadow: 0 12px 35px #1b52521a;
          font-size: 13px; font-weight: 700;
        }
        .cfy-float.one { top: 40px; left: 0; }
        .cfy-float.two { bottom: 40px; right: 0; }
        .cfy-section { max-width: 1180px; margin: auto; padding: 75px 24px; }
        .cfy-heading { text-align: center; margin-bottom: 38px; }
        .cfy-heading small {
          color: var(--teal); font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase;
        }
        .cfy-heading h2 { font-size: 35px; margin: 12px 0; letter-spacing: -1px; }
        .cfy-heading p { color: var(--muted); line-height: 1.7; }
        .cfy-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 19px;
        }
        .cfy-card {
          padding: 25px; border: 1px solid #e3eeec;
          border-radius: 17px; background: white;
          transition: .2s;
        }
        .cfy-card:hover {
          border-color: #a8d8d0; transform: translateY(-4px);
          box-shadow: 0 12px 30px #164d4710;
        }
        .cfy-icon {
          width: 53px; height: 53px; border-radius: 14px;
          background: var(--pale); display: flex; align-items: center;
          justify-content: center; font-size: 26px; margin-bottom: 17px;
        }
        .cfy-card h3 { font-size: 17px; margin: 0 0 9px; }
        .cfy-card p { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0; }
        .cfy-steps { background: #f5faf9; }
        .cfy-step {
          text-align: center; padding: 25px;
        }
        .cfy-number {
          width: 58px; height: 58px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #d9f0eb; color: var(--teal);
          font-size: 22px; font-weight: 800; margin: 0 auto 18px;
        }
        .cfy-step h3 { font-size: 18px; }
        .cfy-step p { color: var(--muted); font-size: 14px; line-height: 1.7; }
        .cfy-benefits {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }
        .cfy-benefit {
          background: #f5faf9; padding: 25px; border-radius: 15px;
        }
        .cfy-benefit strong { display: block; margin: 12px 0 8px; }
        .cfy-benefit p { color: var(--muted); font-size: 14px; line-height: 1.6; }
        .cfy-cta {
          background: linear-gradient(110deg, #087f80, #126a87);
          color: white; border-radius: 24px; padding: 48px 30px;
          text-align: center;
        }
        .cfy-cta h2 { font-size: 34px; margin: 0 0 13px; }
        .cfy-cta p { color: #e0f2f1; line-height: 1.7; }
        .cfy-cta .cfy-btn { background: white; color: var(--teal) !important; margin-top: 12px; }
        .cfy-account {
          background: #f0f8f7; border: 1px solid #d6ebe6;
          border-radius: 12px; padding: 17px; margin-top: 20px;
          font-size: 14px;
        }
        .cfy-account a { color: var(--teal); font-weight: 700; }
        .cfy-account form { display: inline-block; margin-left: 15px; }
        .cfy-account button {
          background: none; border: 0; color: #b33b3b;
          cursor: pointer; font-weight: 700;
        }
        @media(max-width: 760px) {
          .cfy-header { padding: 17px 18px; flex-wrap: wrap; }
          .cfy-nav { order: 3; width: 100%; justify-content: center; gap: 17px; flex-wrap: wrap; }
          .cfy-nav a { font-size: 12px; }
          .cfy-hero { padding: 55px 20px; }
          .cfy-hero-inner { grid-template-columns: 1fr; gap: 35px; }
          .cfy-hero h1 { letter-spacing: -1.3px; }
          .cfy-art { min-height: 290px; }
          .cfy-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .cfy-card { padding: 17px; }
          .cfy-section { padding: 55px 19px; }
          .cfy-heading h2 { font-size: 29px; }
          .cfy-benefits { grid-template-columns: 1fr; }
          .cfy-cta h2 { font-size: 28px; }
        }
        @media(max-width: 390px) {
          .cfy-grid { grid-template-columns: 1fr; }
          .cfy-logo { font-size: 22px; }
        }
      `}</style>

      <header className="cfy-header">
        <Link href="/" className="cfy-logo">
          Care <span>For You</span>
        </Link>

        <nav className="cfy-nav">
          <Link href="/">Home</Link>
          <Link href="/doctors">Find Doctors</Link>
          <Link href="/about">About Us</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <Link href={user ? "/appointments" : "/login"} className="cfy-btn">
          {user ? "My Account" : "Sign In"}
        </Link>
      </header>

      {user && (
        <div style={{ maxWidth: 1132, margin: "0 auto", padding: "0 20px" }}>
          <div className="cfy-account">
            Signed in as <strong>{user.email ?? user.phone}</strong>
            {" · "}
            <Link href="/appointments">My appointments</Link>
            {" · "}
            {role === "doctor" && (
              <>
                <Link href="/doctor/slots">Doctor dashboard</Link>
                {" · "}
                <Link href="/doctor/profile">My profile</Link>
                {" · "}
              </>
            )}
            {role === "patient" && (
              <>
                <Link href="/doctor/apply">Apply as a doctor</Link>
                {" · "}
              </>
            )}
            {role === "admin" && (
              <>
                <Link href="/admin">Admin</Link>
                {" · "}
              </>
            )}
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
          </div>
        </div>
      )}

      <section className="cfy-hero">
        <div className="cfy-hero-inner">
          <div>
            <span className="cfy-tag">YOUR HEALTH, OUR PRIORITY</span>
            <h1>
              Quality healthcare,<br />
              <span>just a click away.</span>
            </h1>
            <p className="cfy-lead">
              Connect with doctors, get professional medical guidance
              and take care of your health from the comfort of your home.
            </p>
            <div className="cfy-actions">
              <Link href={primaryLink} className="cfy-btn">
                {user ? "Find a Doctor →" : "Book a Consultation →"}
              </Link>
              <Link href="/doctors" className="cfy-outline">
                Explore Doctors
              </Link>
            </div>
          </div>

          <div className="cfy-art">
            <div className="cfy-float one">✓ Healthcare made simple</div>
            <div className="cfy-doctor">
              <div className="cfy-doctor-face">👨‍⚕️</div>
              <div className="cfy-doctor-coat">🥼</div>
            </div>
            <div className="cfy-float two">💚 Care that comes to you</div>
          </div>
        </div>
      </section>

      <section className="cfy-section">
        <div className="cfy-heading">
          <small>OUR SPECIALITIES</small>
          <h2>Healthcare for every need</h2>
          <p>Find the right medical speciality for your healthcare needs.</p>
        </div>

        <div className="cfy-grid">
          {specialties.map((item) => (
            <Link href="/doctors" className="cfy-card" key={item.name}>
              <div className="cfy-icon">{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="cfy-steps">
        <div className="cfy-section">
          <div className="cfy-heading">
            <small>SIMPLE PROCESS</small>
            <h2>Healthcare in three easy steps</h2>
            <p>Getting medical guidance should be simple and convenient.</p>
          </div>

          <div className="cfy-grid">
            <div className="cfy-step">
              <div className="cfy-number">1</div>
              <h3>Choose a doctor</h3>
              <p>Explore available doctors and find the right specialist.</p>
            </div>
            <div className="cfy-step">
              <div className="cfy-number">2</div>
              <h3>Book your appointment</h3>
              <p>Select an available consultation time that suits you.</p>
            </div>
            <div className="cfy-step">
              <div className="cfy-number">3</div>
              <h3>Consult online</h3>
              <p>Connect with your doctor and receive medical guidance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cfy-section">
        <div className="cfy-heading">
          <small>WHY CARE FOR YOU</small>
          <h2>Care designed around you</h2>
          <p>A more convenient way to access healthcare.</p>
        </div>

        <div className="cfy-benefits">
          <div className="cfy-benefit">
            <div className="cfy-icon">🕒</div>
            <strong>Convenient access</strong>
            <p>Explore doctors and appointments without unnecessary travel.</p>
          </div>
          <div className="cfy-benefit">
            <div className="cfy-icon">🔒</div>
            <strong>Your privacy matters</strong>
            <p>Your healthcare journey deserves care and confidentiality.</p>
          </div>
          <div className="cfy-benefit">
            <div className="cfy-icon">💚</div>
            <strong>Patient-focused care</strong>
            <p>Make informed decisions and take an active role in your health.</p>
          </div>
        </div>
      </section>

      <section className="cfy-section" style={{ paddingTop: 0 }}>
        <div className="cfy-cta">
          <h2>Your health deserves attention.</h2>
          <p>Take the first step towards convenient healthcare today.</p>
          <Link href={primaryLink} className="cfy-btn">
            Get Started →
          </Link>
        </div>
      </section>

      <section className="cfy-section" style={{ paddingTop: 0 }}>
        <div style={{ textAlign: "center", color: "#64777b", fontSize: 13, lineHeight: 1.8 }}>
          <p>
            Care For You provides access to online doctor consultations.
            Online consultations are not a substitute for emergency care.
          </p>
          <strong>For medical emergencies in India, call 112.</strong>
        </div>
      </section>
    </main>
  );
}
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

const specialties = [
  { icon: "🩺", name: "General Medicine", desc: "Everyday health concerns" },
];

export default async function Home() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  let role = "";
  if (user) {
    const { data } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = data?.role ?? "";
  }

  const primaryLink = user ? "/doctors" : "/login";

  return (
    <main className="cfy">
      <style>{`
        * { box-sizing: border-box; }
        .cfy {
          --teal: #087f80;
          --dark: #123b42;
          --muted: #64777b;
          --pale: #eaf7f5;
          color: var(--dark);
          font-family: Arial, Helvetica, sans-serif;
          background: #fff;
          overflow: hidden;
        }
        .cfy a { text-decoration: none; }
        .cfy-header {
          max-width: 1180px; margin: auto; padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px;
        }
        .cfy-logo { font-size: 25px; font-weight: 800; color: var(--dark); }
        .cfy-logo span { color: var(--teal); }
        .cfy-nav { display: flex; align-items: center; gap: 28px; }
        .cfy-nav a { color: #40575b; font-size: 14px; font-weight: 600; }
        .cfy-nav a:hover { color: var(--teal); }
        .cfy-btn {
          display: inline-flex; justify-content: center; align-items: center;
          background: var(--teal); color: white !important;
          padding: 14px 23px; border-radius: 9px;
          font-weight: 700; font-size: 14px; border: 0;
          cursor: pointer; transition: .2s;
        }
        .cfy-btn:hover { background: #05696a; transform: translateY(-2px); }
        .cfy-outline {
          border: 1px solid #b8d9d5; padding: 12px 20px;
          border-radius: 9px; color: var(--teal) !important;
          font-weight: 700; display: inline-flex;
        }
        .cfy-hero {
          background: linear-gradient(115deg, #eff9f7, #f5fbff);
          padding: 75px 24px 85px;
        }
        .cfy-hero-inner {
          max-width: 1180px; margin: auto;
          display: grid; grid-template-columns: 1.15fr .85fr;
          align-items: center; gap: 50px;
        }
        .cfy-tag {
          display: inline-block; background: #d9f0eb; color: #087f80;
          border-radius: 30px; padding: 9px 15px;
          font-size: 12px; font-weight: 800; letter-spacing: .6px;
        }
        .cfy-hero h1 {
          font-size: clamp(39px, 5.3vw, 63px);
          line-height: 1.12; letter-spacing: -2px;
          margin: 23px 0; color: #143e45;
        }
        .cfy-hero h1 span { color: var(--teal); }
        .cfy-lead {
          font-size: 17px; line-height: 1.8;
          color: var(--muted); max-width: 530px; margin-bottom: 30px;
        }
        .cfy-actions { display: flex; flex-wrap: wrap; gap: 13px; }
        .cfy-art {
          min-height: 350px; border-radius: 35px;
          background: linear-gradient(145deg, #c9e9e2, #e5f4f7);
          display: flex; justify-content: center; align-items: center;
          position: relative; padding: 25px;
        }
        .cfy-doctor {
          width: 230px; height: 250px; border-radius: 120px 120px 35px 35px;
          background: #fff; display: flex; align-items: center;
          justify-content: center; flex-direction: column;
          box-shadow: 0 20px 55px #245b5520;
        }
        .cfy-doctor-face { font-size: 83px; }
        .cfy-doctor-coat { font-size: 68px; margin-top: -7px; }
        .cfy-float {
          position: absolute; background: white; border-radius: 14px;
          padding: 15px 18px; box-shadow: 0 12px 35px #1b52521a;
          font-size: 13px; font-weight: 700;
        }
        .cfy-float.one { top: 40px; left: 0; }
        .cfy-float.two { bottom: 40px; right: 0; }
        .cfy-section { max-width: 1180px; margin: auto; padding: 75px 24px; }
        .cfy-heading { text-align: center; margin-bottom: 38px; }
        .cfy-heading small {
          color: var(--teal); font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase;
        }
        .cfy-heading h2 { font-size: 35px; margin: 12px 0; letter-spacing: -1px; }
        .cfy-heading p { color: var(--muted); line-height: 1.7; }
        .cfy-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 19px;
        }
        .cfy-card {
          padding: 25px; border: 1px solid #e3eeec;
          border-radius: 17px; background: white;
          transition: .2s;
        }
        .cfy-card:hover {
          border-color: #a8d8d0; transform: translateY(-4px);
          box-shadow: 0 12px 30px #164d4710;
        }
        .cfy-icon {
          width: 53px; height: 53px; border-radius: 14px;
          background: var(--pale); display: flex; align-items: center;
          justify-content: center; font-size: 26px; margin-bottom: 17px;
        }
        .cfy-card h3 { font-size: 17px; margin: 0 0 9px; }
        .cfy-card p { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0; }
        .cfy-steps { background: #f5faf9; }
        .cfy-step {
          text-align: center; padding: 25px;
        }
        .cfy-number {
          width: 58px; height: 58px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #d9f0eb; color: var(--teal);
          font-size: 22px; font-weight: 800; margin: 0 auto 18px;
        }
        .cfy-step h3 { font-size: 18px; }
        .cfy-step p { color: var(--muted); font-size: 14px; line-height: 1.7; }
        .cfy-benefits {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }
        .cfy-benefit {
          background: #f5faf9; padding: 25px; border-radius: 15px;
        }
        .cfy-benefit strong { display: block; margin: 12px 0 8px; }
        .cfy-benefit p { color: var(--muted); font-size: 14px; line-height: 1.6; }
        .cfy-cta {
          background: linear-gradient(110deg, #087f80, #126a87);
          color: white; border-radius: 24px; padding: 48px 30px;
          text-align: center;
        }
        .cfy-cta h2 { font-size: 34px; margin: 0 0 13px; }
        .cfy-cta p { color: #e0f2f1; line-height: 1.7; }
        .cfy-cta .cfy-btn { background: white; color: var(--teal) !important; margin-top: 12px; }
        .cfy-account {
          background: #f0f8f7; border: 1px solid #d6ebe6;
          border-radius: 12px; padding: 17px; margin-top: 20px;
          font-size: 14px;
        }
        .cfy-account a { color: var(--teal); font-weight: 700; }
        .cfy-account form { display: inline-block; margin-left: 15px; }
        .cfy-account button {
          background: none; border: 0; color: #b33b3b;
          cursor: pointer; font-weight: 700;
        }
        @media(max-width: 760px) {
          .cfy-header { padding: 17px 18px; flex-wrap: wrap; }
          .cfy-nav { order: 3; width: 100%; justify-content: center; gap: 17px; flex-wrap: wrap; }
          .cfy-nav a { font-size: 12px; }
          .cfy-hero { padding: 55px 20px; }
          .cfy-hero-inner { grid-template-columns: 1fr; gap: 35px; }
          .cfy-hero h1 { letter-spacing: -1.3px; }
          .cfy-art { min-height: 290px; }
          .cfy-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .cfy-card { padding: 17px; }
          .cfy-section { padding: 55px 19px; }
          .cfy-heading h2 { font-size: 29px; }
          .cfy-benefits { grid-template-columns: 1fr; }
          .cfy-cta h2 { font-size: 28px; }
        }
        @media(max-width: 390px) {
          .cfy-grid { grid-template-columns: 1fr; }
          .cfy-logo { font-size: 22px; }
        }
      `}</style>

      <header className="cfy-header">
        <Link href="/" className="cfy-logo">
          Care <span>For You</span>
        </Link>

        <nav className="cfy-nav">
          <Link href="/">Home</Link>
          <Link href="/doctors">Find Doctors</Link>
          <Link href="/about">About Us</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <Link href={user ? "/appointments" : "/login"} className="cfy-btn">
          {user ? "My Account" : "Sign In"}
        </Link>
      </header>

      {user && (
        <div style={{ maxWidth: 1132, margin: "0 auto", padding: "0 20px" }}>
          <div className="cfy-account">
            Signed in as <strong>{user.email ?? user.phone}</strong>
            {" · "}
            <Link href="/appointments">My appointments</Link>
            {" · "}
            {role === "doctor" && (
              <>
                <Link href="/doctor/slots">Doctor dashboard</Link>
                {" · "}
                <Link href="/doctor/profile">My profile</Link>
                {" · "}
              </>
            )}
            {role === "patient" && (
              <>
                <Link href="/doctor/apply">Apply as a doctor</Link>
                {" · "}
              </>
            )}
            {role === "admin" && (
              <>
                <Link href="/admin">Admin</Link>
                {" · "}
              </>
            )}
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
          </div>
        </div>
      )}

      <section className="cfy-hero">
        <div className="cfy-hero-inner">
          <div>
            <span className="cfy-tag">YOUR HEALTH, OUR PRIORITY</span>
            <h1>
              Quality healthcare,<br />
              <span>just a click away.</span>
            </h1>
            <p className="cfy-lead">
              Connect with doctors, get professional medical guidance
              and take care of your health from the comfort of your home.
            </p>
            <div className="cfy-actions">
              <Link href={primaryLink} className="cfy-btn">
                {user ? "Find a Doctor →" : "Book a Consultation →"}
              </Link>
              <Link href="/doctors" className="cfy-outline">
                Explore Doctors
              </Link>
            </div>
          </div>

          <div className="cfy-art">
            <div className="cfy-float one">✓ Healthcare made simple</div>
            <div className="cfy-doctor">
              <div className="cfy-doctor-face">👨‍⚕️</div>
              <div className="cfy-doctor-coat">🥼</div>
            </div>
            <div className="cfy-float two">💚 Care that comes to you</div>
          </div>
        </div>
      </section>

      <section className="cfy-section">
        <div className="cfy-heading">
          <small>OUR SPECIALITIES</small>
          <h2>Healthcare for every need</h2>
          <p>Find the right medical speciality for your healthcare needs.</p>
        </div>

        <div className="cfy-grid">
          {specialties.map((item) => (
            <Link href="/doctors" className="cfy-card" key={item.name}>
              <div className="cfy-icon">{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="cfy-steps">
        <div className="cfy-section">
          <div className="cfy-heading">
            <small>SIMPLE PROCESS</small>
            <h2>Healthcare in three easy steps</h2>
            <p>Getting medical guidance should be simple and convenient.</p>
          </div>

          <div className="cfy-grid">
            <div className="cfy-step">
              <div className="cfy-number">1</div>
              <h3>Choose a doctor</h3>
              <p>Explore available doctors and find the right specialist.</p>
            </div>
            <div className="cfy-step">
              <div className="cfy-number">2</div>
              <h3>Book your appointment</h3>
              <p>Select an available consultation time that suits you.</p>
            </div>
            <div className="cfy-step">
              <div className="cfy-number">3</div>
              <h3>Consult online</h3>
              <p>Connect with your doctor and receive medical guidance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cfy-section">
        <div className="cfy-heading">
          <small>WHY CARE FOR YOU</small>
          <h2>Care designed around you</h2>
          <p>A more convenient way to access healthcare.</p>
        </div>

        <div className="cfy-benefits">
          <div className="cfy-benefit">
            <div className="cfy-icon">🕒</div>
            <strong>Convenient access</strong>
            <p>Explore doctors and appointments without unnecessary travel.</p>
          </div>
          <div className="cfy-benefit">
            <div className="cfy-icon">🔒</div>
            <strong>Your privacy matters</strong>
            <p>Your healthcare journey deserves care and confidentiality.</p>
          </div>
          <div className="cfy-benefit">
            <div className="cfy-icon">💚</div>
            <strong>Patient-focused care</strong>
            <p>Make informed decisions and take an active role in your health.</p>
          </div>
        </div>
      </section>

      <section className="cfy-section" style={{ paddingTop: 0 }}>
        <div className="cfy-cta">
          <h2>Your health deserves attention.</h2>
          <p>Take the first step towards convenient healthcare today.</p>
          <Link href={primaryLink} className="cfy-btn">
            Get Started →
          </Link>
        </div>
      </section>

      <section className="cfy-section" style={{ paddingTop: 0 }}>
        <div style={{ textAlign: "center", color: "#64777b", fontSize: 13, lineHeight: 1.8 }}>
          <p>
            Care For You provides access to online doctor consultations.
            Online consultations are not a substitute for emergency care.
          </p>
          <strong>For medical emergencies in India, call 112.</strong>
        </div>
      </section>
    </main>
  );
}
