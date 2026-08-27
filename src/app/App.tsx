import { useState, useEffect, useRef } from "react";
import {
  Activity, AlertTriangle, Bell, CheckCircle, Wifi, Server,
  Shield, TrendingUp, Users, Zap, Radio, Check, X, ChevronRight,
  Database, Cloud, Cpu, Globe, BarChart2, Clock, ArrowRight,
  BellOff, SlidersHorizontal, Monitor, FileText, Lock,
  Bluetooth, Signal, Battery, BatteryLow, WifiOff, UserCheck,
  UserX, UserPlus, Key, Eye, EyeOff, RefreshCw, Trash2, Edit3,
  ChevronDown, Filter, LayoutGrid, List, AlertCircle, LogIn,
  User, LogOut, Phone, PhoneCall, PhoneOff, MapPin, Navigation,
  Calendar, CalendarPlus, Stethoscope, HeartPulse, ClipboardList,
  PenLine, ChevronUp, Siren
} from "lucide-react";
import {
  Screen, SparkPoint, Patient, LoggedUser, RPMNotification, RiskLevel,
  Spark, SEED, STAFF_SEED, CREDS, SUBSCRIBED_PATIENTS, ROLE_SCREENS,
  RISK_CFG, getRisk, pushSpark, clamp, buildNotifications,
  MED_RECORDS, inputStyle, STAFF_STATUS_CFG, SPECIALTY_LABELS, APPT_SEED, TYPE_CFG, genSpark,
} from "./shared";
import { LandingScreen } from "./LandingScreen";
import { RecordsScreen } from "./RecordsScreen";
import { CalendarScreen, StaffProfileModal } from "./CalendarScreen";

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen({ currentUser }: { currentUser: LoggedUser }) {
  const [patients, setPatients] = useState<Patient[]>(SEED);
  const [selectedId, setSelectedId] = useState<string | null>(SEED.find(p => p.alert)?.id ?? null);
  const [thresholds, setThresholds] = useState<Record<string, { spo2: number; hr: number }>>(
    Object.fromEntries(SEED.map(p => [p.id, { spo2: p.thresholdSpo2, hr: p.thresholdHrHigh }]))
  );
  const [latency, setLatency] = useState(42);
  const [now, setNow] = useState(new Date());
  const [showAddPatient, setShowAddPatient] = useState(false);

  const canAddPatient = ["nurse", "admin"].includes(currentUser.role);

  const handleAddPatient = (p: Patient, rec: MedRecord, cred: { id: string; user: LoggedUser }) => {
    setPatients(prev => [...prev, p]);
    // Persist into shared module-level data so Records/Alerts also see the new patient
    SEED.push(p);
    MED_RECORDS[p.id] = rec;
    CREDS[cred.id] = { pass: "patient2026", user: cred.user };
    SUBSCRIBED_PATIENTS.add(cred.id);
    setShowAddPatient(false);
  };

  // Simulate live telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients(prev => prev.map(p => {
        const newSpo2 = clamp(p.spo2 + (Math.random() - 0.5) * 0.6, 82, 100);
        const newHr = clamp(p.hr + (Math.random() - 0.48) * 2, 45, 160);
        const newBp = clamp(p.bpSys + (Math.random() - 0.5) * 1.5, 90, 200);
        const t = thresholds[p.id] ?? { spo2: p.thresholdSpo2, hr: p.thresholdHrHigh };
        const nowAlert = (newSpo2 < t.spo2 || newHr > t.hr) && !p.acknowledged;
        return {
          ...p,
          spo2: Math.round(newSpo2 * 10) / 10,
          hr: Math.round(newHr),
          bpSys: Math.round(newBp),
          alert: nowAlert,
          alertType: newSpo2 < t.spo2 ? "SpO₂ CRITICAL" : newHr > t.hr ? "HR ELEVATED" : "",
          spo2Data: pushSpark(p.spo2Data, newSpo2),
          hrData: pushSpark(p.hrData, newHr),
          bpData: pushSpark(p.bpData, newBp),
        };
      }));
      setLatency(Math.round(28 + Math.random() * 30));
      setNow(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, [thresholds]);

  const alertPatients = patients.filter(p => p.alert);
  const selected = patients.find(p => p.id === selectedId) ?? null;

  const acknowledge = (id: string) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, alert: false, acknowledged: true, alertType: "" } : p));
    const next = patients.find(p => p.alert && p.id !== id);
    setSelectedId(next?.id ?? null);
  };

  const updateThreshold = (id: string, key: "spo2" | "hr", val: number) => {
    setThresholds(prev => ({ ...prev, [id]: { ...prev[id], [key]: val } }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#F4F7F6", overflow: "hidden" }}>
      {/* ── Status header ── */}
      <div style={{ background: "#0F312D", borderBottom: "1px solid #1a4a44", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "0.02em" }}>
            RPM<span style={{ color: "#D6452F" }}>▮</span>MOROCCO
          </span>
          <span style={{ width: 1, height: 16, background: "#1a4a44" }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5A9E96" }}>
            NURSE COMMAND DASHBOARD
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <StatusPill icon={<Wifi size={11} />} label="Cellular Fleet" value={`${patients.length}/9 ACTIVE`} ok />
          <StatusPill icon={<Zap size={11} />} label="Pipeline Latency" value={`${latency}ms`} ok={latency < 80} />
          <StatusPill icon={<Bell size={11} />} label="Active Alerts" value={`${alertPatients.length}`} ok={alertPatients.length === 0} alert={alertPatients.length > 0} />
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5A9E96" }}>
            {now.toLocaleTimeString("en-GB", { hour12: false })}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Patient table ── */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: "#0F312D" }}>
              Active Monitored Patients
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 400, color: "#5A756F", marginLeft: 10 }}>{patients.length} patients · live</span>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16605A", animation: "pulse-dot 1.4s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#16605A", letterSpacing: "0.10em" }}>STREAMING</span>
              </div>
              {canAddPatient && (
                <button onClick={() => setShowAddPatient(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "#0F312D", color: "#fff", border: "none", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12.5 }}>
                  <UserPlus size={13} /> Nouveau patient
                </button>
              )}
            </div>
          </div>

          <style>{`
            @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
            @keyframes alert-row { 0%,100%{background:#fff} 50%{background:#FFF5F3} }
          `}</style>

          <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#E3EEEC" }}>
                  {["ID", "Patient", "Ward", "SpO₂", "", "HR", "", "BP", "", "Status"].map((h, i) => (
                    <th key={i} className="text-left" style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#16605A", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      borderTop: "1px solid #D9E2DF",
                      cursor: "pointer",
                      background: p.alert ? undefined : selectedId === p.id ? "#F4F7F6" : "#fff",
                      animation: p.alert ? "alert-row 1.8s ease-in-out infinite" : undefined,
                    }}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#5A756F" }}>{p.id}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 500, fontSize: 13.5, color: "#0F312D" }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: "#5A756F" }}>{p.condition} · {p.age}y</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, background: "#E3EEEC", color: "#16605A", padding: "2px 7px", borderRadius: 3 }}>{p.ward}</span>
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: p.spo2 < (thresholds[p.id]?.spo2 ?? 90) ? "#D6452F" : "#0F312D", fontWeight: p.spo2 < (thresholds[p.id]?.spo2 ?? 90) ? 600 : 400 }}>
                      {p.spo2.toFixed(1)}%
                    </td>
                    <td style={{ padding: "6px 4px" }}><Spark data={p.spo2Data} color={p.spo2 < (thresholds[p.id]?.spo2 ?? 90) ? "#D6452F" : "#16605A"} /></td>
                    <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: p.hr > (thresholds[p.id]?.hr ?? 110) ? "#D6452F" : "#0F312D", fontWeight: p.hr > (thresholds[p.id]?.hr ?? 110) ? 600 : 400 }}>
                      {p.hr} bpm
                    </td>
                    <td style={{ padding: "6px 4px" }}><Spark data={p.hrData} color={p.hr > (thresholds[p.id]?.hr ?? 110) ? "#D6452F" : "#B9873F"} /></td>
                    <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#0F312D" }}>{p.bpSys}/{p.bpDia}</td>
                    <td style={{ padding: "6px 4px" }}><Spark data={p.bpData} color="#5A756F" /></td>
                    <td style={{ padding: "10px 12px" }}>
                      {p.alert ? (
                        <span style={{ background: "#FBEAE6", color: "#D6452F", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                          ● {p.alertType}
                        </span>
                      ) : (
                        <span style={{ background: "#E3EEEC", color: "#16605A", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.08em" }}>
                          ✓ STABLE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Alert / detail panel ── */}
        <div style={{ width: 340, borderLeft: "1px solid #D9E2DF", display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff", flexShrink: 0 }}>
          {/* Alerts */}
          {alertPatients.length > 0 && (
            <div style={{ background: "#D6452F", padding: "12px 16px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <AlertTriangle size={14} color="#fff" />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#fff", letterSpacing: "0.12em" }}>
                  {alertPatients.length} ACTIVE ALERT{alertPatients.length > 1 ? "S" : ""}
                </span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                Immediate clinical review required
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
            {/* Alert cards */}
            {alertPatients.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {alertPatients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      border: `2px solid ${selectedId === p.id ? "#D6452F" : "rgba(214,69,47,0.3)"}`,
                      borderRadius: 8,
                      padding: 14,
                      marginBottom: 8,
                      cursor: "pointer",
                      background: selectedId === p.id ? "#FFF5F3" : "#fff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "#0F312D" }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: "#5A756F" }}>{p.condition}</div>
                      </div>
                      <span style={{ background: "#FBEAE6", color: "#D6452F", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "3px 7px", borderRadius: 3, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                        {p.alertType}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, color: p.spo2 < 90 ? "#D6452F" : "#0F312D", fontWeight: 600 }}>{p.spo2.toFixed(1)}%</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", letterSpacing: "0.1em" }}>SPO₂</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, color: p.hr > 110 ? "#D6452F" : "#0F312D", fontWeight: 600 }}>{p.hr}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", letterSpacing: "0.1em" }}>BPM</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, color: "#0F312D", fontWeight: 600 }}>{p.bpSys}/{p.bpDia}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", letterSpacing: "0.1em" }}>MMHG</div>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); acknowledge(p.id); }}
                      style={{
                        width: "100%",
                        background: "#D6452F",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "8px 0",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        letterSpacing: "0.02em",
                      }}
                    >
                      <Check size={14} /> Acknowledge Alert
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected patient threshold tuning */}
            {selected && (
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#B9873F", textTransform: "uppercase", marginBottom: 12 }}>
                  Threshold Configuration · {selected.id}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F312D", marginBottom: 2 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: "#5A756F", marginBottom: 16 }}>{selected.condition}</div>

                <ThresholdSlider
                  label="SpO₂ Alert Threshold"
                  value={thresholds[selected.id]?.spo2 ?? 90}
                  min={80}
                  max={95}
                  unit="%"
                  color="#D6452F"
                  onChange={v => updateThreshold(selected.id, "spo2", v)}
                  hint="Alert fires when SpO₂ drops below this value"
                />
                <ThresholdSlider
                  label="Heart Rate Upper Threshold"
                  value={thresholds[selected.id]?.hr ?? 110}
                  min={90}
                  max={140}
                  unit=" bpm"
                  color="#B9873F"
                  onChange={v => updateThreshold(selected.id, "hr", v)}
                  hint="Alert fires when HR exceeds this value"
                />

                <div style={{ borderTop: "1px solid #D9E2DF", paddingTop: 14, marginTop: 6 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#16605A", marginBottom: 8 }}>LIVE TELEMETRY</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#5A756F" }}>SpO₂ trend</span>
                    <Spark data={selected.spo2Data} color={selected.spo2 < (thresholds[selected.id]?.spo2 ?? 90) ? "#D6452F" : "#16605A"} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#5A756F" }}>Heart rate trend</span>
                    <Spark data={selected.hrData} color={selected.hr > (thresholds[selected.id]?.hr ?? 110) ? "#D6452F" : "#B9873F"} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#5A756F" }}>Blood pressure</span>
                    <Spark data={selected.bpData} color="#5A756F" />
                  </div>
                </div>
              </div>
            )}

            {alertPatients.length === 0 && !selected && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#5A756F" }}>
                <CheckCircle size={32} color="#16605A" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: "#16605A", marginBottom: 6 }}>ALL PATIENTS STABLE</div>
                <div style={{ fontSize: 12 }}>No active alerts. Click a patient row to view details and adjust thresholds.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Patient modal */}
      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onAdd={handleAddPatient}
          createdBy={currentUser}
        />
      )}
    </div>
  );
}


// ─── Threshold slider ──────────────────────────────────────────────────────────
function ThresholdSlider({ label, value, min, max, unit, color, onChange, hint }: {
  label: string; value: number; min: number; max: number; unit: string;
  color: string; onChange: (v: number) => void; hint: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#0F312D" }}>{label}</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color, fontWeight: 600 }}>{value}{unit}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer" }}
      />
      <div style={{ fontSize: 11, color: "#5A756F", marginTop: 3 }}>{hint}</div>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ icon, label, value, ok, alert }: { icon: React.ReactNode; label: string; value: string; ok: boolean; alert?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ color: alert ? "#D6452F" : ok ? "#5A9E96" : "#B9873F" }}>{icon}</div>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A9E96", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: alert ? "#D6452F" : ok ? "#fff" : "#B9873F", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ─── Add Patient Modal ────────────────────────────────────────────────────────
interface NewPatientForm {
  firstName: string; lastName: string; age: string; gender: string;
  condition: string; ward: string; bloodType: string; allergies: string;
  assignedDoctorId: string; assignedNurseId: string;
  address: string; emergencyContact: string; emergencyPhone: string;
  insurance: string; subscriptionPlan: string; deviceModel: string;
}

const BLANK_FORM: NewPatientForm = {
  firstName: "", lastName: "", age: "", gender: "M",
  condition: "", ward: "Cardio", bloodType: "A+", allergies: "",
  assignedDoctorId: "DR-001", assignedNurseId: "NRS-001",
  address: "", emergencyContact: "", emergencyPhone: "",
  insurance: "", subscriptionPlan: "RPM Standard · ECG + SpO₂", deviceModel: "Viatom ER1",
};

const WARDS = ["Cardio", "Ortho", "Thoracic", "Général", "Neurologie", "Oncologie", "Réanimation"];
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const SUB_PLANS = ["RPM Starter · SpO₂", "RPM Standard · ECG + SpO₂", "RPM Standard · BP + SpO₂", "RPM Premium · ECG + SpO₂ + BP"];
const DEVICE_MODELS = ["Viatom ER1","Wellue O2Ring","iHealth Track BP7","Viatom CheckMe Pro"];

// These are module-level so React never re-mounts them on parent re-renders

function APT_FieldInput({ label, value, onChange, type = "text", placeholder = "", error }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, border: error ? "1.5px solid #D6452F" : "1.5px solid #D9E2DF" }} />
      {error && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#D6452F", marginTop: 3 }}>{error}</div>}
    </div>
  );
}

function APT_SelectInput({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div>
      <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function AddPatientModal({ onClose, onAdd, createdBy }: {
  onClose: () => void;
  onAdd: (p: Patient, rec: MedRecord, cred: { id: string; user: LoggedUser }) => void;
  createdBy: LoggedUser;
}) {
  const [form, setForm] = useState<NewPatientForm>(BLANK_FORM);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Partial<NewPatientForm>>({});

  const set = (k: keyof NewPatientForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e: Partial<NewPatientForm> = {};
    if (!form.firstName.trim()) e.firstName = "Requis";
    if (!form.lastName.trim())  e.lastName  = "Requis";
    if (!form.age.trim() || isNaN(Number(form.age))) e.age = "Âge valide requis";
    if (!form.condition.trim()) e.condition = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validateStep2 = () => {
    const e: Partial<NewPatientForm> = {};
    if (!form.address.trim())          e.address          = "Requis";
    if (!form.emergencyContact.trim()) e.emergencyContact = "Requis";
    if (!form.emergencyPhone.trim())   e.emergencyPhone   = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => (s + 1) as 1 | 2 | 3);
  };

  const handleSubmit = () => {
    const nextNum = SEED.length + 1;
    const padded  = String(nextNum).padStart(3, "0");
    const newId   = `P-${padded}`;
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
    const doctor  = STAFF_SEED.find(s => s.id === form.assignedDoctorId);
    const nurse   = STAFF_SEED.find(s => s.id === form.assignedNurseId);
    const deviceId = `DEV-${padded}`;

    const newPatient: Patient = {
      id: newId, name: fullName, age: Number(form.age), condition: form.condition, ward: form.ward,
      spo2: 97, hr: 72, bpSys: 120, bpDia: 78,
      alert: false, alertType: "", acknowledged: false,
      spo2Data: genSpark(97, 1), hrData: genSpark(72, 5), bpData: genSpark(120, 5),
      thresholdSpo2: 90, thresholdHrHigh: 110,
    };

    const newRec: MedRecord = {
      patientId: newId, bloodType: form.bloodType,
      allergies: form.allergies ? form.allergies.split(",").map(a => a.trim()).filter(Boolean) : [],
      emergencyContact: form.emergencyContact, emergencyPhone: form.emergencyPhone,
      address: form.address, gpsLat: 33.5731, gpsLng: -7.5898,
      insurance: form.insurance, subscriptionPlan: form.subscriptionPlan, deviceId,
      medications: [], notes: [
        { id: "n0", author: createdBy.name, role: createdBy.role,
          date: new Date().toLocaleString("fr-FR"),
          text: `Patient enregistré par ${createdBy.name}. Médecin assigné: ${doctor?.name ?? form.assignedDoctorId}. Infirmière: ${nurse?.name ?? form.assignedNurseId}.`,
          tags: ["Admission", "Nouveau patient"] },
      ],
      messages: [
        { id: "m0", from: doctor?.name ?? form.assignedDoctorId, role: "cardiologist",
          text: `Bienvenue ${form.firstName}! Je suis votre médecin référent. N'hésitez pas à me contacter via ce chat.`,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), isStaff: true },
      ],
    };

    const newCred = { id: newId, user: { id: newId, name: fullName, role: "patient" as const, clinic: nurse?.clinic ?? "RPM Morocco", patientId: newId } };
    onAdd(newPatient, newRec, newCred);
  };

  const STEPS = ["Identité & clinique", "Contact & admin", "Appareil & assignation"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 580, maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}>
        {/* Modal header */}
        <div style={{ background: "#0F312D", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
              <UserPlus size={18} color="#16605A" /> Enregistrer un nouveau patient
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A9E96", marginTop: 3, letterSpacing: "0.08em" }}>Par {createdBy.name} · {createdBy.role}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={20} /></button>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", background: "#F4F7F6", borderBottom: "1px solid #D9E2DF" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderBottom: step === i + 1 ? "2px solid #D6452F" : "2px solid transparent" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.08em", color: step > i + 1 ? "#16605A" : step === i + 1 ? "#D6452F" : "#9AADA8", textTransform: "uppercase" }}>
                {step > i + 1 ? "✓ " : `${i + 1}. `}{s}
              </div>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <APT_FieldInput label="Prénom" value={form.firstName} onChange={v => set("firstName", v)} placeholder="Mohammed" error={errors.firstName} />
                <APT_FieldInput label="Nom de famille" value={form.lastName} onChange={v => set("lastName", v)} placeholder="Al-Fassi" error={errors.lastName} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <APT_FieldInput label="Âge" value={form.age} onChange={v => set("age", v)} type="number" placeholder="65" error={errors.age} />
                <APT_SelectInput label="Sexe" value={form.gender} onChange={v => set("gender", v)} options={[{ v: "M", l: "Masculin" }, { v: "F", l: "Féminin" }]} />
                <APT_SelectInput label="Groupe sanguin" value={form.bloodType} onChange={v => set("bloodType", v)} options={BLOOD_TYPES.map(b => ({ v: b, l: b }))} />
              </div>
              <APT_FieldInput label="Condition / Diagnostic principal" value={form.condition} onChange={v => set("condition", v)} placeholder="Post CABG, Fibrillation auriculaire, PTH..." error={errors.condition} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <APT_SelectInput label="Service / Ward" value={form.ward} onChange={v => set("ward", v)} options={WARDS.map(w => ({ v: w, l: w }))} />
                <APT_FieldInput label="Allergies connues" value={form.allergies} onChange={v => set("allergies", v)} placeholder="Pénicilline, Iode... (séparées par virgules)" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <APT_FieldInput label="Adresse domicile" value={form.address} onChange={v => set("address", v)} placeholder="12 Rue des Orangers, Casablanca 20250" error={errors.address} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <APT_FieldInput label="Contact d'urgence (nom & lien)" value={form.emergencyContact} onChange={v => set("emergencyContact", v)} placeholder="Fatima Al-Fassi (épouse)" error={errors.emergencyContact} />
                <APT_FieldInput label="Téléphone d'urgence" value={form.emergencyPhone} onChange={v => set("emergencyPhone", v)} placeholder="+212 6 XX XX XX XX" error={errors.emergencyPhone} />
              </div>
              <APT_FieldInput label="Numéro d'assurance maladie" value={form.insurance} onChange={v => set("insurance", v)} placeholder="CNOPS N°A-1234-07" />
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <APT_SelectInput label="Plan d'abonnement RPM" value={form.subscriptionPlan} onChange={v => set("subscriptionPlan", v)} options={SUB_PLANS.map(p => ({ v: p, l: p }))} />
              <APT_SelectInput label="Modèle de dispositif" value={form.deviceModel} onChange={v => set("deviceModel", v)} options={DEVICE_MODELS.map(m => ({ v: m, l: m }))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Médecin assigné</label>
                  <select value={form.assignedDoctorId} onChange={e => set("assignedDoctorId", e.target.value)} style={inputStyle}>
                    {STAFF_SEED.filter(s => ["cardiologist","physician"].includes(s.role)).map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {STAFF_STATUS_CFG[s.status].label}</option>
                    ))}
                  </select>
                  {(() => { const d = STAFF_SEED.find(s => s.id === form.assignedDoctorId); return d ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: STAFF_STATUS_CFG[d.status].dot }} />
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: STAFF_STATUS_CFG[d.status].color }}>{STAFF_STATUS_CFG[d.status].label} · {d.statusNote}</span>
                    </div>
                  ) : null; })()}
                </div>
                <div>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Infirmière assignée</label>
                  <select value={form.assignedNurseId} onChange={e => set("assignedNurseId", e.target.value)} style={inputStyle}>
                    {STAFF_SEED.filter(s => s.role === "nurse").map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {STAFF_STATUS_CFG[s.status].label}</option>
                    ))}
                  </select>
                  {(() => { const n = STAFF_SEED.find(s => s.id === form.assignedNurseId); return n ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: STAFF_STATUS_CFG[n.status].dot }} />
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: STAFF_STATUS_CFG[n.status].color }}>{STAFF_STATUS_CFG[n.status].label} · {n.statusNote}</span>
                    </div>
                  ) : null; })()}
                </div>
              </div>
              {/* Summary */}
              <div style={{ background: "#E3EEEC", border: "1px solid #16605A40", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#16605A", marginBottom: 8, textTransform: "uppercase" }}>Récapitulatif d'enregistrement</div>
                {[
                  { l: "Patient", v: `${form.firstName} ${form.lastName}, ${form.age} ans, ${form.gender === "M" ? "Masculin" : "Féminin"}` },
                  { l: "Diagnostic", v: form.condition || "—" },
                  { l: "Service", v: form.ward },
                  { l: "Abonnement", v: form.subscriptionPlan },
                  { l: "Médecin", v: STAFF_SEED.find(s => s.id === form.assignedDoctorId)?.name ?? "—" },
                  { l: "Infirmière", v: STAFF_SEED.find(s => s.id === form.assignedNurseId)?.name ?? "—" },
                ].map(({ l, v }) => (
                  <div key={l} style={{ display: "flex", gap: 10, padding: "4px 0" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", width: 80, flexShrink: 0 }}>{l.toUpperCase()}</span>
                    <span style={{ fontSize: 13, color: "#0F312D", fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #D9E2DF", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          {step > 1 && (
            <button onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 18px", cursor: "pointer", color: "#5A756F", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>← Précédent</button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 18px", cursor: "pointer", color: "#5A756F", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>Annuler</button>
          {step < 3 ? (
            <button onClick={handleNext} style={{ background: "#0F312D", color: "#fff", border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13 }}>Étape suivante →</button>
          ) : (
            <button onClick={handleSubmit} style={{ background: "#16605A", color: "#fff", border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 13 }}>
              <UserPlus size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Enregistrer le patient
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Calculator Screen ────────────────────────────────────────────────────────
function CalculatorScreen() {
  const [patients, setPatients] = useState(25);
  const [clinics, setClinics] = useState(10);
  const [active, setActive] = useState<"clinic" | "rpm" | null>(null);

  const totalPatients = patients * clinics;
  const patientRevenue = 150;
  const rpmFee = 70;
  const clinicMargin = patientRevenue - rpmFee;

  const rpmMRR = rpmFee * totalPatients;
  const clinicMRR = clinicMargin * totalPatients;
  const totalFlow = patientRevenue * totalPatients;

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "#F4F7F6", padding: "40px 44px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: "#B9873F", textTransform: "uppercase", marginBottom: 10 }}>
            SECTION 03 · FINANCIAL MODEL
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 28, color: "#0F312D", marginBottom: 6 }}>
            B2B Revenue Flow & ROI Calculator
          </h2>
          <p style={{ color: "#5A756F", fontSize: 15, marginBottom: 28 }}>
            Adjust clinic count and average active patients per clinic to model your revenue scenario.
          </p>
        </div>

        {/* Controls */}
        <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, padding: 24, marginBottom: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#0F312D" }}>Clinic Contracts</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: "#16605A", fontWeight: 600 }}>{clinics}</span>
            </label>
            <input type="range" min={1} max={50} value={clinics} onChange={e => setClinics(Number(e.target.value))} style={{ width: "100%", accentColor: "#16605A" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5A756F", marginTop: 4 }}>
              <span>1</span><span style={{ color: "#B9873F" }}>↑ Yr 1 target: 10</span><span>50</span>
            </div>
          </div>
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#0F312D" }}>Avg Patients / Clinic</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: "#16605A", fontWeight: 600 }}>{patients}</span>
            </label>
            <input type="range" min={5} max={100} value={patients} onChange={e => setPatients(Number(e.target.value))} style={{ width: "100%", accentColor: "#16605A" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5A756F", marginTop: 4 }}>
              <span>5</span><span>100</span>
            </div>
          </div>
        </div>

        {/* 3-Column flow */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 32 }}>
          {/* Patient → Clinic */}
          <FlowCard
            label="Patient Pays Clinic"
            sublabel="Per patient · per month"
            amount={`$${patientRevenue}`}
            detail={`${totalPatients.toLocaleString()} patients × $${patientRevenue} = $${totalFlow.toLocaleString()}/mo`}
            color="#0F312D"
            bg="#fff"
            icon={<Users size={20} />}
            active={active === "clinic"}
            onClick={() => setActive(active === "clinic" ? null : "clinic")}
          />
          <FlowArrow label="Clinic invoices RPM Morocco" />
          <FlowCard
            label="Clinic Pays RPM Morocco"
            sublabel="Platform fee per patient"
            amount={`$${rpmFee}`}
            detail={`${totalPatients.toLocaleString()} patients × $${rpmFee} = $${rpmMRR.toLocaleString()}/mo MRR`}
            color="#D6452F"
            bg="#FBEAE6"
            icon={<Activity size={20} />}
            active={active === "rpm"}
            onClick={() => setActive(active === "rpm" ? null : "rpm")}
            border="#D6452F"
          />
          <FlowArrow label="Clinic retains margin" />
          <FlowCard
            label="Clinic Keeps as Margin"
            sublabel="Pure profit per patient"
            amount={`$${clinicMargin}`}
            detail={`${totalPatients.toLocaleString()} patients × $${clinicMargin} = $${clinicMRR.toLocaleString()}/mo`}
            color="#16605A"
            bg="#E3EEEC"
            icon={<TrendingUp size={20} />}
            active={false}
            onClick={() => {}}
            border="#16605A"
          />
        </div>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { k: "TOTAL PATIENT FLOW", v: `$${totalFlow.toLocaleString()}`, sub: "Gross clinic RPM revenue / mo", c: "#0F312D" },
            { k: "RPM MOROCCO MRR", v: `$${rpmMRR.toLocaleString()}`, sub: "Monthly recurring to us", c: "#D6452F" },
            { k: "RPM MOROCCO ARR", v: `$${(rpmMRR * 12).toLocaleString()}`, sub: "Annualised run rate", c: "#D6452F" },
            { k: "CLINIC MONTHLY PROFIT", v: `$${clinicMRR.toLocaleString()}`, sub: "Net across all clinic contracts", c: "#16605A" },
          ].map(({ k, v, sub, c }) => (
            <div key={k} style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, padding: 18 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#B9873F", marginBottom: 8 }}>{k}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 500, color: c, marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 12, color: "#5A756F" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Break-even insight */}
        <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderLeft: "3px solid #16605A", borderRadius: 10, padding: 20 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#16605A", marginBottom: 10, textTransform: "uppercase" }}>
            Cloud Break-Even Model
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#5A756F", marginBottom: 2 }}>AWS floor cost</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: "#D6452F" }}>~$900/mo</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#5A756F", marginBottom: 2 }}>Break-even at $70/patient</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: "#0F312D" }}>13 patients</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#5A756F", marginBottom: 2 }}>Current scenario surplus</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: "#16605A" }}>
                ${Math.max(0, rpmMRR - 900).toLocaleString()}/mo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowCard({ label, sublabel, amount, detail, color, bg, icon, active, onClick, border }: {
  label: string; sublabel: string; amount: string; detail: string;
  color: string; bg: string; icon: React.ReactNode; active: boolean;
  onClick: () => void; border?: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: bg,
        border: `1.5px solid ${active ? color : border ?? "#D9E2DF"}`,
        borderRadius: 10,
        padding: "24px 20px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.15s",
        boxShadow: active ? `0 0 0 3px ${color}30` : "none",
        transform: active ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ color, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#5A756F", textTransform: "uppercase", marginBottom: 6 }}>{sublabel}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 36, fontWeight: 500, color, lineHeight: 1, marginBottom: 8 }}>{amount}</div>
      <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, color: "#0F312D", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#5A756F", lineHeight: 1.5 }}>{detail}</div>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 8px", gap: 6 }}>
      <ArrowRight size={18} color="#B9873F" />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#B9873F", textAlign: "center", letterSpacing: "0.08em", maxWidth: 64 }}>{label.toUpperCase()}</span>
    </div>
  );
}


// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (u: LoggedUser) => void }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleLogin = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const cred = CREDS[userId.trim().toUpperCase()];
      if (!cred) { setError("Identifiant inconnu. Vérifiez votre ID utilisateur."); setLoading(false); return; }
      if (cred.pass !== password) { setError("Mot de passe incorrect."); setLoading(false); return; }
      if (cred.user.role === "patient" && !SUBSCRIBED_PATIENTS.has(userId.trim().toUpperCase())) {
        setError("Accès refusé — aucun abonnement RPM actif associé à ce patient."); setLoading(false); return;
      }
      setLoading(false);
      onLogin(cred.user);
    }, 900);
  };

  const DEMO = [
    { id: "NRS-001", pass: "nurse2026", hint: "Infirmière · Clinique Al-Shifa" },
    { id: "DR-001",  pass: "doctor2026", hint: "Cardiologue · Clinique Al-Shifa" },
    { id: "ADM-001", pass: "admin2026", hint: "Administrateur · RPM HQ" },
    { id: "P-002",   pass: "patient2026", hint: "Patient abonné (accès portail)" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F7F6" }}>
      {/* Left panel */}
      <div style={{ width: 420, background: "#0F312D", display: "flex", flexDirection: "column", padding: "48px 44px", flexShrink: 0 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "0.01em" }}>
            RPM<span style={{ color: "#D6452F" }}>▮</span>MOROCCO
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#5A9E96", marginTop: 4, textTransform: "uppercase" }}>Platform v2.0 · Secure Access</div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 26, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
            Infrastructure de télémonitoring clinique
          </h2>
          <p style={{ fontSize: 14, color: "#A0C4BE", lineHeight: 1.7, marginBottom: 32 }}>
            Accès réservé aux professionnels de santé agréés et aux patients disposant d'un abonnement dispositif actif.
          </p>
          {[
            { icon: <Shield size={15} />, text: "Authentification multi-facteurs pour les comptes critiques" },
            { icon: <Lock size={15} />, text: "Chiffrement TLS 1.3 bout-en-bout — données CNDP-conformes" },
            { icon: <Activity size={15} />, text: "Monitoring continu 24h/24 avec alertes automatiques" },
            { icon: <Users size={15} />, text: "Accès segmenté par rôle — infirmière, médecin, admin, patient" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ color: "#16605A", marginTop: 1, flexShrink: 0 }}>{icon}</div>
              <div style={{ fontSize: 13.5, color: "#A0C4BE", lineHeight: 1.55 }}>{text}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#2A5A54", letterSpacing: "0.08em" }}>
          CNDP-AUTHORIZED · AWS eu-west-1 · SOC 2 TYPE II
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#B9873F", textTransform: "uppercase", marginBottom: 8 }}>CONNEXION SÉCURISÉE</div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 28, color: "#0F312D", lineHeight: 1.1 }}>Bienvenue</h1>
            <p style={{ fontSize: 14, color: "#5A756F", marginTop: 6 }}>Entrez vos identifiants pour accéder à la plateforme.</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#0F312D", marginBottom: 6 }}>Identifiant utilisateur</label>
            <input
              value={userId}
              onChange={e => setUserId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="ex: NRS-001 ou P-002"
              style={{ width: "100%", border: "1.5px solid #D9E2DF", borderRadius: 8, padding: "11px 14px", fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", background: "#fff", color: "#0F312D", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#0F312D", marginBottom: 6 }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••••"
                style={{ width: "100%", border: "1.5px solid #D9E2DF", borderRadius: 8, padding: "11px 40px 11px 14px", fontSize: 14, background: "#fff", color: "#0F312D", outline: "none", boxSizing: "border-box" }}
              />
              <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5A756F" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "#FBEAE6", border: "1px solid rgba(214,69,47,0.3)", borderRadius: 7, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertCircle size={14} color="#D6452F" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: "#D6452F" }}>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !userId || !password}
            style={{ width: "100%", background: loading ? "#5A9E96" : "#0F312D", color: "#fff", border: "none", borderRadius: 8, padding: "13px 0", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: loading || !userId || !password ? "default" : "pointer", marginBottom: 24, opacity: !userId || !password ? 0.6 : 1, letterSpacing: "0.02em", transition: "background 0.2s" }}
          >
            {loading ? "Vérification en cours..." : "Se connecter"}
          </button>

          {/* Demo credentials */}
          <div style={{ borderTop: "1px solid #D9E2DF", paddingTop: 18 }}>
            <button onClick={() => setShowHints(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: showHints ? 14 : 0 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#B9873F", textTransform: "uppercase" }}>Accès démo</span>
              <ChevronDown size={12} color="#B9873F" style={{ transform: showHints ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {showHints && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {DEMO.map(({ id, pass, hint }) => (
                  <button key={id} onClick={() => { setUserId(id); setPassword(pass); setError(""); }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F4F7F6", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 12px", cursor: "pointer", textAlign: "left" }}>
                    <div>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: "#0F312D" }}>{id}</span>
                      <span style={{ fontSize: 11.5, color: "#5A756F", marginLeft: 8 }}>{hint}</span>
                    </div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#16605A" }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Alerts / Risk Screen ─────────────────────────────────────────────────────
function AlertsScreen() {
  const patientsWithRisk = SEED.map(p => ({ ...p, risk: getRisk(p.spo2, p.hr) }))
    .sort((a, b) => {
      const order = { extreme: 0, high: 1, nurse: 2, stable: 3 };
      return order[a.risk] - order[b.risk];
    });

  const [dispatched, setDispatched] = useState<Set<string>>(new Set());
  const [callLog, setCallLog] = useState([
    { time: "06:47:03", patient: "Fatima Benali (P-002)", type: "EXTREME", action: "SAMU 15 notifié automatiquement + location GPS partagée", acked: false },
    { time: "06:47:03", patient: "Fatima Benali (P-002)", type: "EXTREME", action: "Appel automatique Aicha Bensouda (NRS-001) déclenché", acked: true },
    { time: "06:47:04", patient: "Fatima Benali (P-002)", type: "EXTREME", action: "Appel automatique Dr. Nadia Mouffak (DR-001) déclenché", acked: true },
    { time: "07:15:44", patient: "Hassan Berrada (P-007)", type: "HIGH",    action: "Appel automatique Aicha Bensouda (NRS-001) déclenché", acked: true },
    { time: "07:15:44", patient: "Hassan Berrada (P-007)", type: "HIGH",    action: "Notification Dr. Hassan Qassem (DR-002) envoyée", acked: true },
  ]);

  const [dispatchModal, setDispatchModal] = useState<string | null>(null);
  const dispatchPatient = patientsWithRisk.find(p => p.id === dispatchModal);

  const riskCounts = {
    extreme: patientsWithRisk.filter(p => p.risk === "extreme").length,
    high:    patientsWithRisk.filter(p => p.risk === "high").length,
    nurse:   patientsWithRisk.filter(p => p.risk === "nurse").length,
    stable:  patientsWithRisk.filter(p => p.risk === "stable").length,
  };

  const handleDispatch = (patientId: string) => {
    setDispatched(prev => new Set([...prev, patientId]));
    const p = patientsWithRisk.find(x => x.id === patientId);
    if (p) {
      setCallLog(prev => [
        { time: new Date().toLocaleTimeString("fr-FR", { hour12: false }), patient: `${p.name} (${p.id})`, type: "EXTREME", action: "🚨 SAMU 15 dispatché + GPS partagé — équipe en route", acked: false },
        ...prev,
      ]);
    }
    setDispatchModal(null);
  };

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "#F4F7F6" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #D9E2DF", padding: "20px 32px 0" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#B9873F", textTransform: "uppercase", marginBottom: 6 }}>SYSTÈME D'ESCALADE & PRIORITÉS CLINIQUES</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: "#0F312D", marginBottom: 18 }}>Risk Levels & Alertes Automatiques</h1>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {(["extreme","high","nurse","stable"] as RiskLevel[]).map(r => (
              <div key={r} style={{ background: RISK_CFG[r].bg, borderRadius: 8, padding: "8px 16px", textAlign: "center", border: `1px solid ${RISK_CFG[r].color}30` }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, color: RISK_CFG[r].color }}>{riskCounts[r]}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", letterSpacing: "0.08em", marginTop: 2 }}>{RISK_CFG[r].label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <div>
          {/* Escalation protocol */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {(["stable","nurse","high","extreme"] as RiskLevel[]).map(r => (
              <div key={r} style={{ background: RISK_CFG[r].bg, border: `1.5px solid ${RISK_CFG[r].color}40`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.10em", color: RISK_CFG[r].color, marginBottom: 6, textTransform: "uppercase" }}>
                  {RISK_CFG[r].icon} {RISK_CFG[r].label}
                </div>
                <div style={{ fontSize: 11.5, color: "#33534E", lineHeight: 1.5, marginBottom: 8 }}>{RISK_CFG[r].action}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F" }}>
                  {r === "stable" ? "SpO₂ ≥ 90% · FC ≤ 110" : r === "nurse" ? "SpO₂ 90–88% · FC 110–120" : r === "high" ? "SpO₂ 88–85% · FC 120–135" : "SpO₂ < 85% · FC > 135"}
                </div>
              </div>
            ))}
          </div>

          {/* Priority patient queue */}
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#B9873F", textTransform: "uppercase", marginBottom: 10 }}>
            FILE DE PRIORITÉ PATIENTS — {patientsWithRisk.length} patients
          </div>
          <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, overflow: "hidden" }}>
            {patientsWithRisk.map((p, idx) => {
              const cfg = RISK_CFG[p.risk];
              const rec = MED_RECORDS[p.id];
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: idx > 0 ? "1px solid #D9E2DF" : undefined, background: p.risk === "extreme" ? "#FFF8F7" : p.risk === "high" ? "#FFFAF8" : "#fff" }}>
                  {/* Priority rank */}
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: cfg.color, width: 24, textAlign: "center", flexShrink: 0 }}>#{idx + 1}</div>
                  {/* Risk badge */}
                  <div style={{ background: cfg.bg, color: cfg.color, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0, border: `1px solid ${cfg.color}30` }}>
                    {cfg.icon} {cfg.label}
                  </div>
                  {/* Patient info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5, color: "#0F312D" }}>{p.name}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F" }}>{p.id} · {p.condition}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#5A756F", marginTop: 2 }}>
                      {rec?.address ?? "—"} · Moniteur: {DEVICE_SEED.find(d => d.patientId === p.id)?.monitorName ?? "—"}
                    </div>
                  </div>
                  {/* Vitals */}
                  <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 600, color: getRisk(p.spo2, p.hr) !== "stable" && p.spo2 < 90 ? "#D6452F" : "#0F312D" }}>{p.spo2.toFixed(0)}%</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F" }}>SPO₂</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 600, color: p.hr > 110 ? "#D6452F" : "#0F312D" }}>{p.hr}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F" }}>BPM</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "#0F312D" }}>{p.bpSys}/{p.bpDia}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F" }}>MMHG</div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {p.risk === "nurse" && (
                      <ActionBtn label="Appeler infirmière" color="#B9873F" bg="#FDF3E3" onClick={() => setCallLog(prev => [{ time: new Date().toLocaleTimeString("fr-FR",{hour12:false}), patient: `${p.name} (${p.id})`, type:"NURSE", action:"Infirmière assignée contactée manuellement", acked: false }, ...prev])} />
                    )}
                    {p.risk === "high" && (
                      <>
                        <ActionBtn label="Infirmière + Médecin" color="#D6452F" bg="#FBEAE6" onClick={() => setCallLog(prev => [{ time: new Date().toLocaleTimeString("fr-FR",{hour12:false}), patient:`${p.name} (${p.id})`, type:"HIGH", action:"Infirmière + médecin notifiés manuellement", acked: false }, ...prev])} />
                      </>
                    )}
                    {p.risk === "extreme" && (
                      <button
                        onClick={() => setDispatchModal(p.id)}
                        disabled={dispatched.has(p.id)}
                        style={{ display: "flex", alignItems: "center", gap: 5, background: dispatched.has(p.id) ? "#E3EEEC" : "#D6452F", color: dispatched.has(p.id) ? "#16605A" : "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: dispatched.has(p.id) ? "default" : "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}
                      >
                        {dispatched.has(p.id) ? <><Check size={12} /> Ambulance dépêchée</> : <>🚨 Dispatcher ambulance</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto-call log */}
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#B9873F", textTransform: "uppercase", marginBottom: 10 }}>
            JOURNAL D'ALERTES AUTOMATIQUES
          </div>
          <div style={{ background: "#0F312D", borderRadius: 10, padding: "16px", maxHeight: 520, overflowY: "auto" }}>
            {callLog.map((log, i) => (
              <div key={i} style={{ borderBottom: i < callLog.length - 1 ? "1px solid #1a4a44" : undefined, paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A9E96" }}>{log.time}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, padding: "2px 6px", borderRadius: 3, background: log.type === "EXTREME" ? "#D6452F" : log.type === "HIGH" ? "#B9873F" : "#16605A", color: "#fff", letterSpacing: "0.06em" }}>{log.type}</span>
                  {log.acked && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A9E96" }}>✓ ACK</span>}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#fff", marginBottom: 2 }}>{log.patient}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#A0C4BE", lineHeight: 1.5 }}>{log.action}</div>
              </div>
            ))}
          </div>

          {/* Protocol reference */}
          <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderLeft: "3px solid #D6452F", borderRadius: 10, padding: "14px 16px", marginTop: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#D6452F", marginBottom: 10, textTransform: "uppercase" }}>Numéros d'urgence</div>
            {[
              { label: "SAMU Maroc", num: "15" },
              { label: "Police secours", num: "19" },
              { label: "Pompiers", num: "15" },
              { label: "Ligne RPM urgence", num: "+212 5 22 00 00 00" },
            ].map(({ label, num }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #F4F7F6" }}>
                <span style={{ fontSize: 12.5, color: "#33534E" }}>{label}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: "#D6452F" }}>{num}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambulance dispatch modal */}
      {dispatchModal && dispatchPatient && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, maxWidth: 480, width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#D6452F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🚨</div>
              <div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#D6452F" }}>Dispatch Ambulance d'Urgence</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.08em" }}>PRIORITÉ ROUGE · SAMU MAROC 15</div>
              </div>
            </div>
            <div style={{ background: "#FBEAE6", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#0F312D", marginBottom: 4 }}>{dispatchPatient.name}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5A756F" }}>{dispatchPatient.id} · {dispatchPatient.condition}</div>
            </div>
            {(() => { const rec = MED_RECORDS[dispatchPatient.id]; return rec ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.08em", marginBottom: 4 }}>ADRESSE</div>
                  <div style={{ fontSize: 13.5, color: "#0F312D", fontWeight: 500 }}>{rec.address}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.08em", marginBottom: 3 }}>GPS LATITUDE</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: "#D6452F", fontWeight: 600 }}>{rec.gpsLat.toFixed(4)}° N</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.08em", marginBottom: 3 }}>GPS LONGITUDE</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: "#D6452F", fontWeight: 600 }}>{Math.abs(rec.gpsLng).toFixed(4)}° W</div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.08em", marginBottom: 3 }}>CONTACT D'URGENCE</div>
                  <div style={{ fontSize: 13.5, color: "#0F312D" }}>{rec.emergencyContact} — <strong>{rec.emergencyPhone}</strong></div>
                </div>
                <div style={{ background: "#E3EEEC", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#16605A", letterSpacing: "0.08em", marginBottom: 3 }}>VITAUX CRITIQUES</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#0F312D" }}>
                    SpO₂ {dispatchPatient.spo2.toFixed(0)}% · FC {dispatchPatient.hr} bpm · TA {dispatchPatient.bpSys}/{dispatchPatient.bpDia}
                  </div>
                </div>
              </>
            ) : null; })()}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleDispatch(dispatchModal)} style={{ flex: 1, background: "#D6452F", color: "#fff", border: "none", borderRadius: 8, padding: "13px 0", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                🚨 Confirmer — Partager GPS & Dispatcher
              </button>
              <button onClick={() => setDispatchModal(null)} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 8, padding: "13px 18px", cursor: "pointer", color: "#5A756F" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function ActionBtn({ label, color, bg, onClick }: { label: string; color: string; bg: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: bg, color, border: `1px solid ${color}40`, borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

// ─── Patient Portal ───────────────────────────────────────────────────────────
function PatientPortal({ user, onLogout }: { user: LoggedUser; onLogout: () => void }) {
  const patientId = user.patientId!;
  const rec = MED_RECORDS[patientId];
  const patient = SEED.find(p => p.id === patientId);
  const risk = patient ? getRisk(patient.spo2, patient.hr) : "stable";
  const cfg = RISK_CFG[risk];
  const device = DEVICE_SEED.find(d => d.patientId === patientId);
  const myAppts = APPT_SEED.filter(a => a.patientId === patientId && a.status !== "cancelled");

  const [msgText, setMsgText] = useState("");
  const [chats, setChats] = useState<ChatMsg[]>(rec?.messages ?? []);
  const [tab, setTab] = useState<"vitals" | "meds" | "rdv" | "chat">("vitals");

  const sendMsg = () => {
    if (!msgText.trim() || !rec) return;
    setChats(prev => [...prev, { id: `m${Date.now()}`, from: user.name, role: "patient", text: msgText.trim(), time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), isStaff: false }]);
    setMsgText("");
  };

  if (!rec || !patient) return null;

  const portalTabs: { key: typeof tab; label: string }[] = [
    { key: "vitals", label: "Mes constantes" },
    { key: "meds",   label: `Mes médicaments (${rec.medications.length})` },
    { key: "rdv",    label: `Rendez-vous (${myAppts.length})` },
    { key: "chat",   label: "Chat médecin" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F4F7F6", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0F312D", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>RPM<span style={{ color: "#D6452F" }}>▮</span>MOROCCO</div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A9E96", letterSpacing: "0.10em" }}>PORTAIL PATIENT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#A0C4BE" }}>{user.name} · {user.id}</div>
          <button onClick={onLogout} style={{ background: "none", border: "1px solid #2A5A54", borderRadius: 6, padding: "6px 14px", cursor: "pointer", color: "#A0C4BE", fontSize: 12 }}>Déconnexion</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #D9E2DF", display: "flex", padding: "0 28px", gap: 0 }}>
        {portalTabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "12px 20px", background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #D6452F" : "2px solid transparent", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: tab === t.key ? 600 : 400, fontSize: 13.5, color: tab === t.key ? "#0F312D" : "#5A756F", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 32px" }}>
        {/* Risk banner (always visible) */}
        {risk !== "stable" && (
          <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.color}`, borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{cfg.icon}</span>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: "0.08em" }}>{cfg.label} — Alerte active</div>
              <div style={{ fontSize: 13, color: "#33534E", marginTop: 2 }}>{cfg.action}. Votre équipe médicale a été notifiée automatiquement.</div>
            </div>
          </div>
        )}

        {/* ── Vitals tab ── */}
        {tab === "vitals" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              {[
                { l: "SpO₂",               v: `${patient.spo2.toFixed(0)}%`,      c: patient.spo2 < 90 ? "#D6452F" : "#16605A", normal: "Normal: ≥ 95%" },
                { l: "Fréq. cardiaque",    v: `${patient.hr} bpm`,                c: patient.hr > 110 ? "#D6452F" : "#0F312D",  normal: "Normal: 60–100 bpm" },
                { l: "Tension artérielle", v: `${patient.bpSys}/${patient.bpDia}`, c: "#0F312D",                                  normal: "Normal: < 130/80" },
              ].map(({ l, v, c, normal }) => (
                <div key={l} style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.10em", marginBottom: 8, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 34, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", marginTop: 8 }}>{normal}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16605A" }} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#16605A", letterSpacing: "0.08em" }}>EN DIRECT · {device?.deviceId ?? "—"}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Device + contact info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#16605A", letterSpacing: "0.10em", marginBottom: 10, textTransform: "uppercase" }}>Mon dispositif RPM</div>
                {device && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: device.status === "online" ? "#E3EEEC" : device.status === "low-battery" ? "#FDF3E3" : "#FBEAE6" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: device.status === "online" ? "#16605A" : device.status === "low-battery" ? "#B9873F" : "#D6452F" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: device.status === "online" ? "#16605A" : device.status === "low-battery" ? "#B9873F" : "#D6452F" }}>
                      {device.status === "online" ? "Connecté" : device.status === "low-battery" ? "Batterie faible" : "Hors ligne"}
                    </span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", marginLeft: "auto" }}>🔋 {device.battery}%</span>
                  </div>
                )}
                {[
                  { l: "Appareil",      v: device?.model ?? "—" },
                  { l: "ID dispositif", v: device?.deviceId ?? rec.deviceId },
                  { l: "Firmware",      v: device?.firmware ?? "—" },
                  { l: "Plan abonné",   v: rec.subscriptionPlan },
                  { l: "Infirmier(e)",  v: device?.monitorName ?? "—" },
                  { l: "Activé le",     v: device?.activatedAt ?? "—" },
                ].map(({ l, v }) => (
                  <div key={l} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #F4F7F6" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", width: 95, flexShrink: 0, textTransform: "uppercase" }}>{l}</span>
                    <span style={{ fontSize: 13, color: "#0F312D", fontFamily: l === "ID dispositif" || l === "Firmware" ? "'IBM Plex Mono', monospace" : "inherit" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#D6452F", letterSpacing: "0.10em", marginBottom: 10, textTransform: "uppercase" }}>Contacts d'urgence</div>
                {[
                  { l: "Contact",   v: rec.emergencyContact },
                  { l: "Téléphone", v: rec.emergencyPhone },
                  { l: "Assurance", v: rec.insurance },
                  { l: "SAMU",      v: "15" },
                ].map(({ l, v }) => (
                  <div key={l} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #F4F7F6" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", width: 90, flexShrink: 0, textTransform: "uppercase" }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: l === "SAMU" ? 700 : 400, color: l === "SAMU" ? "#D6452F" : "#0F312D" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Medications tab ── */}
        {tab === "meds" && (
          <div>
            {rec.allergies.length > 0 && (
              <div style={{ background: "#FBEAE6", border: "1.5px solid #D6452F", borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>⚠</span>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#D6452F", letterSpacing: "0.08em", fontWeight: 700 }}>ALLERGIES DOCUMENTÉES — informez tout soignant</div>
                  <div style={{ fontSize: 14, color: "#D6452F", fontWeight: 700, marginTop: 2 }}>{rec.allergies.join(" · ")}</div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.medications.map((m, i) => (
                <div key={m.name} style={{ background: "#fff", border: "1px solid #D9E2DF", borderLeft: "3px solid #16605A", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 18 }}>
                  {/* Number badge */}
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E3EEEC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: "#16605A", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0F312D", marginBottom: 4 }}>{m.name}</div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#D6452F", fontWeight: 600, background: "#FBEAE6", padding: "2px 10px", borderRadius: 5 }}>{m.dose}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#B9873F", background: "#FDF3E3", padding: "2px 10px", borderRadius: 5 }}>{m.freq}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#5A756F", lineHeight: 1.5 }}>{m.indication}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", marginTop: 5 }}>Prescrit par {m.by} · depuis le {m.since}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, background: "#E3EEEC", border: "1px solid #16605A40", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#33534E", lineHeight: 1.6 }}>
              <strong>Important :</strong> Ne jamais arrêter un médicament sans avis médical. En cas de doute ou d'effet indésirable, contactez votre médecin via le chat ou appelez le <strong>15</strong>.
            </div>
          </div>
        )}

        {/* ── Rendez-vous tab ── */}
        {tab === "rdv" && (
          <div>
            {myAppts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#5A756F" }}>
                <Calendar size={36} color="#D9E2DF" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15 }}>Aucun rendez-vous planifié.</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Votre médecin traitant planifiera vos prochaines consultations.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myAppts.sort((a, b) => a.date.localeCompare(b.date)).map(appt => {
                  const tc = TYPE_CFG[appt.type];
                  const statusColors: Record<string, { c: string; bg: string }> = { scheduled: { c: "#B9873F", bg: "#FDF3E3" }, confirmed: { c: "#16605A", bg: "#E3EEEC" }, done: { c: "#5A756F", bg: "#F4F7F6" }, cancelled: { c: "#D6452F", bg: "#FBEAE6" } };
                  const sc = statusColors[appt.status] ?? statusColors.scheduled;
                  const isPast = appt.date < "2026-07-11";
                  return (
                    <div key={appt.id} style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 18, alignItems: "flex-start", opacity: isPast ? 0.65 : 1 }}>
                      {/* Date block */}
                      <div style={{ minWidth: 58, background: "#F4F7F6", borderRadius: 10, padding: "10px 0", textAlign: "center" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#5A756F" }}>{appt.date.slice(5, 7)}/{appt.date.slice(2, 4)}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 800, color: "#0F312D", lineHeight: 1 }}>{appt.date.slice(8)}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#B9873F", marginTop: 3, fontWeight: 600 }}>{appt.time}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#0F312D" }}>{appt.title}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, padding: "2px 8px", borderRadius: 4, background: tc.bg, color: tc.color }}>{tc.label}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, padding: "2px 8px", borderRadius: 4, background: sc.bg, color: sc.c }}>{appt.status === "confirmed" ? "✓ Confirmé" : appt.status === "scheduled" ? "Planifié" : appt.status}</span>
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 5 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#33534E" }}><Stethoscope size={12} color="#16605A" /> {appt.doctorName}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#5A756F" }}><MapPin size={12} /> {appt.location || "—"}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#5A756F" }}><Clock size={12} /> {appt.duration} min</span>
                        </div>
                        {appt.notes && (
                          <div style={{ fontSize: 12.5, color: "#5A756F", background: "#F4F7F6", borderRadius: 7, padding: "8px 12px", marginTop: 5, lineHeight: 1.5 }}>
                            📋 {appt.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Chat tab ── */}
        {tab === "chat" && (
          <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 12, display: "flex", flexDirection: "column", height: 500 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #D9E2DF", display: "flex", alignItems: "center", gap: 10 }}>
              <Stethoscope size={16} color="#16605A" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#0F312D" }}>Consultation en ligne avec votre équipe médicale</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F" }}>Réponse habituelle sous 2–4h — urgence: appelez le 15</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {chats.map(msg => (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.isStaff ? "flex-start" : "flex-end" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", marginBottom: 3 }}>{msg.from} · {msg.role} · {msg.time}</div>
                  <div style={{ maxWidth: "75%", background: msg.isStaff ? "#E3EEEC" : "#0F312D", color: msg.isStaff ? "#0F312D" : "#fff", borderRadius: msg.isStaff ? "4px 14px 14px 14px" : "14px 4px 14px 14px", padding: "10px 14px", fontSize: 14, lineHeight: 1.55 }}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, padding: "12px 18px", borderTop: "1px solid #D9E2DF" }}>
              <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Écrivez votre message..." style={{ flex: 1, border: "1.5px solid #D9E2DF", borderRadius: 8, padding: "11px 14px", fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }} />
              <button onClick={sendMsg} style={{ background: "#16605A", color: "#fff", border: "none", borderRadius: 8, padding: "11px 20px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>Envoyer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Device & Access mock data ────────────────────────────────────────────────
type DeviceStatus = "online" | "offline" | "low-battery" | "no-signal";
type DeviceType = "ecg" | "bp" | "spo2";
interface Device {
  deviceId: string; model: string; type: DeviceType;
  patientId: string; patientName: string; condition: string;
  monitorId: string; monitorName: string; monitorRole: string;
  clinic: string; status: DeviceStatus;
  battery: number; signal: number; firmware: string;
  simId: string; lastPing: string; activatedAt: string; sessionDays: number;
}
type AccessRole = "admin" | "nurse" | "cardiologist" | "physician" | "technician";
type AccessStatus = "active" | "suspended" | "pending";
interface AccessUser {
  userId: string; name: string; role: AccessRole; clinic: string;
  email: string; status: AccessStatus; lastLogin: string;
  devicesAssigned: number; mfaEnabled: boolean; createdAt: string;
}

const DEVICE_SEED: Device[] = [
  { deviceId: "ECG-MA-0042", model: "Viatom ER1", type: "ecg", patientId: "P-001", patientName: "Mohammed Al-Fassi", condition: "Post CABG", monitorId: "NRS-001", monitorName: "Aicha Bensouda", monitorRole: "nurse", clinic: "Clinique Al-Shifa · Casa", status: "online", battery: 78, signal: 4, firmware: "v2.3.1", simId: "4821", lastPing: "2s ago", activatedAt: "2026-07-08", sessionDays: 3 },
  { deviceId: "ECG-MA-0043", model: "Viatom ER1", type: "ecg", patientId: "P-002", patientName: "Fatima Benali", condition: "Post valve repair", monitorId: "NRS-001", monitorName: "Aicha Bensouda", monitorRole: "nurse", clinic: "Clinique Al-Shifa · Casa", status: "online", battery: 54, signal: 3, firmware: "v2.3.1", simId: "4822", lastPing: "2s ago", activatedAt: "2026-07-09", sessionDays: 2 },
  { deviceId: "BP-MA-0018", model: "Transtek TeleRPM", type: "bp", patientId: "P-003", patientName: "Youssef Chakir", condition: "Post hip replacement", monitorId: "NRS-002", monitorName: "Karim El-Ouali", monitorRole: "nurse", clinic: "Polyclinique Atlas · Rabat", status: "online", battery: 91, signal: 5, firmware: "v1.8.4", simId: "3301", lastPing: "8s ago", activatedAt: "2026-07-07", sessionDays: 4 },
  { deviceId: "ECG-MA-0051", model: "Wellue DuoEK", type: "ecg", patientId: "P-004", patientName: "Amina Tazi", condition: "Post coronary stent", monitorId: "DR-001", monitorName: "Dr. Nadia Mouffak", monitorRole: "cardiologist", clinic: "Clinique Al-Shifa · Casa", status: "online", battery: 62, signal: 4, firmware: "v3.0.0", simId: "4855", lastPing: "5s ago", activatedAt: "2026-07-10", sessionDays: 1 },
  { deviceId: "SPO-MA-0009", model: "Nonin 3231", type: "spo2", patientId: "P-005", patientName: "Omar Idrissi", condition: "Post lung resection", monitorId: "NRS-002", monitorName: "Karim El-Ouali", monitorRole: "nurse", clinic: "Polyclinique Atlas · Rabat", status: "low-battery", battery: 12, signal: 3, firmware: "v1.2.9", simId: "3318", lastPing: "14s ago", activatedAt: "2026-07-06", sessionDays: 5 },
  { deviceId: "ECG-MA-0044", model: "Viatom ER1", type: "ecg", patientId: "P-006", patientName: "Khadija Mansouri", condition: "Post CABG", monitorId: "NRS-001", monitorName: "Aicha Bensouda", monitorRole: "nurse", clinic: "Clinique Al-Shifa · Casa", status: "online", battery: 85, signal: 5, firmware: "v2.3.1", simId: "4823", lastPing: "3s ago", activatedAt: "2026-07-08", sessionDays: 3 },
  { deviceId: "BP-MA-0019", model: "Transtek TeleRPM", type: "bp", patientId: "P-007", patientName: "Hassan Berrada", condition: "Post bowel resection", monitorId: "DR-002", monitorName: "Dr. Hassan Qassem", monitorRole: "physician", clinic: "Clinique Ibn Rochd · Casa", status: "online", battery: 44, signal: 2, firmware: "v1.8.4", simId: "5501", lastPing: "31s ago", activatedAt: "2026-07-05", sessionDays: 6 },
  { deviceId: "SPO-MA-0010", model: "Nonin 3231", type: "spo2", patientId: "P-008", patientName: "Nadia El-Alaoui", condition: "Post appendectomy", monitorId: "NRS-002", monitorName: "Karim El-Ouali", monitorRole: "nurse", clinic: "Polyclinique Atlas · Rabat", status: "online", battery: 97, signal: 5, firmware: "v1.2.9", simId: "3319", lastPing: "1s ago", activatedAt: "2026-07-10", sessionDays: 1 },
  { deviceId: "ECG-MA-0038", model: "Wellue DuoEK", type: "ecg", patientId: "P-009", patientName: "Rachid Ouazzani", condition: "Post aortic stent", monitorId: "DR-001", monitorName: "Dr. Nadia Mouffak", monitorRole: "cardiologist", clinic: "Clinique Al-Shifa · Casa", status: "no-signal", battery: 70, signal: 0, firmware: "v3.0.0", simId: "4799", lastPing: "4m ago", activatedAt: "2026-07-04", sessionDays: 7 },
  { deviceId: "BP-MA-0020", model: "Transtek TeleRPM", type: "bp", patientId: "—", patientName: "Unassigned", condition: "—", monitorId: "ADM-001", monitorName: "Yassine Alaoui", monitorRole: "admin", clinic: "Warehouse · RPM HQ", status: "offline", battery: 100, signal: 0, firmware: "v1.9.0", simId: "6600", lastPing: "—", activatedAt: "—", sessionDays: 0 },
  { deviceId: "ECG-MA-0055", model: "Viatom ER1", type: "ecg", patientId: "—", patientName: "Unassigned", condition: "—", monitorId: "ADM-001", monitorName: "Yassine Alaoui", monitorRole: "admin", clinic: "Warehouse · RPM HQ", status: "offline", battery: 100, signal: 0, firmware: "v2.3.1", simId: "4900", lastPing: "—", activatedAt: "—", sessionDays: 0 },
];

const ACCESS_SEED: AccessUser[] = [
  { userId: "ADM-001", name: "Yassine Alaoui", role: "admin", clinic: "RPM Morocco HQ", email: "y.alaoui@rpm-morocco.ma", status: "active", lastLogin: "Today 09:14", devicesAssigned: 11, mfaEnabled: true, createdAt: "2026-01-12" },
  { userId: "NRS-001", name: "Aicha Bensouda", role: "nurse", clinic: "Clinique Al-Shifa · Casa", email: "a.bensouda@alshifa.ma", status: "active", lastLogin: "Today 07:52", devicesAssigned: 3, mfaEnabled: true, createdAt: "2026-03-05" },
  { userId: "NRS-002", name: "Karim El-Ouali", role: "nurse", clinic: "Polyclinique Atlas · Rabat", email: "k.elouali@atlas-poly.ma", status: "active", lastLogin: "Today 08:31", devicesAssigned: 3, mfaEnabled: false, createdAt: "2026-03-12" },
  { userId: "DR-001", name: "Dr. Nadia Mouffak", role: "cardiologist", clinic: "Clinique Al-Shifa · Casa", email: "n.mouffak@alshifa.ma", status: "active", lastLogin: "Yesterday 18:47", devicesAssigned: 2, mfaEnabled: true, createdAt: "2026-02-20" },
  { userId: "DR-002", name: "Dr. Hassan Qassem", role: "physician", clinic: "Clinique Ibn Rochd · Casa", email: "h.qassem@ibnrochd.ma", status: "active", lastLogin: "Today 06:10", devicesAssigned: 1, mfaEnabled: true, createdAt: "2026-04-01" },
  { userId: "TCH-001", name: "Salma Rifai", role: "technician", clinic: "RPM Morocco HQ", email: "s.rifai@rpm-morocco.ma", status: "active", lastLogin: "2026-07-09 14:22", devicesAssigned: 0, mfaEnabled: true, createdAt: "2026-05-15" },
  { userId: "NRS-003", name: "Mounia Sekkat", role: "nurse", clinic: "Clinique Ibn Rochd · Casa", email: "m.sekkat@ibnrochd.ma", status: "pending", lastLogin: "—", devicesAssigned: 0, mfaEnabled: false, createdAt: "2026-07-10" },
  { userId: "DR-003", name: "Dr. Amine Chaouki", role: "cardiologist", clinic: "Polyclinique Atlas · Rabat", email: "a.chaouki@atlas-poly.ma", status: "suspended", lastLogin: "2026-06-14 11:05", devicesAssigned: 0, mfaEnabled: false, createdAt: "2026-03-28" },
];

// ─── Device request workflow ──────────────────────────────────────────────────
type DeviceReqStatus = "pending" | "approved" | "denied";
interface DeviceRequest {
  id: string;
  deviceId: string;
  patientId: string;
  patientName: string;
  requestedById: string;
  requestedByName: string;
  requestedByRole: string;
  assignedDoctorId: string;
  reason: string;
  urgency: "routine" | "urgent" | "critical";
  requestedAt: string;
  status: DeviceReqStatus;
  reviewedBy?: string;
  reviewNote?: string;
}

// Doctors who have been granted device-approval authority by admin
const DEVICE_APPROVERS = new Set<string>(["DR-001", "DR-002", "DR-003"]);

const DEVICE_REQUESTS: DeviceRequest[] = [
  { id: "REQ-001", deviceId: "ECG-MA-0055", patientId: "P-004", patientName: "Amina Tazi", requestedById: "NRS-001", requestedByName: "Aicha Bensouda", requestedByRole: "nurse", assignedDoctorId: "DR-001", reason: "Contrôle ECG post-stent coronaire — surveillance continue requise.", urgency: "urgent", requestedAt: "2026-07-14 08:22", status: "pending" },
  { id: "REQ-002", deviceId: "BP-MA-0020", patientId: "P-006", patientName: "Khadija Mansouri", requestedById: "NRS-003", requestedByName: "Souad Rachidi", requestedByRole: "nurse", assignedDoctorId: "DR-001", reason: "Monitoring TA quotidien post-CABG à domicile.", urgency: "routine", requestedAt: "2026-07-13 15:40", status: "approved", reviewedBy: "Dr. Nadia Mouffak", reviewNote: "Approuvé — plan de sortie validé." },
  { id: "REQ-003", deviceId: "ECG-MA-0055", patientId: "P-008", patientName: "Nadia El-Alaoui", requestedById: "NRS-002", requestedByName: "Karim El-Ouali", requestedByRole: "nurse", assignedDoctorId: "DR-002", reason: "Suivi FC post-appendicectomie, arythmie suspectée.", urgency: "urgent", requestedAt: "2026-07-12 11:10", status: "denied", reviewedBy: "Dr. Hassan Qassem", reviewNote: "Non justifié — SpO₂ stable, pas d'indication ECG." },
];

// ─── Devices Screen ───────────────────────────────────────────────────────────
function DevicesScreen({ currentUser, onAddNotification }: {
  currentUser: LoggedUser;
  onAddNotification: (n: RPMNotification) => void;
}) {
  const [tab, setTab] = useState<"fleet" | "access" | "requests">("fleet");
  const [devices, setDevices] = useState<Device[]>(DEVICE_SEED);
  const [users, setUsers] = useState<AccessUser[]>(ACCESS_SEED);
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | "all">("all");
  const [filterType, setFilterType] = useState<DeviceType | "all">("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "nurse" as AccessRole, clinic: "" });
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [addDevFeedback, setAddDevFeedback] = useState("");
  const [newDev, setNewDev] = useState({
    deviceId: "", model: "", type: "ecg" as DeviceType,
    firmware: "", simId: "", clinic: currentUser.clinic,
  });
  const [filterRole, setFilterRole] = useState<AccessRole | "all">("all");
  const [filterAccessStatus, setFilterAccessStatus] = useState<AccessStatus | "all">("all");
  const [requests, setRequests] = useState<DeviceRequest[]>(DEVICE_REQUESTS);
  const [approvers, setApprovers] = useState<Set<string>>(new Set(DEVICE_APPROVERS));
  const [showReqForm, setShowReqForm] = useState(false);
  const [reqForm, setReqForm] = useState({ deviceId: "", patientId: "", assignedDoctorId: "", reason: "", urgency: "routine" as DeviceRequest["urgency"] });
  const [reviewingReq, setReviewingReq] = useState<DeviceRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reqFeedback, setReqFeedback] = useState("");

  const pendingRequests = requests.filter(r => r.status === "pending");
  const myPendingRequests = pendingRequests.filter(r => r.assignedDoctorId === currentUser.id);
  const canRequest = currentUser.role === "nurse" || currentUser.role === "admin";
  const canApprove = approvers.has(currentUser.id) || currentUser.role === "admin";

  const submitRequest = () => {
    if (!reqForm.deviceId || !reqForm.patientId || !reqForm.assignedDoctorId || !reqForm.reason) return;
    const pat = SEED.find(p => p.id === reqForm.patientId);
    const dev = devices.find(d => d.deviceId === reqForm.deviceId);
    const newReq: DeviceRequest = {
      id: `REQ-${String(requests.length + 100).padStart(3, "0")}`,
      deviceId: reqForm.deviceId,
      patientId: reqForm.patientId,
      patientName: pat?.name ?? reqForm.patientId,
      requestedById: currentUser.id,
      requestedByName: currentUser.name,
      requestedByRole: currentUser.role,
      assignedDoctorId: reqForm.assignedDoctorId,
      reason: reqForm.reason,
      urgency: reqForm.urgency,
      requestedAt: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "pending",
    };
    DEVICE_REQUESTS.push(newReq);
    setRequests([...DEVICE_REQUESTS]);
    // Inject notification for the assigned doctor
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const p = SEED.find(p => p.id === reqForm.patientId);
    onAddNotification({
      id: `NOTIF-DEV-${Date.now()}`,
      patientId: reqForm.patientId,
      patientName: pat?.name ?? reqForm.patientId,
      risk: reqForm.urgency === "critical" ? "high" : "nurse",
      message: `Demande dispositif ${reqForm.deviceId} — ${reqForm.urgency.toUpperCase()}`,
      detail: `${currentUser.name} demande l'autorisation d'assigner le device ${reqForm.deviceId} à ${pat?.name}. Raison: ${reqForm.reason}`,
      time: now, read: false,
      spo2: p?.spo2 ?? 96, hr: p?.hr ?? 80, bpSys: p?.bpSys ?? 120, bpDia: p?.bpDia ?? 78,
      assignedDoctorId: reqForm.assignedDoctorId, assignedNurseId: currentUser.id,
      gpsLat: 33.589, gpsLng: -7.625, address: "Demande via RPM Platform",
      visibleToRoles: ["cardiologist", "physician", "admin"],
    });
    setShowReqForm(false);
    setReqForm({ deviceId: "", patientId: "", assignedDoctorId: "", reason: "", urgency: "routine" });
    setReqFeedback(`✓ Demande envoyée au Dr. ${STAFF_SEED.find(s => s.id === reqForm.assignedDoctorId)?.name ?? reqForm.assignedDoctorId}`);
    setTimeout(() => setReqFeedback(""), 4000);
  };

  const handleReview = (req: DeviceRequest, decision: "approved" | "denied") => {
    const doc = STAFF_SEED.find(s => s.id === currentUser.id);
    const updated: DeviceRequest = { ...req, status: decision, reviewedBy: currentUser.name, reviewNote };
    const idx = DEVICE_REQUESTS.findIndex(r => r.id === req.id);
    if (idx >= 0) DEVICE_REQUESTS[idx] = updated;
    setRequests([...DEVICE_REQUESTS]);
    if (decision === "approved") {
      const pat = SEED.find(p => p.id === req.patientId);
      setDevices(prev => prev.map(d => d.deviceId === req.deviceId
        ? { ...d, patientId: req.patientId, patientName: req.patientName, condition: pat?.condition ?? "—", monitorId: req.requestedById, monitorName: req.requestedByName, monitorRole: req.requestedByRole, status: "online" as DeviceStatus, activatedAt: new Date().toISOString().slice(0, 10), sessionDays: 0 }
        : d
      ));
    }
    setReviewingReq(null);
    setReviewNote("");
  };

  const toggleApprover = (staffId: string) => {
    setApprovers(prev => {
      const next = new Set(prev);
      if (next.has(staffId)) next.delete(staffId); else next.add(staffId);
      DEVICE_APPROVERS.clear ? null : null; // mutable ref sync
      return next;
    });
  };

  const onlineCount = devices.filter(d => d.status === "online").length;
  const offlineCount = devices.filter(d => d.status === "offline" || d.status === "no-signal").length;
  const warnCount = devices.filter(d => d.status === "low-battery").length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const pendingUsers = users.filter(u => u.status === "pending").length;

  const filteredDevices = devices.filter(d =>
    (filterStatus === "all" || d.status === filterStatus) &&
    (filterType === "all" || d.type === filterType)
  );

  const filteredUsers = users.filter(u =>
    (filterRole === "all" || u.role === filterRole) &&
    (filterAccessStatus === "all" || u.status === filterAccessStatus)
  );

  const toggleUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.userId === userId
      ? { ...u, status: u.status === "active" ? "suspended" : "active" }
      : u
    ));
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.userId !== userId));
  };

  const submitNewDevice = () => {
    if (!newDev.deviceId || !newDev.model || !newDev.firmware || !newDev.simId) return;
    if (devices.some(d => d.deviceId === newDev.deviceId)) {
      setAddDevFeedback(`⚠ ID ${newDev.deviceId} déjà enregistré dans le système.`);
      setTimeout(() => setAddDevFeedback(""), 4000);
      return;
    }
    const provisioned: Device = {
      deviceId: newDev.deviceId, model: newDev.model, type: newDev.type,
      patientId: "—", patientName: "Non assigné", condition: "—",
      monitorId: currentUser.id, monitorName: currentUser.name, monitorRole: currentUser.role,
      clinic: newDev.clinic || currentUser.clinic,
      status: "offline", battery: 100, signal: 0,
      firmware: newDev.firmware, simId: newDev.simId,
      lastPing: "—", activatedAt: "—", sessionDays: 0,
    };
    DEVICE_SEED.push(provisioned);
    setDevices([...DEVICE_SEED]);
    setShowAddDevice(false);
    setNewDev({ deviceId: "", model: "", type: "ecg", firmware: "", simId: "", clinic: currentUser.clinic });
    setAddDevFeedback(`✓ Dispositif ${provisioned.deviceId} enregistré — en attente d'activation.`);
    setTimeout(() => setAddDevFeedback(""), 5000);
  };

  const revokeDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d => d.deviceId === deviceId
      ? { ...d, status: "offline", patientId: "—", patientName: "Unassigned", condition: "—", lastPing: "—" }
      : d
    ));
    if (selectedDevice?.deviceId === deviceId) setSelectedDevice(null);
  };

  const submitInvite = () => {
    if (!invite.name || !invite.email) return;
    const newUser: AccessUser = {
      userId: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: invite.name,
      role: invite.role,
      clinic: invite.clinic || "—",
      email: invite.email,
      status: "pending",
      lastLogin: "—",
      devicesAssigned: 0,
      mfaEnabled: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers(prev => [...prev, newUser]);
    setInvite({ name: "", email: "", role: "nurse", clinic: "" });
    setShowInvite(false);
  };

  const deviceStatusColor: Record<DeviceStatus, string> = {
    "online": "#16605A",
    "offline": "#5A756F",
    "low-battery": "#B9873F",
    "no-signal": "#D6452F",
  };
  const deviceStatusBg: Record<DeviceStatus, string> = {
    "online": "#E3EEEC",
    "offline": "#F0F0F0",
    "low-battery": "#FDF3E3",
    "no-signal": "#FBEAE6",
  };
  const deviceTypeIcon: Record<DeviceType, React.ReactNode> = {
    ecg: <Activity size={13} />,
    bp: <TrendingUp size={13} />,
    spo2: <Zap size={13} />,
  };
  const roleColor: Record<AccessRole, string> = {
    admin: "#0F312D", nurse: "#16605A", cardiologist: "#D6452F", physician: "#B9873F", technician: "#5A756F",
  };
  const roleBg: Record<AccessRole, string> = {
    admin: "#E3EEEC", nurse: "#E3EEEC", cardiologist: "#FBEAE6", physician: "#FDF3E3", technician: "#F0F0F0",
  };
  const accessStatusColor: Record<AccessStatus, string> = {
    active: "#16605A", suspended: "#D6452F", pending: "#B9873F",
  };

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "#F4F7F6" }}>
      {/* ── Page header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #D9E2DF", padding: "20px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 0 }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#B9873F", textTransform: "uppercase", marginBottom: 6 }}>
              DEVICE OPERATIONS & ACCESS CONTROL
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: "#0F312D", marginBottom: 16 }}>
              Connected Device Fleet & Admin Panel
            </h1>
          </div>
          {/* Fleet summary pills */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Online", val: onlineCount, c: "#16605A", bg: "#E3EEEC" },
              { label: "Warning", val: warnCount, c: "#B9873F", bg: "#FDF3E3" },
              { label: "Offline/No Signal", val: offlineCount, c: "#D6452F", bg: "#FBEAE6" },
              { label: "Active Users", val: activeUsers, c: "#0F312D", bg: "#F4F7F6" },
              { label: "Pending Invite", val: pendingUsers, c: "#B9873F", bg: "#FDF3E3" },
            ].map(({ label, val, c, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 6, padding: "6px 14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600, color: c, lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", letterSpacing: "0.08em", marginTop: 3, whiteSpace: "nowrap" }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Sub-tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {([
            { k: "fleet",    icon: <Radio size={14} />,        label: "Appareils connectés" },
            { k: "requests", icon: <ClipboardList size={14} />, label: "Demandes", badge: pendingRequests.length },
            { k: "access",   icon: <Key size={14} />,           label: "Accès & Admin" },
          ] as const).map(({ k, icon, label, badge }) => (
            <button key={k} onClick={() => setTab(k as "fleet" | "access" | "requests")} style={{
              padding: "10px 20px", background: "none", border: "none",
              borderBottom: tab === k ? "2px solid #D6452F" : "2px solid transparent",
              cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: tab === k ? 600 : 400, fontSize: 13.5,
              color: tab === k ? "#0F312D" : "#5A756F",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              {icon} {label}
              {"badge" in { badge } && badge !== undefined && badge > 0 && (
                <span style={{ background: "#D6452F", color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px", fontFamily: "'IBM Plex Mono', monospace" }}>{badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>

        {/* ══════ FLEET TAB ══════ */}
        {tab === "fleet" && (
          <div style={{ display: "flex", gap: 20 }}>
            {/* Device table */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Admin: register new device */}
              {currentUser.role === "admin" && (
                <div style={{ marginBottom: 18 }}>
                  {addDevFeedback && (
                    <div style={{ background: addDevFeedback.startsWith("⚠") ? "#FDF3E3" : "#E3EEEC", border: `1px solid ${addDevFeedback.startsWith("⚠") ? "#B9873F40" : "#16605A40"}`, borderRadius: 8, padding: "10px 16px", marginBottom: 12, fontSize: 13, color: addDevFeedback.startsWith("⚠") ? "#B9873F" : "#16605A", fontWeight: 600 }}>
                      {addDevFeedback}
                    </div>
                  )}
                  {!showAddDevice ? (
                    <button onClick={() => setShowAddDevice(true)}
                      style={{ display: "flex", alignItems: "center", gap: 7, background: "#0F312D", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13 }}>
                      <UserPlus size={14} /> Enregistrer un nouveau dispositif
                    </button>
                  ) : (
                    <div style={{ background: "#fff", border: "1.5px solid #0F312D30", borderRadius: 12, padding: "20px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div>
                          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F312D" }}>Provisionner un nouveau dispositif</div>
                          <div style={{ fontSize: 12, color: "#5A756F", marginTop: 2 }}>Enregistrez l'appareil reçu dans le système RPM avant de l'affecter à un patient.</div>
                        </div>
                        <button onClick={() => setShowAddDevice(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9AADA8" }}><X size={16} /></button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                        <div style={{ gridColumn: "1/-1" }}>
                          <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>ID dispositif <span style={{ color: "#D6452F" }}>*</span></label>
                          <input value={newDev.deviceId} onChange={e => setNewDev(f => ({ ...f, deviceId: e.target.value.toUpperCase() }))}
                            placeholder="Ex: ECG-MA-0060"
                            style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box", letterSpacing: "0.05em" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Modèle <span style={{ color: "#D6452F" }}>*</span></label>
                          <input value={newDev.model} onChange={e => setNewDev(f => ({ ...f, model: e.target.value }))}
                            placeholder="Ex: Viatom ER1"
                            style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Type</label>
                          <select value={newDev.type} onChange={e => setNewDev(f => ({ ...f, type: e.target.value as DeviceType }))}
                            style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }}>
                            <option value="ecg">ECG</option>
                            <option value="bp">Tension (BP)</option>
                            <option value="spo2">SpO₂</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Firmware <span style={{ color: "#D6452F" }}>*</span></label>
                          <input value={newDev.firmware} onChange={e => setNewDev(f => ({ ...f, firmware: e.target.value }))}
                            placeholder="Ex: v2.3.1"
                            style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>SIM ID (4 derniers chiffres) <span style={{ color: "#D6452F" }}>*</span></label>
                          <input value={newDev.simId} onChange={e => setNewDev(f => ({ ...f, simId: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                            placeholder="Ex: 4901"
                            style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Clinique / Entrepôt</label>
                          <input value={newDev.clinic} onChange={e => setNewDev(f => ({ ...f, clinic: e.target.value }))}
                            placeholder="Ex: Warehouse · RPM HQ"
                            style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                        </div>
                      </div>
                      {/* Preview badge */}
                      {newDev.deviceId && newDev.model && (
                        <div style={{ background: "#F4F7F6", borderRadius: 8, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: "#0F312D" }}>{newDev.deviceId}</div>
                          <div style={{ width: 1, height: 20, background: "#D9E2DF" }} />
                          <div style={{ fontSize: 12.5, color: "#5A756F" }}>{newDev.model} · {newDev.type.toUpperCase()}</div>
                          {newDev.firmware && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#9AADA8" }}>{newDev.firmware}</div>}
                          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#9AADA8" }} />
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#9AADA8" }}>NON ASSIGNÉ · HORS LIGNE</span>
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={submitNewDevice}
                          disabled={!newDev.deviceId || !newDev.model || !newDev.firmware || !newDev.simId}
                          style={{ background: newDev.deviceId && newDev.model && newDev.firmware && newDev.simId ? "#16605A" : "#D9E2DF", color: newDev.deviceId && newDev.model && newDev.firmware && newDev.simId ? "#fff" : "#9AADA8", border: "none", borderRadius: 8, padding: "10px 22px", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                          <Check size={14} /> Confirmer et enregistrer
                        </button>
                        <button onClick={() => { setShowAddDevice(false); setNewDev({ deviceId: "", model: "", type: "ecg", firmware: "", simId: "", clinic: currentUser.clinic }); }}
                          style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 8, padding: "10px 16px", cursor: "pointer", color: "#5A756F", fontSize: 13 }}>Annuler</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Filters */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
                <Filter size={13} color="#5A756F" />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.08em" }}>FILTER</span>
                {(["all", "online", "offline", "low-battery", "no-signal"] as const).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: "4px 10px", borderRadius: 4, border: `1px solid ${filterStatus === s ? "#16605A" : "#D9E2DF"}`,
                    background: filterStatus === s ? "#E3EEEC" : "#fff",
                    color: filterStatus === s ? "#16605A" : "#5A756F",
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.06em",
                    cursor: "pointer",
                  }}>{s === "all" ? "ALL STATUS" : s.toUpperCase().replace("-", " ")}</button>
                ))}
                <div style={{ width: 1, height: 16, background: "#D9E2DF", margin: "0 4px" }} />
                {(["all", "ecg", "bp", "spo2"] as const).map(t => (
                  <button key={t} onClick={() => setFilterType(t)} style={{
                    padding: "4px 10px", borderRadius: 4, border: `1px solid ${filterType === t ? "#B9873F" : "#D9E2DF"}`,
                    background: filterType === t ? "#FDF3E3" : "#fff",
                    color: filterType === t ? "#B9873F" : "#5A756F",
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.06em",
                    cursor: "pointer",
                  }}>{t === "all" ? "ALL TYPES" : t.toUpperCase()}</button>
                ))}
                <span style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F" }}>
                  {filteredDevices.length} DEVICE{filteredDevices.length !== 1 ? "S" : ""}
                </span>
              </div>

              <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#E3EEEC" }}>
                      {["Device ID", "Model / Type", "Patient Case", "Session Monitor", "Clinic", "Status", "Batt.", "Signal", "Last Ping", ""].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#16605A", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map(d => (
                      <tr
                        key={d.deviceId}
                        onClick={() => setSelectedDevice(selectedDevice?.deviceId === d.deviceId ? null : d)}
                        style={{
                          borderTop: "1px solid #D9E2DF",
                          cursor: "pointer",
                          background: selectedDevice?.deviceId === d.deviceId ? "#F4F7F6" : "#fff",
                          transition: "background 0.12s",
                        }}
                      >
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: "#0F312D" }}>{d.deviceId}</div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", marginTop: 1 }}>SIM ···{d.simId}</div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "#16605A" }}>{deviceTypeIcon[d.type]}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: "#0F312D" }}>{d.model}</div>
                              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#B9873F", letterSpacing: "0.06em" }}>{d.type.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {d.patientId !== "—" ? (
                            <>
                              <div style={{ fontSize: 13, fontWeight: 500, color: "#0F312D" }}>{d.patientName}</div>
                              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F" }}>{d.patientId} · {d.condition}</div>
                            </>
                          ) : (
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5A756F" }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontSize: 13, color: "#0F312D" }}>{d.monitorName}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, padding: "2px 6px", borderRadius: 3, background: roleBg[d.monitorRole as AccessRole] ?? "#E3EEEC", color: roleColor[d.monitorRole as AccessRole] ?? "#16605A", letterSpacing: "0.06em" }}>
                              {d.monitorId}
                            </span>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F" }}>{d.monitorRole}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12.5, color: "#5A756F", whiteSpace: "nowrap" }}>{d.clinic}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "3px 8px", borderRadius: 4, background: deviceStatusBg[d.status], color: deviceStatusColor[d.status], letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                            {d.status === "online" ? "● " : d.status === "no-signal" ? "✕ " : d.status === "low-battery" ? "⚠ " : "○ "}
                            {d.status.replace("-", " ").toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 28, height: 6, background: "#D9E2DF", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${d.battery}%`, background: d.battery < 20 ? "#D6452F" : d.battery < 40 ? "#B9873F" : "#16605A", borderRadius: 3 }} />
                            </div>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: d.battery < 20 ? "#D6452F" : "#5A756F" }}>{d.battery}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: 2 }}>
                            {[1, 2, 3, 4, 5].map(bar => (
                              <div key={bar} style={{ width: 4, height: bar * 3 + 4, borderRadius: 1, background: d.signal >= bar ? (d.signal >= 4 ? "#16605A" : d.signal >= 2 ? "#B9873F" : "#D6452F") : "#D9E2DF" }} />
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5A756F", whiteSpace: "nowrap" }}>{d.lastPing}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <button
                            onClick={e => { e.stopPropagation(); revokeDevice(d.deviceId); }}
                            disabled={d.status === "offline"}
                            style={{ border: "1px solid #D9E2DF", background: "none", borderRadius: 5, padding: "4px 8px", cursor: d.status === "offline" ? "default" : "pointer", opacity: d.status === "offline" ? 0.4 : 1, display: "flex", alignItems: "center", gap: 4 }}
                            title="Revoke device session"
                          >
                            <Trash2 size={11} color="#D6452F" />
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#D6452F" }}>Revoke</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Firmware summary */}
              <div style={{ marginTop: 16, background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 28, alignItems: "center" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#16605A", letterSpacing: "0.10em", textTransform: "uppercase" }}>FIRMWARE VERSIONS</div>
                {[
                  { model: "Viatom ER1", ver: "v2.3.1", count: devices.filter(d => d.model === "Viatom ER1").length },
                  { model: "Wellue DuoEK", ver: "v3.0.0", count: devices.filter(d => d.model === "Wellue DuoEK").length },
                  { model: "Transtek TeleRPM", ver: "v1.9.0", count: devices.filter(d => d.model === "Transtek TeleRPM").length },
                  { model: "Nonin 3231", ver: "v1.2.9", count: devices.filter(d => d.model === "Nonin 3231").length },
                ].map(({ model, ver, count }) => (
                  <div key={model} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: "#0F312D" }}>{model}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, background: "#E3EEEC", color: "#16605A", padding: "2px 7px", borderRadius: 3 }}>{ver}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F" }}>×{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device detail panel */}
            {selectedDevice && (
              <div style={{ width: 280, flexShrink: 0 }}>
                <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, overflow: "hidden", position: "sticky", top: 24 }}>
                  <div style={{ background: deviceStatusBg[selectedDevice.status], borderBottom: "1px solid #D9E2DF", padding: "14px 16px" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: deviceStatusColor[selectedDevice.status], textTransform: "uppercase", marginBottom: 4 }}>
                      {selectedDevice.status.replace("-", " ")} · {selectedDevice.type.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: "#0F312D" }}>{selectedDevice.deviceId}</div>
                    <div style={{ fontSize: 12.5, color: "#5A756F", marginTop: 2 }}>{selectedDevice.model}</div>
                  </div>
                  <div style={{ padding: "16px" }}>
                    {[
                      { label: "Firmware", val: selectedDevice.firmware },
                      { label: "SIM ID", val: `···${selectedDevice.simId}` },
                      { label: "Activated", val: selectedDevice.activatedAt || "—" },
                      { label: "Session", val: selectedDevice.sessionDays ? `${selectedDevice.sessionDays} day${selectedDevice.sessionDays !== 1 ? "s" : ""}` : "—" },
                      { label: "Last Ping", val: selectedDevice.lastPing },
                      { label: "Battery", val: `${selectedDevice.battery}%` },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F4F7F6" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#0F312D" }}>{val}</span>
                      </div>
                    ))}

                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #D9E2DF" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.08em", marginBottom: 8 }}>PATIENT CASE</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F312D" }}>{selectedDevice.patientName}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", marginTop: 2 }}>{selectedDevice.patientId}</div>
                      <div style={{ fontSize: 12, color: "#33534E", marginTop: 4 }}>{selectedDevice.condition}</div>
                    </div>

                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #D9E2DF" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.08em", marginBottom: 8 }}>LOGGED MONITOR</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F312D" }}>{selectedDevice.monitorName}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "2px 7px", borderRadius: 3, background: roleBg[selectedDevice.monitorRole as AccessRole] ?? "#E3EEEC", color: roleColor[selectedDevice.monitorRole as AccessRole] ?? "#16605A" }}>
                          {selectedDevice.monitorId}
                        </span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F" }}>{selectedDevice.monitorRole}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#5A756F", marginTop: 4 }}>{selectedDevice.clinic}</div>
                    </div>

                    <button
                      onClick={() => revokeDevice(selectedDevice.deviceId)}
                      disabled={selectedDevice.status === "offline"}
                      style={{ marginTop: 16, width: "100%", background: selectedDevice.status === "offline" ? "#F0F0F0" : "#FBEAE6", color: selectedDevice.status === "offline" ? "#5A756F" : "#D6452F", border: `1px solid ${selectedDevice.status === "offline" ? "#D9E2DF" : "rgba(214,69,47,0.3)"}`, borderRadius: 7, padding: "9px 0", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: selectedDevice.status === "offline" ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <Trash2 size={13} /> Revoke Device Session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ ACCESS MANAGEMENT TAB ══════ */}
        {/* ══════ REQUESTS TAB ══════ */}
        {tab === "requests" && (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {/* Review modal */}
            {reviewingReq && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.55)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#fff", borderRadius: 14, width: 460, overflow: "hidden", boxShadow: "0 24px 64px rgba(15,49,45,0.28)" }}>
                  <div style={{ background: "#0F312D", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Réviser la demande</span>
                    <button onClick={() => { setReviewingReq(null); setReviewNote(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={15} /></button>
                  </div>
                  <div style={{ padding: 22 }}>
                    <div style={{ background: "#F4F7F6", borderRadius: 9, padding: "12px 16px", marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0F312D", marginBottom: 2 }}>{reviewingReq.patientName} — {reviewingReq.deviceId}</div>
                      <div style={{ fontSize: 12, color: "#5A756F", marginBottom: 6 }}>Demandé par {reviewingReq.requestedByName} · {reviewingReq.requestedAt}</div>
                      <div style={{ fontSize: 13, color: "#0F312D", lineHeight: 1.5 }}>{reviewingReq.reason}</div>
                      <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 4, background: reviewingReq.urgency === "critical" ? "#FBEAE6" : reviewingReq.urgency === "urgent" ? "#FDF3E3" : "#E3EEEC" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: reviewingReq.urgency === "critical" ? "#D6452F" : reviewingReq.urgency === "urgent" ? "#B9873F" : "#16605A" }}>{reviewingReq.urgency.toUpperCase()}</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Note de décision (optionnel)</label>
                      <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={2} placeholder="Justification de l'approbation ou du refus..."
                        style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", color: "#0F312D", background: "#F4F7F6", resize: "none", boxSizing: "border-box", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => handleReview(reviewingReq, "approved")}
                        style={{ flex: 1, background: "#16605A", color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <Check size={14} /> Approuver & Assigner
                      </button>
                      <button onClick={() => handleReview(reviewingReq, "denied")}
                        style={{ flex: 1, background: "#D6452F", color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <X size={14} /> Refuser
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback banner */}
            {reqFeedback && (
              <div style={{ background: "#E3EEEC", border: "1px solid #16605A40", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#16605A", fontWeight: 600 }}>{reqFeedback}</div>
            )}

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: "#0F312D" }}>Demandes d'attribution de dispositifs</div>
                <div style={{ fontSize: 12, color: "#5A756F", marginTop: 2 }}>{pendingRequests.length} en attente · {requests.filter(r => r.status === "approved").length} approuvées · {requests.filter(r => r.status === "denied").length} refusées</div>
              </div>
              {canRequest && (
                <button onClick={() => setShowReqForm(!showReqForm)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#16605A", color: "#fff", border: "none", borderRadius: 7, padding: "9px 16px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13 }}>
                  <UserPlus size={14} /> Nouvelle demande
                </button>
              )}
            </div>

            {/* Request form */}
            {showReqForm && (
              <div style={{ background: "#fff", border: "1.5px solid #16605A40", borderRadius: 12, padding: 22, marginBottom: 24 }}>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F312D", marginBottom: 16 }}>Nouvelle demande d'attribution</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Dispositif (non assigné)</label>
                    <select value={reqForm.deviceId} onChange={e => setReqForm(f => ({ ...f, deviceId: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }}>
                      <option value="">— Choisir un dispositif —</option>
                      {devices.filter(d => d.patientId === "—" || d.status === "offline").map(d => <option key={d.deviceId} value={d.deviceId}>{d.deviceId} · {d.model}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Patient</label>
                    <select value={reqForm.patientId} onChange={e => setReqForm(f => ({ ...f, patientId: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }}>
                      <option value="">— Choisir un patient —</option>
                      {SEED.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Médecin approbateur</label>
                    <select value={reqForm.assignedDoctorId} onChange={e => setReqForm(f => ({ ...f, assignedDoctorId: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }}>
                      <option value="">— Choisir un médecin —</option>
                      {STAFF_SEED.filter(s => approvers.has(s.id)).map(s => <option key={s.id} value={s.id}>{s.name} · {SPECIALTY_LABELS[s.specialty] ?? s.specialty}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Urgence</label>
                    <select value={reqForm.urgency} onChange={e => setReqForm(f => ({ ...f, urgency: e.target.value as DeviceRequest["urgency"] }))}
                      style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }}>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critique</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Justification clinique</label>
                    <textarea value={reqForm.reason} onChange={e => setReqForm(f => ({ ...f, reason: e.target.value }))} rows={2} placeholder="Pourquoi ce patient a-t-il besoin de ce dispositif?"
                      style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", color: "#0F312D", background: "#F4F7F6", resize: "none", boxSizing: "border-box", outline: "none" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button onClick={submitRequest} disabled={!reqForm.deviceId || !reqForm.patientId || !reqForm.assignedDoctorId || !reqForm.reason}
                    style={{ background: reqForm.deviceId && reqForm.patientId && reqForm.assignedDoctorId && reqForm.reason ? "#16605A" : "#D9E2DF", color: reqForm.deviceId && reqForm.patientId && reqForm.assignedDoctorId && reqForm.reason ? "#fff" : "#9AADA8", border: "none", borderRadius: 7, padding: "10px 20px", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13 }}>
                    Envoyer la demande
                  </button>
                  <button onClick={() => setShowReqForm(false)} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 7, padding: "10px 16px", cursor: "pointer", color: "#5A756F", fontSize: 13 }}>Annuler</button>
                </div>
              </div>
            )}

            {/* Request list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {requests.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#9AADA8", fontSize: 14 }}>Aucune demande enregistrée.</div>}
              {requests.map(req => {
                const urgClr = req.urgency === "critical" ? { bg: "#FBEAE6", txt: "#D6452F" } : req.urgency === "urgent" ? { bg: "#FDF3E3", txt: "#B9873F" } : { bg: "#E3EEEC", txt: "#16605A" };
                const stClr = req.status === "approved" ? { bg: "#E3EEEC", txt: "#16605A", icon: "✓" } : req.status === "denied" ? { bg: "#FBEAE6", txt: "#D6452F", icon: "✗" } : { bg: "#FDF3E3", txt: "#B9873F", icon: "⏳" };
                const doc = STAFF_SEED.find(s => s.id === req.assignedDoctorId);
                const dev = devices.find(d => d.deviceId === req.deviceId);
                const isMine = req.assignedDoctorId === currentUser.id;
                return (
                  <div key={req.id} style={{ background: "#fff", border: `1px solid ${req.status === "pending" && isMine ? "#B9873F" : "#D9E2DF"}`, borderRadius: 11, padding: "16px 20px", boxShadow: req.status === "pending" && isMine ? "0 2px 12px rgba(185,135,63,0.12)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, color: "#0F312D" }}>{req.deviceId}</span>
                          <span style={{ fontSize: 11, color: "#5A756F" }}>→</span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#0F312D" }}>{req.patientName}</span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: urgClr.bg, color: urgClr.txt, fontWeight: 700, letterSpacing: "0.06em" }}>{req.urgency.toUpperCase()}</span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: stClr.bg, color: stClr.txt, fontWeight: 700 }}>{stClr.icon} {req.status.toUpperCase()}</span>
                          {dev && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#9AADA8" }}>{dev.model}</span>}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#33534E", marginBottom: 4, lineHeight: 1.45 }}>{req.reason}</div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, color: "#5A756F" }}>Par: <strong>{req.requestedByName}</strong> ({req.requestedByRole})</span>
                          <span style={{ fontSize: 11, color: "#5A756F" }}>Médecin: <strong>{doc?.name ?? req.assignedDoctorId}</strong></span>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#9AADA8" }}>{req.requestedAt}</span>
                        </div>
                        {req.reviewNote && (
                          <div style={{ marginTop: 8, background: stClr.bg, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: stClr.txt }}>
                            <strong>{req.reviewedBy}:</strong> {req.reviewNote}
                          </div>
                        )}
                      </div>
                      {req.status === "pending" && canApprove && (
                        <button onClick={() => { setReviewingReq(req); setReviewNote(""); }}
                          style={{ background: "#0F312D", color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                          Réviser
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "access" && (
          <div>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { k: "TOTAL USERS", v: users.length, c: "#0F312D", bg: "#fff" },
                { k: "ACTIVE", v: users.filter(u => u.status === "active").length, c: "#16605A", bg: "#E3EEEC" },
                { k: "SUSPENDED", v: users.filter(u => u.status === "suspended").length, c: "#D6452F", bg: "#FBEAE6" },
                { k: "PENDING INVITE", v: users.filter(u => u.status === "pending").length, c: "#B9873F", bg: "#FDF3E3" },
              ].map(({ k, v, c, bg }) => (
                <div key={k} style={{ background: bg, border: "1px solid #D9E2DF", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.12em", color: "#5A756F", marginBottom: 6, textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 30, fontWeight: 600, color: c, lineHeight: 1 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
              <Filter size={13} color="#5A756F" />
              {(["all", "admin", "nurse", "cardiologist", "physician", "technician"] as const).map(r => (
                <button key={r} onClick={() => setFilterRole(r)} style={{
                  padding: "4px 10px", borderRadius: 4,
                  border: `1px solid ${filterRole === r ? "#16605A" : "#D9E2DF"}`,
                  background: filterRole === r ? "#E3EEEC" : "#fff",
                  color: filterRole === r ? "#16605A" : "#5A756F",
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.06em",
                  cursor: "pointer",
                }}>{r === "all" ? "ALL ROLES" : r.toUpperCase()}</button>
              ))}
              <div style={{ width: 1, height: 16, background: "#D9E2DF" }} />
              {(["all", "active", "suspended", "pending"] as const).map(s => (
                <button key={s} onClick={() => setFilterAccessStatus(s)} style={{
                  padding: "4px 10px", borderRadius: 4,
                  border: `1px solid ${filterAccessStatus === s ? "#B9873F" : "#D9E2DF"}`,
                  background: filterAccessStatus === s ? "#FDF3E3" : "#fff",
                  color: filterAccessStatus === s ? "#B9873F" : "#5A756F",
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.06em",
                  cursor: "pointer",
                }}>{s === "all" ? "ALL STATUS" : s.toUpperCase()}</button>
              ))}
              <button
                onClick={() => setShowInvite(v => !v)}
                style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, background: "#0F312D", color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13 }}
              >
                <UserPlus size={14} /> Invite User
              </button>
            </div>

            {/* Invite form */}
            {showInvite && (
              <div style={{ background: "#fff", border: "1.5px solid #0F312D", borderRadius: 10, padding: "20px 24px", marginBottom: 18 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#B9873F", marginBottom: 14, textTransform: "uppercase" }}>NEW USER INVITATION</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
                  {[
                    { label: "Full Name", key: "name" as const, placeholder: "Prénom Nom" },
                    { label: "Email", key: "email" as const, placeholder: "user@clinic.ma" },
                    { label: "Clinic", key: "clinic" as const, placeholder: "Clinique / Hospital" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#0F312D", marginBottom: 5 }}>{label}</label>
                      <input
                        value={invite[key]}
                        onChange={e => setInvite(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", outline: "none", background: "#F4F7F6", color: "#0F312D" }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#0F312D", marginBottom: 5 }}>Role</label>
                    <select
                      value={invite.role}
                      onChange={e => setInvite(prev => ({ ...prev, role: e.target.value as AccessRole }))}
                      style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", cursor: "pointer" }}
                    >
                      <option value="nurse">Nurse</option>
                      <option value="cardiologist">Cardiologist</option>
                      <option value="physician">Physician</option>
                      <option value="technician">Technician</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={submitInvite} style={{ background: "#16605A", color: "#fff", border: "none", borderRadius: 7, padding: "9px 16px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                      <Check size={13} /> Send Invite
                    </button>
                    <button onClick={() => setShowInvite(false)} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", cursor: "pointer", color: "#5A756F" }}>
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Device Approvers Panel (admin only) ── */}
            {currentUser.role === "admin" && (
              <div style={{ background: "#fff", border: "1.5px solid #B9873F40", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                  <Shield size={15} color="#B9873F" />
                  <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F312D" }}>Médecins habilités à approuver les dispositifs</span>
                </div>
                <div style={{ fontSize: 12, color: "#5A756F", marginBottom: 14 }}>Seuls ces médecins peuvent valider les demandes d'attribution soumises par les infirmiers. Les internes et autres médecins non listés ne peuvent pas approuver.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {STAFF_SEED.filter(s => ["cardiologist","physician"].includes(s.role)).map(s => {
                    const isApprover = approvers.has(s.id);
                    const sCfg = STAFF_STATUS_CFG[s.status];
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 9, background: isApprover ? "#E3EEEC" : "#F4F7F6", border: `1px solid ${isApprover ? "#16605A30" : "#D9E2DF"}` }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: sCfg.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0F312D" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "#5A756F" }}>{SPECIALTY_LABELS[s.specialty] ?? s.specialty} · {s.clinic}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isApprover ? "#16605A" : "#9AADA8" }}>{isApprover ? "✓ Habilité" : "— Non habilité"}</span>
                        <button onClick={() => toggleApprover(s.id)}
                          style={{ background: isApprover ? "#16605A" : "#D9E2DF", border: "none", borderRadius: 12, width: 40, height: 22, cursor: "pointer", position: "relative", flexShrink: 0 }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: isApprover ? 21 : 3, transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Users table */}
            <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#E3EEEC" }}>
                    {["User ID", "Name & Clinic", "Role", "Email", "Status", "Last Login", "Devices", "MFA", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.10em", color: "#16605A", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.userId} style={{ borderTop: "1px solid #D9E2DF", opacity: u.status === "suspended" ? 0.7 : 1 }}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: "#0F312D" }}>{u.userId}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", marginTop: 1 }}>Since {u.createdAt}</div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0F312D" }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: "#5A756F", marginTop: 1 }}>{u.clinic}</div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "3px 8px", borderRadius: 4, background: roleBg[u.role], color: roleColor[u.role], letterSpacing: "0.06em" }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 12.5, color: "#5A756F" }}>{u.email}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "3px 8px", borderRadius: 4, background: u.status === "active" ? "#E3EEEC" : u.status === "suspended" ? "#FBEAE6" : "#FDF3E3", color: accessStatusColor[u.status], letterSpacing: "0.06em" }}>
                          {u.status === "active" ? "● " : u.status === "suspended" ? "⊘ " : "◌ "}{u.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5A756F", whiteSpace: "nowrap" }}>{u.lastLogin}</td>
                      <td style={{ padding: "11px 14px", textAlign: "center" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: u.devicesAssigned > 0 ? "#16605A" : "#5A756F", fontWeight: u.devicesAssigned > 0 ? 600 : 400 }}>{u.devicesAssigned}</span>
                      </td>
                      <td style={{ padding: "11px 14px", textAlign: "center" }}>
                        {u.mfaEnabled
                          ? <Shield size={14} color="#16605A" />
                          : <AlertCircle size={14} color="#B9873F" />
                        }
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {u.status !== "pending" && (
                            <button
                              onClick={() => toggleUser(u.userId)}
                              title={u.status === "active" ? "Suspend access" : "Restore access"}
                              style={{ display: "flex", alignItems: "center", gap: 4, border: "1px solid #D9E2DF", background: "none", borderRadius: 5, padding: "5px 9px", cursor: "pointer" }}
                            >
                              {u.status === "active"
                                ? <><UserX size={11} color="#D6452F" /><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#D6452F" }}>Suspend</span></>
                                : <><UserCheck size={11} color="#16605A" /><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#16605A" }}>Restore</span></>
                              }
                            </button>
                          )}
                          {u.status === "pending" && (
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#B9873F", padding: "5px 9px", border: "1px dashed #B9873F", borderRadius: 5 }}>
                              ◌ Invite sent
                            </span>
                          )}
                          <button
                            onClick={() => removeUser(u.userId)}
                            title="Remove user permanently"
                            style={{ border: "1px solid #D9E2DF", background: "none", borderRadius: 5, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
                          >
                            <Trash2 size={11} color="#D6452F" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Audit log strip */}
            <div style={{ marginTop: 16, background: "#0F312D", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#5A9E96", marginBottom: 10, textTransform: "uppercase" }}>RECENT AUDIT LOG</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { time: "09:14:22", event: "ADM-001 authenticated via MFA — admin session opened", level: "info" },
                  { time: "08:31:05", event: "NRS-002 logged into dashboard — 3 devices loaded for Polyclinique Atlas", level: "info" },
                  { time: "07:52:18", event: "NRS-001 acknowledged SpO₂ alert for P-002 (Fatima Benali)", level: "warn" },
                  { time: "07:15:44", event: "DR-003 (Chaouki) access suspended by ADM-001 — compliance review", level: "crit" },
                  { time: "Yesterday 18:47", event: "DR-001 threshold update: P-004 HR ceiling changed 110→115 bpm", level: "info" },
                ].map(({ time, event, level }) => (
                  <div key={time} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A9E96", whiteSpace: "nowrap" }}>{time}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: level === "crit" ? "#D6452F" : level === "warn" ? "#B9873F" : "#A0C4BE" }}>{event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function PagerModal({ fromUser, notif, onClose, onSent }: {
  fromUser: LoggedUser;
  notif: RPMNotification;
  onClose: () => void;
  onSent: (msg: string) => void;
}) {
  const allSpecialties = ["tous", ...Array.from(new Set(STAFF_SEED.map(s => s.specialty)))];
  const [filterSpec, setFilterSpec] = useState<string>("tous");
  const [selectedId, setSelectedId] = useState<string>("");
  const [message, setMessage] = useState(`URGENCE — Patient: ${notif.patientName} · SpO₂ ${notif.spo2}% · FC ${notif.hr} bpm. Votre intervention est requise.`);
  const [sent, setSent] = useState(false);

  const candidates = STAFF_SEED.filter(s => {
    if (s.id === fromUser.id) return false;
    if (fromUser.role === "nurse") return s.role !== "nurse";
    if (["cardiologist","physician"].includes(fromUser.role)) return true;
    return true;
  }).filter(s => filterSpec === "tous" || s.specialty === filterSpec);

  const selected = STAFF_SEED.find(s => s.id === selectedId);

  const handleSend = () => {
    if (!selectedId || !message.trim()) return;
    setSent(true);
    setTimeout(() => {
      onSent(`📟 Pager envoyé à ${selected?.name} (${selected?.pager}) — réponse sous 2 min`);
      onClose();
    }, 900);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.55)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 14, width: 480, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(15,49,45,0.28)" }}>
        {/* Header */}
        <div style={{ background: "#0F312D", padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Radio size={15} color="#B9873F" />
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Envoyer un Pager</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={16} /></button>
        </div>

        {/* Context bar */}
        <div style={{ background: "#F4F7F6", borderBottom: "1px solid #D9E2DF", padding: "10px 20px", display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "#5A756F" }}>Concernant:</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#0F312D" }}>{notif.patientName}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "2px 8px", borderRadius: 4, background: RISK_CFG[notif.risk].bg, color: RISK_CFG[notif.risk].color, border: `1px solid ${RISK_CFG[notif.risk].color}30` }}>{RISK_CFG[notif.risk].label}</span>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: 20 }}>
          {/* Specialty filter */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#5A756F", letterSpacing: "0.07em", marginBottom: 8, textTransform: "uppercase" }}>Filtrer par spécialité / rôle</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allSpecialties.map(sp => (
                <button key={sp} onClick={() => { setFilterSpec(sp); setSelectedId(""); }}
                  style={{ padding: "4px 11px", borderRadius: 20, border: filterSpec === sp ? "1.5px solid #16605A" : "1px solid #D9E2DF", background: filterSpec === sp ? "#E3EEEC" : "#fff", color: filterSpec === sp ? "#16605A" : "#5A756F", fontSize: 11.5, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: filterSpec === sp ? 700 : 400, cursor: "pointer" }}>
                  {SPECIALTY_LABELS[sp] ?? sp}
                </button>
              ))}
            </div>
          </div>

          {/* Staff list */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#5A756F", letterSpacing: "0.07em", marginBottom: 8, textTransform: "uppercase" }}>
              Sélectionner le destinataire ({candidates.length})
            </div>
            {candidates.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#9AADA8", fontSize: 13 }}>Aucun personnel disponible dans cette spécialité</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {candidates.map(s => {
                const sCfg = STAFF_STATUS_CFG[s.status];
                const isSelected = s.id === selectedId;
                return (
                  <button key={s.id} onClick={() => setSelectedId(isSelected ? "" : s.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 9, border: isSelected ? "2px solid #16605A" : "1px solid #D9E2DF", background: isSelected ? "#E3EEEC" : "#FAFFFE", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: sCfg.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F312D" }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "#5A756F" }}>{SPECIALTY_LABELS[s.specialty] ?? s.specialty} · {s.clinic}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: sCfg.color }}>{sCfg.label}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#9AADA8" }}>📟 {s.pager}</div>
                    </div>
                    {isSelected && <Check size={14} color="#16605A" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#5A756F", letterSpacing: "0.07em", marginBottom: 6, textTransform: "uppercase" }}>Message pager</div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", color: "#0F312D", background: "#F4F7F6", resize: "none", boxSizing: "border-box", outline: "none" }}
            />
          </div>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!selectedId || !message.trim() || sent}
            style={{ width: "100%", background: selectedId && message.trim() && !sent ? "#B9873F" : "#D9E2DF", color: selectedId && message.trim() && !sent ? "#fff" : "#9AADA8", border: "none", borderRadius: 8, padding: "11px 0", cursor: selectedId && message.trim() && !sent ? "pointer" : "not-allowed", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13.5 }}>
            {sent ? "✓ Pager envoyé !" : `📟 Envoyer à ${selected ? selected.name : "— choisir un destinataire —"}`}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ notifications, onMarkRead, onNavigateToPatient, onClose, currentUser, onOpenProfile }: {
  notifications: RPMNotification[];
  onMarkRead: (id: string) => void;
  onNavigateToPatient: (patientId: string) => void;
  onClose: () => void;
  currentUser: LoggedUser;
  onOpenProfile: (staffId: string) => void;
}) {
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});
  const [dispatchConfirm, setDispatchConfirm] = useState<string | null>(null);
  const [dispatched, setDispatched] = useState<Set<string>>(new Set());
  const [pagerTarget, setPagerTarget] = useState<RPMNotification | null>(null);

  const showFeedback = (notifId: string, msg: string) => {
    setActionFeedback(prev => ({ ...prev, [notifId]: msg }));
    setTimeout(() => setActionFeedback(prev => { const n = { ...prev }; delete n[notifId]; return n; }), 3500);
  };

  const handleCall = (n: RPMNotification) => {
    const doc = STAFF_SEED.find(s => s.id === n.assignedDoctorId);
    showFeedback(n.id, `📞 Appel en cours vers ${doc?.name ?? n.assignedDoctorId} (${doc?.phone ?? "—"})`);
    onMarkRead(n.id);
  };

  const handleDispatch = (n: RPMNotification) => {
    setDispatched(prev => new Set([...prev, n.id]));
    setDispatchConfirm(null);
    showFeedback(n.id, `🚨 Ambulance dispatchée vers ${n.address} — GPS partagé avec SAMU 15`);
    onMarkRead(n.id);
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
    {pagerTarget && (
      <PagerModal
        fromUser={currentUser}
        notif={pagerTarget}
        onClose={() => setPagerTarget(null)}
        onSent={(msg) => { showFeedback(pagerTarget.id, msg); onMarkRead(pagerTarget.id); setPagerTarget(null); }}
      />
    )}
    <div style={{ position: "absolute", top: 50, right: 0, width: 460, background: "#fff", border: "1px solid #D9E2DF", borderRadius: 12, boxShadow: "0 16px 48px rgba(15,49,45,0.18)", zIndex: 200, overflow: "hidden" }}>
      {/* Panel header */}
      <div style={{ background: "#0F312D", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={15} color="#fff" />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Notifications d'urgence</span>
          {unread > 0 && <span style={{ background: "#D6452F", color: "#fff", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "1px 7px", borderRadius: 10, fontWeight: 700 }}>{unread} nouveau{unread > 1 ? "x" : ""}</span>}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={16} /></button>
      </div>

      {/* Role label */}
      <div style={{ background: "#F4F7F6", borderBottom: "1px solid #D9E2DF", padding: "7px 18px", display: "flex", alignItems: "center", gap: 8 }}>
        <Shield size={11} color="#5A756F" />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#5A756F", letterSpacing: "0.07em" }}>
          Filtré pour: <strong style={{ color: "#0F312D" }}>{currentUser.role.toUpperCase()}</strong> — {notifications.length} alerte{notifications.length !== 1 ? "s" : ""} vous concernent
        </span>
      </div>

      {/* Notification list */}
      <div style={{ maxHeight: 510, overflowY: "auto" }}>
        {notifications.length === 0 && (
          <div style={{ padding: "36px 20px", textAlign: "center", color: "#9AADA8", fontSize: 13 }}>
            <BellOff size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div>Aucune notification pour votre rôle actuellement.</div>
          </div>
        )}
        {notifications.map((n, idx) => {
          const rcfg = RISK_CFG[n.risk];
          const doc  = STAFF_SEED.find(s => s.id === n.assignedDoctorId);
          const dStatus = doc ? STAFF_STATUS_CFG[doc.status] : null;
          const fb = actionFeedback[n.id];

          return (
            <div key={n.id} style={{ borderTop: idx > 0 ? "1px solid #D9E2DF" : undefined, padding: "14px 18px", background: n.read ? "#fff" : "#FAFFFE" }}>
              {/* Row 1: risk badge + name + time + unread dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#D6452F", flexShrink: 0 }} />}
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, padding: "2px 7px", borderRadius: 4, background: rcfg.bg, color: rcfg.color, border: `1px solid ${rcfg.color}30`, letterSpacing: "0.07em", flexShrink: 0 }}>{rcfg.icon} {rcfg.label}</span>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "#0F312D", flex: 1 }}>{n.patientName}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#9AADA8", flexShrink: 0 }}>{n.time}</span>
              </div>

              {/* Row 2: alert message */}
              <div style={{ fontSize: 13, color: rcfg.color, fontWeight: 600, marginBottom: 3 }}>{n.message}</div>
              <div style={{ fontSize: 12, color: "#5A756F", marginBottom: 8, lineHeight: 1.45 }}>{n.detail}</div>

              {/* Row 3: vitals */}
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                {[
                  { l: "SpO₂",  v: `${n.spo2}%`,          bad: n.spo2 < 90 },
                  { l: "FC",    v: `${n.hr} bpm`,          bad: n.hr > 110 },
                  { l: "TA",    v: `${n.bpSys}/${n.bpDia}`, bad: false },
                ].map(({ l, v, bad }) => (
                  <div key={l} style={{ background: bad ? "#FBEAE6" : "#F4F7F6", borderRadius: 6, padding: "4px 10px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: bad ? "#D6452F" : "#0F312D" }}>{v}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#5A756F", letterSpacing: "0.07em" }}>{l}</div>
                  </div>
                ))}
                <div style={{ flex: 1, background: "#F4F7F6", borderRadius: 6, padding: "4px 10px" }}>
                  {doc ? (
                    <button onClick={() => onOpenProfile(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontWeight: 600, color: "#16605A", textDecoration: "underline", textDecorationColor: "#16605A50", fontFamily: "'IBM Plex Sans', sans-serif" }}>{doc.name}</button>
                  ) : <div style={{ fontSize: 11, color: "#0F312D", fontWeight: 500 }}>—</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                    {dStatus && <><div style={{ width: 5, height: 5, borderRadius: "50%", background: dStatus.dot }} /><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: dStatus.color }}>{dStatus.label}</span></>}
                  </div>
                </div>
              </div>

              {/* Feedback banner */}
              {fb && (
                <div style={{ background: "#E3EEEC", border: "1px solid #16605A40", borderRadius: 7, padding: "8px 12px", marginBottom: 8, fontSize: 12.5, color: "#16605A", fontWeight: 500 }}>{fb}</div>
              )}

              {/* Dispatch confirm */}
              {dispatchConfirm === n.id && (
                <div style={{ background: "#FBEAE6", border: "1.5px solid #D6452F", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#D6452F", marginBottom: 6 }}>🚨 Confirmer le dispatch ambulance</div>
                  <div style={{ fontSize: 12, color: "#33534E", marginBottom: 4 }}><strong>Adresse:</strong> {n.address}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#D6452F", marginBottom: 8 }}>GPS {n.gpsLat.toFixed(4)}°N, {Math.abs(n.gpsLng).toFixed(4)}°W</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleDispatch(n)} style={{ flex: 1, background: "#D6452F", color: "#fff", border: "none", borderRadius: 6, padding: "7px 0", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 12 }}>
                      Confirmer — Partager GPS
                    </button>
                    <button onClick={() => setDispatchConfirm(null)} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 6, padding: "7px 14px", cursor: "pointer", color: "#5A756F", fontSize: 12 }}>Annuler</button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => { onNavigateToPatient(n.patientId); onMarkRead(n.id); onClose(); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "#0F312D", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11.5 }}>
                  <FileText size={11} /> Voir dossier
                </button>
                <button onClick={() => handleCall(n)} style={{ display: "flex", alignItems: "center", gap: 5, background: "#E3EEEC", color: "#16605A", border: "1px solid #16605A40", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11.5 }}>
                  <PhoneCall size={11} /> Appeler {doc?.name.replace("Dr. ", "Dr ") ?? "médecin"}
                </button>
                <button onClick={() => { setPagerTarget(n); onMarkRead(n.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "#FDF3E3", color: "#B9873F", border: "1px solid #B9873F40", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11.5 }}>
                  <Radio size={11} /> Pager
                </button>
                {!dispatched.has(n.id) ? (
                  <button onClick={() => setDispatchConfirm(dispatchConfirm === n.id ? null : n.id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#FBEAE6", color: "#D6452F", border: "1px solid #D6452F40", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11.5 }}>
                    <Siren size={11} /> Ambulance
                  </button>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, background: "#E3EEEC", color: "#16605A", borderRadius: 6, padding: "6px 12px", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11.5 }}>
                    <Check size={11} /> Ambulance dispatchée
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #D9E2DF", padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F4F7F6" }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em" }}>SAMU MAROC: 15 · LIGNE RPM: +212 5 22 00 00 00</span>
        <button onClick={() => notifications.forEach(n => onMarkRead(n.id))} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#16605A", letterSpacing: "0.07em" }}>
          TOUT MARQUER LU
        </button>
      </div>
    </div>
    </>
  );
}


// ─── Top nav bar ──────────────────────────────────────────────────────────────
const ALL_TABS: { s: Screen; label: string; icon: React.ReactNode }[] = [
  { s: "dashboard",  label: "Nurse Dashboard",     icon: <Monitor size={14} /> },
  { s: "alerts",     label: "Risk & Alertes",       icon: <AlertTriangle size={14} /> },
  { s: "records",    label: "Dossiers Patients",    icon: <FileText size={14} /> },
  { s: "calendar",   label: "Calendrier",           icon: <CalendarPlus size={14} /> },
  { s: "devices",    label: "Devices & Accès",      icon: <Radio size={14} /> },
  { s: "calculator", label: "ROI Calculator",       icon: <BarChart2 size={14} /> },
  { s: "landing",    label: "Platform Overview",    icon: <FileText size={14} /> },
];

function TopNav({ screen, setScreen, user, onLogout, notifications, onMarkRead, onNavigateToPatient, onOpenProfile }: {
  screen: Screen; setScreen: (s: Screen) => void;
  user: LoggedUser; onLogout: () => void;
  notifications: RPMNotification[];
  onMarkRead: (id: string) => void;
  onNavigateToPatient: (patientId: string) => void;
  onOpenProfile: (staffId: string) => void;
}) {
  const allowed = ROLE_SCREENS[user.role] ?? [];
  const tabs = ALL_TABS.filter(t => allowed.includes(t.s));
  const ROLE_COLOR: Record<string, string> = { admin: "#B9873F", nurse: "#16605A", cardiologist: "#D6452F", physician: "#D6452F", technician: "#5A756F" };
  const roleColor = ROLE_COLOR[user.role] ?? "#5A756F";
  const [panelOpen, setPanelOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
  const hasEmergency = notifications.some(n => !n.read && (n.risk === "extreme" || n.risk === "high"));
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #D9E2DF", display: "flex", alignItems: "center", padding: "0 20px", gap: 2, height: 44, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 16, paddingRight: 16, borderRight: "1px solid #D9E2DF", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 13, color: "#0F312D", letterSpacing: "0.01em" }}>
          RPM<span style={{ color: "#D6452F" }}>▮</span>MOROCCO
        </div>
      </div>
      {tabs.map(({ s, label, icon }) => (
        <button key={s} onClick={() => setScreen(s)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 12px", height: 44, background: "none", border: "none", borderBottom: screen === s ? "2px solid #D6452F" : "2px solid transparent", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: screen === s ? 600 : 400, fontSize: 12.5, color: screen === s ? "#0F312D" : "#5A756F", whiteSpace: "nowrap" }}>
          <span style={{ color: screen === s ? "#16605A" : "#5A756F" }}>{icon}</span>
          {label}
        </button>
      ))}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {/* Bell */}
        <div ref={panelRef} style={{ position: "relative" }}>
          <button onClick={() => setPanelOpen(v => !v)} style={{ position: "relative", background: panelOpen ? "#F4F7F6" : "none", border: panelOpen ? "1px solid #D9E2DF" : "1px solid transparent", borderRadius: 8, padding: "5px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: hasEmergency ? "#D6452F" : "#5A756F" }}>
            <Bell size={16} style={{ animation: hasEmergency ? "bell-shake 1.8s ease infinite" : "none" }} />
            {unread > 0 && (
              <div style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#D6452F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700, color: "#fff", border: "2px solid #fff" }}>
                {unread}
              </div>
            )}
          </button>
          {panelOpen && (
            <NotificationPanel
              notifications={notifications}
              onMarkRead={onMarkRead}
              onNavigateToPatient={onNavigateToPatient}
              onClose={() => setPanelOpen(false)}
              currentUser={user}
              onOpenProfile={onOpenProfile}
            />
          )}
        </div>

        <div style={{ width: 1, height: 20, background: "#D9E2DF" }} />

        {/* User badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0F312D", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={12} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#0F312D", lineHeight: 1 }}>{user.name}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: roleColor, letterSpacing: "0.08em", lineHeight: 1, marginTop: 2, textTransform: "uppercase" }}>{user.role} · {user.id}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #D9E2DF", borderRadius: 6, padding: "5px 10px", cursor: "pointer", color: "#5A756F", fontSize: 11.5 }}>
          <LogOut size={11} /> Déconnexion
        </button>
      </div>
    </div>
  );
}


// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [focusedPatientId, setFocusedPatientId] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<RPMNotification[]>(buildNotifications);
  const [profileStaffId, setProfileStaffId] = useState<string | null>(null);

  const handleLogin = (u: LoggedUser) => {
    setCurrentUser(u);
    const allowed = ROLE_SCREENS[u.role] ?? [];
    setScreen((allowed[0] ?? "dashboard") as Screen);
  };

  const handleLogout = () => { setCurrentUser(null); setScreen("dashboard"); setFocusedPatientId(undefined); setProfileStaffId(null); };

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const navigateToPatient = (patientId: string) => {
    setFocusedPatientId(patientId);
    setScreen("records");
  };

  const globalStyles = `
    * { scrollbar-width: thin; scrollbar-color: #D9E2DF transparent; }
    *::-webkit-scrollbar { width: 5px; height: 5px; }
    *::-webkit-scrollbar-track { background: transparent; }
    *::-webkit-scrollbar-thumb { background: #D9E2DF; border-radius: 3px; }
    @keyframes bell-shake {
      0%,100% { transform: rotate(0deg); }
      10%,30%  { transform: rotate(-12deg); }
      20%,40%  { transform: rotate(12deg); }
      50%      { transform: rotate(0deg); }
    }
  `;

  if (!currentUser) return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{globalStyles}</style>
      <LoginScreen onLogin={handleLogin} />
    </div>
  );

  if (currentUser.role === "patient") return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{globalStyles}</style>
      <PatientPortal user={currentUser} onLogout={handleLogout} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", minHeight: "100vh" }}>
      <style>{globalStyles}</style>
      {profileStaffId && (
        <StaffProfileModal
          staffId={profileStaffId}
          currentUser={currentUser}
          onClose={() => setProfileStaffId(null)}
          onNavigateToPatient={navigateToPatient}
        />
      )}
      <TopNav
        screen={screen} setScreen={setScreen}
        user={currentUser} onLogout={handleLogout}
        notifications={notifications.filter(n => !n.visibleToRoles || n.visibleToRoles.includes(currentUser.role))} onMarkRead={markRead}
        onNavigateToPatient={navigateToPatient}
        onOpenProfile={setProfileStaffId}
      />
      {screen === "landing"    && <LandingScreen />}
      {screen === "dashboard"  && <DashboardScreen currentUser={currentUser} />}
      {screen === "calculator" && <CalculatorScreen />}
      {screen === "devices"    && <DevicesScreen currentUser={currentUser} onAddNotification={n => setNotifications(prev => [n, ...prev])} />}
      {screen === "alerts"     && <AlertsScreen />}
      {screen === "records"    && <RecordsScreen currentUser={currentUser} initialPatientId={focusedPatientId} />}
      {screen === "calendar"   && <CalendarScreen currentUser={currentUser} onNavigateToPatient={navigateToPatient} onOpenProfile={setProfileStaffId} />}
    </div>
  );
}
