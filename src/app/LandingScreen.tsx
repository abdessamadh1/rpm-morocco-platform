import { useState, useEffect } from "react";
import {
  Activity, Server, Shield, TrendingUp, Users, Zap, Radio, Check, X,
  Database, Cloud, Cpu, Globe, BarChart2, Clock, ArrowRight,
  BellOff, SlidersHorizontal, Monitor, FileText
} from "lucide-react";

// ─── Nav sections ─────────────────────────────────────────────────────────────
const NAV = [
  { n: "01", label: "Executive Summary", id: "s1" },
  { n: "02", label: "Market Opportunity", id: "s2" },
  { n: "03", label: "Technical Architecture", id: "s3" },
  { n: "04", label: "Hardware Strategy", id: "s4" },
  { n: "05", label: "Regulatory & Compliance", id: "s5" },
  { n: "06", label: "Financial Plan", id: "s6" },
  { n: "07", label: "Go-To-Market", id: "s7" },
  { n: "08", label: "Risk Analysis", id: "s8" },
  { n: "09", label: "12-Month Roadmap", id: "s9" },
  { n: "10", label: "KPIs & Metrics", id: "s10" },
  { n: "11", label: "Open Items", id: "s11" },
];

// ─── ECG Trace ────────────────────────────────────────────────────────────────
function EcgTrace() {
  return (
    <div className="absolute left-0 right-0 bottom-0" style={{ height: 110, zIndex: 1, opacity: 0.85 }}>
      <svg width="100%" height="110" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true">
        <style>{`
          @keyframes ecg-trace {
            0% { stroke-dashoffset: 2600; }
            100% { stroke-dashoffset: 0; }
          }
          .ecg-path {
            fill: none;
            stroke: #D6452F;
            stroke-width: 2;
            stroke-linejoin: round;
            stroke-linecap: round;
            stroke-dasharray: 2600;
            stroke-dashoffset: 2600;
            animation: ecg-trace 6s linear infinite;
          }
        `}</style>
        <path className="ecg-path" d="M0,55 L100,55 L115,48 L130,62 L145,55 L175,55 L187,16 L200,100 L213,38 L225,55 L380,55 L395,48 L410,62 L425,55 L455,55 L467,16 L480,100 L493,38 L505,55 L680,55 L695,48 L710,62 L725,55 L755,55 L767,16 L780,100 L793,38 L805,55 L980,55 L995,48 L1010,62 L1025,55 L1055,55 L1067,16 L1080,100 L1093,38 L1105,55 L1280,55 L1295,48 L1310,62 L1325,55 L1355,55 L1367,16 L1380,100 L1393,38 L1440,55"/>
      </svg>
    </div>
  );
}

// ─── Pipeline node ────────────────────────────────────────────────────────────
function PipeNode({ icon, label, desc, alert }: { icon: React.ReactNode; label: string; desc: string; alert?: boolean }) {
  return (
    <div
      className="rounded-lg p-4 flex gap-3 items-start"
      style={{
        background: "#fff",
        border: `1px solid ${alert ? "#D6452F" : "#D9E2DF"}`,
        borderLeft: `3px solid ${alert ? "#D6452F" : "#D9E2DF"}`,
        boxShadow: alert ? "0 0 0 3px rgba(214,69,47,0.12)" : undefined,
        animation: alert ? "pulse-border 1.6s ease-in-out infinite" : undefined,
      }}
    >
      <div className="mt-0.5 shrink-0" style={{ color: alert ? "#D6452F" : "#16605A" }}>{icon}</div>
      <div>
        <div className="font-medium text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#0F312D" }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: "#5A756F", fontFamily: "'IBM Plex Sans', sans-serif" }}>{desc}</div>
      </div>
      {alert && (
        <div className="ml-auto shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FBEAE6", color: "#D6452F", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.08em" }}>
            ● LIVE ALERT
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────
function MetricCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="flex flex-col" style={{ borderLeft: "2px solid #D9E2DF", paddingLeft: 20 }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 28, fontWeight: 500, color: "#16605A", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#5A756F", textTransform: "uppercase", marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#B9873F", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ type }: { type: "orig" | "added" }) {
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded ml-2 align-middle" style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 9,
      letterSpacing: "0.10em",
      background: type === "orig" ? "#E3EEEC" : "#FBEAE6",
      color: type === "orig" ? "#16605A" : "#D6452F",
    }}>
      {type === "orig" ? "ORIGINAL" : "ADDED"}
    </span>
  );
}

// ─── Plain-terms box ──────────────────────────────────────────────────────────
function PlainBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-5 my-6" style={{ background: "#fff", border: "1px solid #D9E2DF", borderLeft: "3px solid #16605A" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#16605A", marginBottom: 10, textTransform: "uppercase" }}>PLAIN TERMS</div>
      <div style={{ fontSize: 14, color: "#33534E", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ n, title, badge }: { n: string; title: string; badge?: "orig" | "added" }) {
  return (
    <div className="mb-6">
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: "#B9873F", textTransform: "uppercase", marginBottom: 10 }}>
        SECTION {n}
      </div>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 2.8vw, 30px)", color: "#0F312D", lineHeight: 1.15, letterSpacing: "-0.015em" }}>
        {title}{badge && <Badge type={badge} />}
      </h2>
    </div>
  );
}

// ─── Landing Screen ──────────────────────────────────────────────────────────
export function LandingScreen() {
  const [activeId, setActiveId] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex">
      {/* ── Left Rail ── */}
      <nav
        className="fixed top-0 left-0 bottom-0 overflow-y-auto"
        style={{ width: 220, borderRight: "1px solid #D9E2DF", background: "#F4F7F6", padding: "28px 0 28px 24px", zIndex: 20 }}
      >
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "0.02em", color: "#0F312D" }}>
          RPM<span style={{ color: "#D6452F" }}>▮</span>MOROCCO
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "#16605A", marginTop: 3, marginBottom: 28, textTransform: "uppercase" }}>
          Business Plan v2.0
        </div>
        {NAV.map(({ n, label, id }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-center gap-2 text-xs py-1.5 transition-all duration-150"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "#0F312D",
              textDecoration: "none",
              opacity: activeId === id ? 1 : 0.55,
              borderLeft: activeId === id ? "2px solid #D6452F" : "2px solid transparent",
              paddingLeft: 10,
              marginLeft: -12,
            }}
          >
            <span style={{ color: "#B9873F" }}>{n}</span>{label}
          </a>
        ))}
      </nav>

      {/* ── Main content ── */}
      <main style={{ marginLeft: 220, width: "calc(100% - 220px)" }}>

        {/* ── HERO ── */}
        <header
          id="hero"
          className="relative overflow-hidden"
          style={{ minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", borderBottom: "1px solid #D9E2DF" }}
        >
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 44px 130px", position: "relative", zIndex: 2 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: "#B9873F", textTransform: "uppercase", marginBottom: 18 }}>
              B2B HEALTH-TECH · MOROCCO · <span style={{ color: "#D6452F" }}>SEED / BOOTSTRAPPED</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 5.2vw, 56px)", lineHeight: 1.06, letterSpacing: "-0.022em", color: "#0F312D", marginBottom: 20, maxWidth: 760 }}>
              Remote Patient Monitoring,<br />delivered as infrastructure.
            </h1>
            <p style={{ fontSize: 18, color: "#2A4A45", maxWidth: "54ch", lineHeight: 1.65, marginBottom: 44 }}>
              A cloud-native telemetry pipeline that lets one clinic nurse safely watch 100 discharged post-op patients at home — turning empty recovery beds into revenue and rural distance into a solved problem.
            </p>
            <div className="flex flex-wrap gap-8">
              <MetricCard value="$150K" label="Founder capital" />
              <MetricCard value="$0" label="Upfront cost to clinics" />
              <MetricCard value="$60–80" label="Per patient / month" />
              <MetricCard value="~$900" label="Monthly cloud floor" />
              <MetricCard value="10" label="Clinic contracts · yr 1" />
            </div>
          </div>
          <EcgTrace />
        </header>

        {/* ── Content wrapper ── */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 44px" }}>

          {/* ── S01 Executive Summary ── */}
          <section id="s1" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="01" title="Executive Summary" badge="orig" />
            <p style={{ fontSize: 18, color: "#2A4A45", marginBottom: 28, lineHeight: 1.65 }}>
              Moroccan private clinics earn from surgeries, not from occupied recovery beds — yet a nursing shortage and weak post-discharge care force them to keep patients hospitalized longer than needed.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {[
                { k: "PROBLEM 01", t: "Severe nursing shortage", d: "Too few trained nurses track too many in-hospital patients, so manual observation cannot scale." },
                { k: "PROBLEM 02", t: "Bed turnover friction", d: "Clinics profit from active surgeries. Fear of post-op complications at home delays discharge and blocks profitable beds." },
                { k: "PROBLEM 03", t: "Urban–rural care gap", d: "Elite facilities cluster in Casablanca, Rabat, and Marrakech. Rural patients get world-class surgery then go home to zero follow-up." },
              ].map(({ k, t, d }) => (
                <div key={k} className="rounded-lg p-5" style={{ background: "#fff", border: "1px solid #D9E2DF" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#B9873F", marginBottom: 8 }}>{k}</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 8, color: "#0F312D" }}>{t}</div>
                  <p style={{ fontSize: 13.5, color: "#33534E", margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 12, color: "#0F312D" }}>The Solution</h3>
            <p style={{ color: "#33534E", lineHeight: 1.7, marginBottom: 14 }}>
              A B2B <strong>Hardware-as-a-Service + Software-as-a-Service</strong> platform. Clinics hand discharging patients a pre-configured cellular wearable. The device streams vital signs (heart rhythm, SpO₂, blood pressure) to our cloud in real time. The moment a reading crosses a clinical threshold, the clinic's on-duty nurse gets an instant dashboard alert and SMS.
            </p>
            <p style={{ color: "#33534E", lineHeight: 1.7 }}>
              <strong>Positioning:</strong> we do not build hardware and we do not deliver medical care. We are the <em>data fabric</em> — the pipe, the alarm, and the dashboard — that lets one desk nurse safely monitor up to 100 remote patients simultaneously.
            </p>
            <PlainBox>
              <p className="mb-2"><strong>RPM:</strong> tracking a patient's vital signs from their home instead of a hospital bed.</p>
              <p className="mb-2"><strong>HaaS / SaaS:</strong> the clinic never buys anything. It rents the devices and the software together for one monthly fee per patient — like leasing, not purchasing.</p>
              <p className="mb-0"><strong>Telemetry:</strong> the continuous stream of measurements (heart rate, oxygen, blood pressure) a device sends automatically over the mobile network.</p>
            </PlainBox>
          </section>

          {/* ── S02 Market ── */}
          <section id="s2" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="02" title="Market Opportunity" badge="added" />
            <p style={{ fontSize: 17, color: "#2A4A45", marginBottom: 24, lineHeight: 1.65 }}>
              Investors will ask "how big is this?" before anything else. Here is the sizing framework — the exact figures must be validated in the field during the pilot phase.
            </p>
            <div className="rounded-lg overflow-hidden mb-6" style={{ border: "1px solid #D9E2DF" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, background: "#fff" }}>
                <thead>
                  <tr style={{ background: "#E3EEEC" }}>
                    {["Layer", "Definition", "Working assumption"].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.10em", color: "#16605A", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { l: "TAM", def: "All private clinics in Morocco performing surgery and discharging at-risk patients", note: "Several hundred private clinics nationally; Morocco's private health sector expanding under AMO universal-coverage reform" },
                    { l: "SAM", def: "High-end cardiology, cardiac-surgery and internal-medicine clinics in Casablanca, Rabat, Marrakech, Tangier", note: "Est. 60–100 target clinics; validate by building a named list in month 1" },
                    { l: "SOM", def: "Clinics reachable through one well-networked medical distributor in year 1–2", note: "10 contracts × avg. 25 active patients × $70 ≈ $17,500 MRR" },
                  ].map(({ l, def, note }) => (
                    <tr key={l} style={{ borderTop: "1px solid #D9E2DF" }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#0F312D", whiteSpace: "nowrap" }}>{l}</td>
                      <td className="px-4 py-3" style={{ color: "#33534E" }}>{def}</td>
                      <td className="px-4 py-3" style={{ color: l === "SOM" ? "#16605A" : "#33534E", fontFamily: l === "SOM" ? "'IBM Plex Mono', monospace" : undefined, fontSize: l === "SOM" ? 13 : undefined }}>{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 10, color: "#0F312D" }}>Why Now</h3>
            <p style={{ color: "#33534E", lineHeight: 1.7 }}>
              Three tailwinds converge: (1) Morocco's push toward generalized health coverage is driving private-sector investment and patient volume; (2) cellular IoT hardware with medical CE marks is now cheap and off-the-shelf; (3) no dominant local RPM player exists yet — the competition is <strong>paper follow-up sheets and phone calls</strong>, not another startup.
            </p>
          </section>

          {/* ── S03 Technical Architecture ── */}
          <section id="s3" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="03" title="Technical Architecture" badge="orig" />
            <p style={{ fontSize: 17, color: "#2A4A45", marginBottom: 28, lineHeight: 1.65 }}>
              Healthcare telemetry is continuous and life-critical, so the backend skips fragile request/response APIs in favor of an immutable, event-driven streaming pipeline.
            </p>
            <style>{`
              @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 0 2px rgba(214,69,47,0.15); }
                50% { box-shadow: 0 0 0 6px rgba(214,69,47,0.30); }
              }
            `}</style>
            <div className="flex flex-col gap-0 mb-6">
              {[
                { icon: <Radio size={16} />, label: "Cellular OEM Wearable", desc: "Encrypted MQTT over 4G LTE-M — no Wi-Fi, no Bluetooth, no app. Works out of the box at patient's home.", alert: false },
                { icon: <Cloud size={16} />, label: "AWS IoT Core", desc: "Secure front door: authenticates every device certificate and receives encrypted packets at scale.", alert: false },
                { icon: <Database size={16} />, label: "Amazon MSK (Kafka)", desc: "Immutable event log absorbing millions of data points per minute without dropping a packet. 24-hour retention.", alert: false },
                { icon: <Zap size={16} />, label: "Alerting Engine (Go/Rust)", desc: "Watches the stream in real time. SpO₂ < 90% or acute heart-rate spike bypasses the database and fires WebSocket alert + emergency SMS instantly.", alert: true },
                { icon: <Server size={16} />, label: "Amazon EKS + ArgoCD", desc: "All services run containerized on Kubernetes, deployed by GitOps: zero-downtime updates, self-healing, automatic rollback.", alert: false },
                { icon: <Database size={16} />, label: "Amazon S3 Standard-IA", desc: "After evaluation, telemetry is bundled and archived to compliant long-term storage for clinical audit trails.", alert: false },
              ].map(({ icon, label, desc, alert }, i, arr) => (
                <div key={label}>
                  <PipeNode icon={icon} label={label} desc={desc} alert={alert} />
                  {i < arr.length - 1 && (
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#16605A", padding: "4px 0 4px 26px", fontSize: 12, opacity: 0.7 }}>│ ▼</div>
                  )}
                </div>
              ))}
            </div>
            <PlainBox>
              <p className="mb-2"><strong>MQTT:</strong> a lightweight messaging protocol designed for small devices on weak networks — like SMS for machines, but constant and encrypted.</p>
              <p className="mb-2"><strong>Kafka:</strong> a conveyor belt for data. Every reading is placed on the belt in order and nothing falls off, even at massive volume.</p>
              <p className="mb-0"><strong>Why the alert "bypasses the database":</strong> writing to disk first adds seconds. For a patient whose oxygen is crashing, the alarm must fire in milliseconds — storage happens afterwards.</p>
            </PlainBox>
          </section>

          {/* ── S04 Hardware ── */}
          <section id="s4" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="04" title="Hardware Procurement Strategy" badge="orig" />
            <p style={{ fontSize: 17, color: "#2A4A45", marginBottom: 24, lineHeight: 1.65 }}>
              We never build hardware. We white-label medically certified devices from established Asian OEM/ODM factories and point their firmware at our cloud.
            </p>
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { k: "DEVICE CLASS A", t: "Continuous ECG Patches", d: "e.g. Viatom / Wellue ER1 class — 18g clinical single-lead ECG worn on the chest, streaming heart data continuously for 24–72h per charge." },
                { k: "DEVICE CLASS B", t: "Cellular Blood-Pressure Cuffs", d: "e.g. Transtek TeleRPM class — familiar home BP monitor with a built-in SIM that transmits each reading on button-press, no Wi-Fi needed." },
              ].map(({ k, t, d }) => (
                <div key={k} className="rounded-lg p-5" style={{ background: "#fff", border: "1px solid #D9E2DF" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#B9873F", marginBottom: 8 }}>{k}</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 8, color: "#0F312D" }}>{t}</div>
                  <p style={{ fontSize: 13.5, color: "#33534E", margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
            <div style={{ borderLeft: "2px solid #D9E2DF", marginLeft: 6, paddingLeft: 26 }}>
              {[
                { m: "STEP 1 · $1,500", t: "Prototype Sampling", d: "Buy 5–10 developer units across target OEMs. Reverse the JSON payload structure and validate the full ingestion loop in the dev environment." },
                { m: "STEP 2", t: "Factory Selection", d: "Only factories holding an active Medical CE Mark qualify — Moroccan regulation mirrors European frameworks, so CE dramatically accelerates import approval." },
                { m: "STEP 3 · MOQ ~500 · first batch 50 ($6,000)", t: "White-Label Order", d: "Factory prints our logo on shells and boxes, and flashes firmware so devices transmit to our AWS IoT endpoints instead of the factory cloud." },
                { m: "STEP 4 · ADDED", t: "Connectivity Contract", d: "Sign an M2M SIM agreement with Maroc Telecom / Orange / inwi or a global roaming-SIM provider. Verify LTE-M/NB-IoT coverage on real patient routes." },
              ].map(({ m, t, d }) => (
                <div key={t} className="relative pb-7" style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: -33, top: 5, width: 12, height: 12, borderRadius: "50%", background: "#F4F7F6", border: "2.5px solid #D6452F" }} />
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "#B9873F", textTransform: "uppercase", marginBottom: 3 }}>{m}</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 15, color: "#0F312D", marginBottom: 5 }}>{t}</div>
                  <p style={{ fontSize: 14, color: "#33534E", margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── S05 Regulatory ── */}
          <section id="s5" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="05" title="Regulatory & Compliance" badge="added" />
            <p style={{ fontSize: 17, color: "#2A4A45", marginBottom: 24, lineHeight: 1.65 }}>
              This is the section clinics' lawyers will read first. Health data is the most protected data category in Moroccan law, and it must be handled before the first patient is enrolled.
            </p>
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #D9E2DF" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, background: "#fff" }}>
                <thead>
                  <tr style={{ background: "#E3EEEC" }}>
                    {["Area", "Requirement", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#16605A", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { a: "Personal data — Law 09-08 / CNDP", r: "Processing health data in Morocco requires prior authorization from the CNDP national data-protection commission.", x: "File the CNDP authorization dossier in month 1 with local counsel. Budgeted in the $10K legal line." },
                    { a: "Data residency & transfers", r: "Sending Moroccan health data to foreign servers requires CNDP-approved cross-border transfer mechanisms.", x: "Deploy in approved AWS region, encrypt end-to-end, pseudonymize patient identity. Cover transfers explicitly in CNDP filing." },
                    { a: "Medical device import — DMP", r: "Wearables must be registered with the Ministry of Health's device directorate; CE mark accelerates but does not replace this.", x: "OEM's CE technical file + a local importer of record. Confirm whether we or the distributor act as importer." },
                    { a: "Liability positioning", r: "The platform must not be construed as practicing medicine or guaranteeing clinical intervention.", x: "Contracts state: the platform transmits data and alerts; all clinical decisions remain with the clinic. Carry professional liability + cyber insurance." },
                  ].map(({ a, r, x }) => (
                    <tr key={a} style={{ borderTop: "1px solid #D9E2DF" }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#0F312D", fontSize: 13, verticalAlign: "top" }}>{a}</td>
                      <td className="px-4 py-3" style={{ color: "#33534E", verticalAlign: "top" }}>{r}</td>
                      <td className="px-4 py-3" style={{ color: "#33534E", verticalAlign: "top" }}>{x}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── S06 Financial ── */}
          <section id="s6" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="06" title="Financial Plan" badge="orig" />
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 16, color: "#0F312D" }}>Capital Allocation · $150,000</h3>
            {[
              { l: "AWS infrastructure (12 mo)", p: 22, v: "$32,850", hot: false },
              { l: "Hardware — first batch 50 devices", p: 14, v: "$21,000", hot: false },
              { l: "Engineering salaries (2 FTEs × 6 mo)", p: 30, v: "$45,000", hot: false },
              { l: "Legal, CNDP filing, insurance", p: 7, v: "$10,500", hot: false },
              { l: "Sales & distributor onboarding", p: 10, v: "$15,000", hot: false },
              { l: "Runway reserve (8 weeks)", p: 17, v: "$25,650", hot: true },
            ].map(({ l, p, v, hot }) => (
              <div key={l} className="flex items-center gap-4 mb-2.5" style={{ display: "grid", gridTemplateColumns: "240px 1fr 90px", gap: 14, alignItems: "center" }}>
                <div style={{ fontSize: 13.5, color: "#33534E", textAlign: "right" }}>{l}</div>
                <div style={{ height: 13, background: "#E3EEEC", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p}%`, background: hot ? "#D6452F" : "#16605A", borderRadius: 3, transition: "width 0.5s" }} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: hot ? "#D6452F" : "#0F312D" }}>{v}</div>
              </div>
            ))}
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 17, marginTop: 36, marginBottom: 16, color: "#0F312D" }}>Revenue model</h3>
            <div className="flex items-center gap-0 flex-wrap" style={{ margin: "0 0 24px" }}>
              {[
                { a: "$150", w: "Patient pays clinic / month", hot: false },
                { arrow: true },
                { a: "$70", w: "Clinic pays RPM Morocco", hot: true },
                { arrow: true },
                { a: "$80", w: "Clinic keeps as margin", hot: false },
              ].map((item, i) => "arrow" in item ? (
                <div key={i} style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#B9873F", padding: "0 12px", fontSize: 18 }}>→</div>
              ) : (
                <div key={i} className="flex-1 rounded-lg text-center p-4" style={{ background: "#fff", border: "1px solid #D9E2DF", minWidth: 130 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 500, color: item.hot ? "#D6452F" : "#16605A" }}>{item.a}</div>
                  <div style={{ fontSize: 12, color: "#5A756F", marginTop: 4 }}>{item.w}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── S07 GTM ── */}
          <section id="s7" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="07" title="Go-To-Market" badge="orig" />
            <p style={{ color: "#33534E", lineHeight: 1.7, marginBottom: 20 }}>
              Direct clinic cold-calling does not work in Moroccan healthcare. The model is a single, exclusive medical-device distributor with pre-existing relationships inside 20–30 target clinics. The distributor's sales team handles client acquisition; RPM Morocco handles onboarding, training, and ongoing device support.
            </p>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 8 }}>
              {[
                { k: "MONTHS 1–3", t: "Pilot", d: "Sign 2 flagship clinics. Run a 30-patient pilot at zero cost to clinic. Collect clinical outcomes, refine alert thresholds, fix integration issues." },
                { k: "MONTHS 4–9", t: "Regional scale", d: "Activate distributor network in Casablanca + Rabat. Target 5 paid contracts. $8,750 MRR milestone." },
                { k: "MONTHS 10–12", t: "10-contract target", d: "Reach $17,500 MRR. Begin talks with insurance payers for a per-readmission-avoided rebate model." },
              ].map(({ k, t, d }) => (
                <div key={k} className="rounded-lg p-5" style={{ background: "#fff", border: "1px solid #D9E2DF" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#B9873F", marginBottom: 8 }}>{k}</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 8, color: "#0F312D" }}>{t}</div>
                  <p style={{ fontSize: 13.5, color: "#33534E", margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── S08 Risk ── */}
          <section id="s8" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="08" title="Risk Analysis" badge="added" />
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #D9E2DF" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, background: "#fff" }}>
                <thead>
                  <tr style={{ background: "#E3EEEC" }}>
                    {["Risk", "Likelihood", "Mitigation"].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#16605A", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { r: "Alert misses causing patient harm", l: "Low", m: "Dead-man switch + mandatory nurse acknowledgement + audit log. Carry liability insurance." },
                    { r: "Distributor exclusivity lock-in fails", l: "Medium", m: "Non-exclusive first contract; right to self-sign after 90 days of no introductions." },
                    { r: "CNDP authorization rejected or delayed", l: "Medium", m: "File early, use specialist counsel, operate pilot in-country only. Pseudonymize all identifiers in transit." },
                    { r: "Device cellular coverage gaps in rural areas", l: "High", m: "Require 2G/Cat-1 fallback in device spec. Conduct pre-discharge coverage check via tool provided to clinic." },
                    { r: "Competitor entry from well-funded EU RPM players", l: "Low–Medium", m: "Speed of first-mover advantage + local regulatory knowledge + Arabic/French-language support moat." },
                  ].map(({ r, l, m }) => (
                    <tr key={r} style={{ borderTop: "1px solid #D9E2DF" }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#0F312D", verticalAlign: "top" }}>{r}</td>
                      <td className="px-4 py-3" style={{ color: l === "High" ? "#D6452F" : l === "Medium" ? "#B9873F" : "#16605A", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, verticalAlign: "top" }}>{l}</td>
                      <td className="px-4 py-3" style={{ color: "#33534E", verticalAlign: "top" }}>{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── S09 Roadmap ── */}
          <section id="s9" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="09" title="12-Month Roadmap" badge="added" />
            <div style={{ borderLeft: "2px solid #D9E2DF", marginLeft: 6, paddingLeft: 26 }}>
              {[
                { m: "Q1 · JAN–MAR 2026", t: "Foundation", d: "File CNDP dossier. Order 50 prototype devices. Build MVP ingestion pipeline on AWS. Sign distributor LOI. Hire lead engineer." },
                { m: "Q2 · APR–JUN 2026", t: "Pilot Launch", d: "Deploy pilot at 2 flagship Casablanca clinics. 30 patients each. Nurse onboarding + training kit. Refine alert thresholds with medical advisor." },
                { m: "Q3 · JUL–SEP 2026", t: "Commercial Scale", d: "Activate distributor network. Target 5 paid contracts. Launch SMS alert + escalation system. Achieve $8,750 MRR milestone." },
                { m: "Q4 · OCT–DEC 2026", t: "10-Contract Target", d: "Reach $17,500 MRR. Second city expansion (Rabat). Begin insurance payer conversations. Seek Series A or revenue-based financing." },
              ].map(({ m, t, d }) => (
                <div key={t} className="relative pb-8">
                  <div style={{ position: "absolute", left: -33, top: 5, width: 12, height: 12, borderRadius: "50%", background: "#F4F7F6", border: "2.5px solid #D6452F" }} />
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "#B9873F", textTransform: "uppercase", marginBottom: 3 }}>{m}</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 16, color: "#0F312D", marginBottom: 5 }}>{t}</div>
                  <p style={{ fontSize: 14, color: "#33534E", margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── S10 KPIs ── */}
          <section id="s10" style={{ padding: "72px 0", borderBottom: "1px solid #D9E2DF" }}>
            <SectionHead n="10" title="KPIs & Metrics" badge="added" />
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 8 }}>
              {[
                { k: "MRR TARGET", v: "$17,500", l: "Month 12 recurring revenue", c: "#16605A" },
                { k: "ACTIVE PATIENTS", v: "250+", l: "Monitored concurrently at yr 1", c: "#16605A" },
                { k: "ALERT LATENCY", v: "<500ms", l: "Threshold breach to nurse screen", c: "#D6452F" },
                { k: "DEVICE UPTIME", v: ">99.5%", l: "Monthly fleet availability SLA", c: "#16605A" },
                { k: "CHURN TARGET", v: "<5%", l: "Annual clinic contract churn", c: "#B9873F" },
                { k: "CAC RATIO", v: "3:1", l: "LTV to Customer Acquisition Cost", c: "#16605A" },
              ].map(({ k, v, l, c }) => (
                <div key={k} className="rounded-lg p-5" style={{ background: "#fff", border: "1px solid #D9E2DF" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#B9873F", marginBottom: 8 }}>{k}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 500, color: c, marginBottom: 4 }}>{v}</div>
                  <div style={{ fontSize: 12.5, color: "#5A756F" }}>{l}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── S11 Open Items ── */}
          <section id="s11" style={{ padding: "72px 0 96px" }}>
            <SectionHead n="11" title="Open Items" badge="added" />
            <p style={{ color: "#33534E", lineHeight: 1.7, marginBottom: 20 }}>
              These are unresolved decisions that must be closed before seed capital is fully committed or the pilot begins.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Confirm distributor identity and exclusivity terms before month 1",
                "Engage specialist counsel and file CNDP authorization dossier",
                "Lock down the AWS region for Moroccan data residency compliance",
                "Run coverage mapping tool with LTE-M/NB-IoT across top 10 pilot patient zip codes",
                "Select lead medical advisor (cardiologist or intensivist) for threshold validation",
                "Determine importer-of-record structure for DMP device registration",
                "Negotiate M2M SIM pricing floor with at least 2 Moroccan operators",
                "Define nurse alert escalation chain (who is secondary contact if primary doesn't acknowledge within 5 min)",
              ].map((item) => (
                <li key={item} style={{ padding: "10px 0 10px 36px", position: "relative", borderBottom: "1px dashed #D9E2DF", fontSize: 15, color: "#33534E" }}>
                  <span style={{ position: "absolute", left: 8, color: "#D6452F", fontFamily: "'IBM Plex Mono', monospace", fontSize: 14 }}>→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <footer style={{ padding: "40px 44px 60px", borderTop: "1px solid #D9E2DF", maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#5A756F" }}>
            RPM▮MOROCCO · Business Plan v2.0 · Confidential & Proprietary · {new Date().getFullYear()}
          </div>
        </footer>
      </main>
    </div>
  );
}
