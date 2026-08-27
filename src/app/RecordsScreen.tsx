import { useState, useRef } from "react";
import {
  AlertTriangle, Bell, CheckCircle, Check, X, ChevronRight,
  Clock, BellOff, SlidersHorizontal, FileText,
  UserCheck, UserX, UserPlus, Key, RefreshCw, Trash2, Edit3,
  ChevronDown, Filter, LayoutGrid, List, AlertCircle,
  User, Phone, PhoneCall, PhoneOff, MapPin, Navigation,
  Calendar, CalendarPlus, Stethoscope, HeartPulse, ClipboardList,
  PenLine, ChevronUp, Siren
} from "lucide-react";
import {
  Patient, LoggedUser, MedRecord, Medication, DoctorNote, ChatMsg,
  Appointment, StaffMember, StaffStatusKey,
  SEED, MED_RECORDS, STAFF_SEED, APPT_SEED, STAFF_STATUS_CFG, TYPE_CFG,
  ALLERGY_DRUG_MAP, detectAllergyConflict, getRisk, RISK_CFG,
  inputStyle, ROLE_CAL_COLOR, SPECIALTY_LABELS
} from "./shared";

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


function ActionBtn({ label, color, bg, onClick }: { label: string; color: string; bg: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: bg, color, border: `1px solid ${color}40`, borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

// ─── Records Screen ───────────────────────────────────────────────────────────
type RecordTab = "overview" | "meds" | "notes" | "chat" | "rdv";

export function RecordsScreen({ currentUser, initialPatientId }: { currentUser: LoggedUser; initialPatientId?: string }) {
  const [selectedId, setSelectedId] = useState<string>(initialPatientId ?? "P-001");
  const [recordTab, setRecordTab] = useState<RecordTab>("overview");
  const [msgText, setMsgText] = useState("");
  const [chatsByPatient, setChatsByPatient] = useState<Record<string, ChatMsg[]>>(
    Object.fromEntries(Object.entries(MED_RECORDS).map(([k, v]) => [k, [...v.messages]]))
  );
  const [notesByPatient, setNotesByPatient] = useState<Record<string, DoctorNote[]>>(
    Object.fromEntries(Object.entries(MED_RECORDS).map(([k, v]) => [k, [...v.notes]]))
  );
  const [apptsByPatient, setApptsByPatient] = useState<Record<string, Appointment[]>>(
    (() => {
      const m: Record<string, Appointment[]> = {};
      APPT_SEED.forEach(a => { m[a.patientId] = [...(m[a.patientId] ?? []), a]; });
      return m;
    })()
  );
  const [staffStatuses, setStaffStatuses] = useState<StaffMember[]>(STAFF_SEED);
  const [search, setSearch] = useState("");

  // Medication state — lifted out of MED_RECORDS so edits are reactive
  const [medsByPatient, setMedsByPatient] = useState<Record<string, Medication[]>>(
    Object.fromEntries(Object.entries(MED_RECORDS).map(([k, v]) => [k, [...v.medications]]))
  );

  // Med form state
  const [showMedForm, setShowMedForm] = useState(false);
  const [medForm, setMedForm] = useState({ name: "", dose: "", freq: "", indication: "" });
  const [medConflict, setMedConflict] = useState<string | null>(null);
  const [medForceAdd, setMedForceAdd] = useState(false);

  // Note form state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteTags, setNoteTags] = useState("");

  // Appointment form state
  const [showApptForm, setShowApptForm] = useState(false);
  const [apptForm, setApptForm] = useState({ title: "", date: "", time: "", type: "consultation" as Appointment["type"], location: "", notes: "", duration: 30, doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak" });

  // Call/locate modal state
  const [callModal, setCallModal] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "connected" | "ended">("idle");

  // Staff status edit
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  const canWriteNotes = ["nurse", "cardiologist", "physician", "admin"].includes(currentUser.role);
  const canScheduleAppt = ["cardiologist", "physician", "admin"].includes(currentUser.role);
  const canManageMeds  = ["cardiologist", "physician", "admin"].includes(currentUser.role);

  const filteredPatients = SEED.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase())
  );

  const rec = MED_RECORDS[selectedId];
  const patient = SEED.find(p => p.id === selectedId);
  const risk = patient ? getRisk(patient.spo2, patient.hr) : "stable";
  const chats = chatsByPatient[selectedId] ?? [];
  const notes = notesByPatient[selectedId] ?? [];
  const appts = apptsByPatient[selectedId] ?? [];
  const meds  = medsByPatient[selectedId] ?? rec?.medications ?? [];
  const callPatient = callModal ? SEED.find(p => p.id === callModal) : null;
  const callRec = callModal ? MED_RECORDS[callModal] : null;

  // Live allergy check when doctor types med name
  const handleMedNameChange = (name: string) => {
    setMedForm(f => ({ ...f, name }));
    setMedForceAdd(false);
    if (rec) {
      const conflict = detectAllergyConflict(name, rec.allergies);
      setMedConflict(conflict);
    }
  };

  const addMed = () => {
    if (!medForm.name.trim() || !medForm.dose.trim()) return;
    if (medConflict && !medForceAdd) return; // blocked unless overridden
    const now = new Date().toISOString().slice(0, 10);
    const newMed: Medication = {
      name: medForm.name.trim(), dose: medForm.dose.trim(),
      freq: medForm.freq.trim(), by: currentUser.name,
      since: now, indication: medForm.indication.trim(),
    };
    setMedsByPatient(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), newMed] }));
    setMedForm({ name: "", dose: "", freq: "", indication: "" });
    setMedConflict(null); setMedForceAdd(false); setShowMedForm(false);
  };

  const removeMed = (medName: string) => {
    setMedsByPatient(prev => ({ ...prev, [selectedId]: (prev[selectedId] ?? []).filter(m => m.name !== medName) }));
  };

  const sendMsg = () => {
    if (!msgText.trim()) return;
    const newMsg: ChatMsg = { id: `msg-${Date.now()}`, from: currentUser.name, role: currentUser.role, text: msgText.trim(), time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), isStaff: currentUser.role !== "patient" };
    setChatsByPatient(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), newMsg] }));
    setMsgText("");
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote: DoctorNote = {
      id: `n-${Date.now()}`, author: currentUser.name, role: currentUser.role,
      date: new Date().toLocaleString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", ""),
      text: noteText.trim(),
      tags: noteTags.split(",").map(t => t.trim()).filter(Boolean),
    };
    setNotesByPatient(prev => ({ ...prev, [selectedId]: [newNote, ...(prev[selectedId] ?? [])] }));
    setNoteText(""); setNoteTags(""); setShowNoteForm(false);
  };

  const addAppt = () => {
    if (!apptForm.title || !apptForm.date || !apptForm.time) return;
    const newAppt: Appointment = {
      id: `APT-${Date.now()}`, patientId: selectedId, doctorId: apptForm.doctorId, doctorName: apptForm.doctorName,
      type: apptForm.type, title: apptForm.title, date: apptForm.date, time: apptForm.time,
      duration: apptForm.duration, location: apptForm.location, notes: apptForm.notes,
      status: "scheduled", createdBy: currentUser.id, createdAt: new Date().toLocaleString("fr-FR"),
    };
    setApptsByPatient(prev => ({ ...prev, [selectedId]: [newAppt, ...(prev[selectedId] ?? [])] }));
    setApptForm({ title: "", date: "", time: "", type: "consultation", location: "", notes: "", duration: 30, doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak" });
    setShowApptForm(false);
  };

  const startCall = (patientId: string) => { setCallModal(patientId); setCallStatus("calling"); setTimeout(() => setCallStatus("connected"), 2200); };
  const endCall = () => { setCallStatus("ended"); setTimeout(() => { setCallModal(null); setCallStatus("idle"); }, 1200); };

  const updateStaffStatus = (id: string, status: StaffStatusKey, note: string) => {
    setStaffStatuses(prev => prev.map(s => s.id === id ? { ...s, status, statusNote: note } : s));
    setEditingStatus(null);
  };

  const TABS: { key: RecordTab; label: (n: DoctorNote[], a: Appointment[], m: Medication[]) => string }[] = [
    { key: "overview", label: () => "Aperçu" },
    { key: "meds",     label: (_, __, m) => `Médicaments (${m.length})` },
    { key: "notes",    label: (n) => `Notes cliniques (${n.length})` },
    { key: "chat",     label: () => "Consultation chat" },
    { key: "rdv",      label: (_, a) => `Rendez-vous (${a.length})` },
  ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 44px)", background: "#F4F7F6", overflow: "hidden" }}>

      {/* Patient sidebar */}
      <div style={{ width: 250, borderRight: "1px solid #D9E2DF", background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "14px 14px 10px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.12em", color: "#B9873F", textTransform: "uppercase", marginBottom: 8 }}>DOSSIERS PATIENTS</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 6, padding: "7px 9px", fontSize: 12, background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredPatients.map(p => {
            const r = getRisk(p.spo2, p.hr); const cfg = RISK_CFG[r];
            return (
              <div key={p.id} onClick={() => { setSelectedId(p.id); setRecordTab("overview"); setShowNoteForm(false); setShowApptForm(false); }}
                style={{ padding: "10px 14px", borderBottom: "1px solid #F4F7F6", cursor: "pointer", background: selectedId === p.id ? "#F4F7F6" : "#fff", borderLeft: selectedId === p.id ? `3px solid ${cfg.color}` : "3px solid transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F312D" }}>{p.name}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", marginTop: 1 }}>{p.id} · {p.age}a · {p.ward}</div>
                    <div style={{ fontSize: 11, color: "#5A756F", marginTop: 1 }}>{p.condition}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, padding: "2px 5px", borderRadius: 3, background: cfg.bg, color: cfg.color, letterSpacing: "0.06em" }}>{cfg.icon}</span>
                    <button onClick={e => { e.stopPropagation(); startCall(p.id); }} title="Localiser & Appeler" style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 4, padding: "2px 5px", cursor: "pointer", color: "#16605A", display: "flex", alignItems: "center" }}>
                      <PhoneCall size={10} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Staff status panel */}
        <div style={{ borderTop: "1px solid #D9E2DF", padding: "10px 14px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.12em", color: "#16605A", textTransform: "uppercase", marginBottom: 8 }}>ÉQUIPE SOIGNANTE</div>
          {staffStatuses.map(s => {
            const cfg = STAFF_STATUS_CFG[s.status];
            return (
              <div key={s.id} style={{ marginBottom: 6 }}>
                {editingStatus === s.id ? (
                  <StaffStatusEditor staff={s} onSave={(st, note) => updateStaffStatus(s.id, st, note)} onCancel={() => setEditingStatus(null)} canEdit={["admin", "nurse", "cardiologist", "physician"].includes(currentUser.role) && (currentUser.id === s.id || currentUser.role === "admin")} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: "#0F312D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: cfg.color }}>{cfg.label}</div>
                    </div>
                    {(currentUser.id === s.id || currentUser.role === "admin") && (
                      <button onClick={() => setEditingStatus(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#5A756F", padding: 2 }}><Edit3 size={10} /></button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Medical page */}
      {rec && patient ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Patient header */}
          <div style={{ background: "#fff", borderBottom: "1px solid #D9E2DF", padding: "14px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 19, color: "#0F312D" }}>{patient.name}</h2>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, padding: "3px 8px", borderRadius: 5, background: RISK_CFG[risk].bg, color: RISK_CFG[risk].color, border: `1px solid ${RISK_CFG[risk].color}40` }}>
                    {RISK_CFG[risk].icon} {RISK_CFG[risk].label}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {[
                    { l: "ID", v: patient.id }, { l: "Âge", v: `${patient.age} ans` },
                    { l: "Sang.", v: rec.bloodType }, { l: "Dispositif", v: rec.deviceId },
                  ].map(({ l, v }) => (
                    <div key={l}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", letterSpacing: "0.08em" }}>{l} </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#0F312D", fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                  {rec.allergies.length > 0 && (
                    <div>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#D6452F", letterSpacing: "0.08em" }}>⚠ ALLERGIES </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#D6452F", fontWeight: 700 }}>{rec.allergies.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Vitals + action buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { l: "SpO₂", v: `${patient.spo2.toFixed(0)}%`, c: patient.spo2 < 90 ? "#D6452F" : "#16605A" },
                    { l: "FC", v: `${patient.hr}`, c: patient.hr > 110 ? "#D6452F" : "#0F312D" },
                    { l: "TA", v: `${patient.bpSys}/${patient.bpDia}`, c: "#0F312D" },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => startCall(patient.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#16605A", color: "#fff", border: "none", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>
                    <PhoneCall size={13} /> Appeler & Localiser
                  </button>
                  <button onClick={() => startCall(patient.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#FBEAE6", color: "#D6452F", border: "1px solid #D6452F40", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>
                    <Siren size={13} /> Monitoring Urgence
                  </button>
                </div>
              </div>
            </div>
            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: 0, borderTop: "1px solid #F4F7F6", paddingTop: 2 }}>
              {TABS.map(({ key, label }) => (
                <button key={key} onClick={() => setRecordTab(key)} style={{ padding: "7px 16px", background: "none", border: "none", borderBottom: recordTab === key ? "2px solid #D6452F" : "2px solid transparent", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: recordTab === key ? 600 : 400, fontSize: 12.5, color: recordTab === key ? "#0F312D" : "#5A756F", whiteSpace: "nowrap" }}>
                  {label(notes, appts, meds)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>

            {/* OVERVIEW */}
            {recordTab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, padding: 18 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, letterSpacing: "0.10em", color: "#16605A", marginBottom: 10, textTransform: "uppercase" }}>Informations patient</div>
                  {[
                    { l: "Condition", v: patient.condition }, { l: "Service", v: patient.ward },
                    { l: "Assurance", v: rec.insurance }, { l: "Urgence", v: rec.emergencyContact },
                    { l: "Tél. urgence", v: rec.emergencyPhone }, { l: "Adresse", v: rec.address },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #F4F7F6" }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.06em", width: 90, flexShrink: 0, textTransform: "uppercase" }}>{l}</span>
                      <span style={{ fontSize: 13, color: "#0F312D" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, padding: 18 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, letterSpacing: "0.10em", color: "#16605A", marginBottom: 10, textTransform: "uppercase" }}>Dispositif & GPS</div>
                    {[
                      { l: "Device ID", v: rec.deviceId }, { l: "Plan", v: rec.subscriptionPlan },
                      { l: "GPS", v: `${rec.gpsLat.toFixed(4)}°N, ${Math.abs(rec.gpsLng).toFixed(4)}°W` },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #F4F7F6" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", width: 80, flexShrink: 0, textTransform: "uppercase" }}>{l}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#0F312D" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: rec.allergies.length ? "#FBEAE6" : "#E3EEEC", border: `1px solid ${rec.allergies.length ? "#D6452F" : "#16605A"}40`, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: rec.allergies.length ? "#D6452F" : "#16605A", marginBottom: 6, textTransform: "uppercase" }}>
                      {rec.allergies.length ? "⚠ Allergies connues" : "✓ Aucune allergie"}
                    </div>
                    {rec.allergies.map(a => <div key={a} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: "#D6452F" }}>{a}</div>)}
                  </div>
                  {/* Next appointment quick view */}
                  {appts.filter(a => a.status !== "done" && a.status !== "cancelled").slice(0, 1).map(a => (
                    <div key={a.id} style={{ background: "#fff", border: "1px solid #D9E2DF", borderLeft: "3px solid #B9873F", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#B9873F", marginBottom: 5, textTransform: "uppercase" }}>Prochain RDV</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F312D" }}>{a.title}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#5A756F", marginTop: 3 }}>{a.date} · {a.time} · {a.location}</div>
                      <div style={{ fontSize: 11.5, color: "#5A756F", marginTop: 2 }}>{a.doctorName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEDICATIONS */}
            {recordTab === "meds" && rec && (
              <div>
                {/* Allergies always-visible banner */}
                {rec.allergies.length > 0 && (
                  <div style={{ background: "#FBEAE6", border: "1.5px solid #D6452F", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>⚠</span>
                    <div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#D6452F", letterSpacing: "0.10em", fontWeight: 700, marginBottom: 4 }}>ALLERGIES DOCUMENTÉES — tout médicament prescrit est vérifié automatiquement</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {rec.allergies.map(a => (
                          <span key={a} style={{ background: "#fff", border: "1.5px solid #D6452F", color: "#D6452F", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 5 }}>{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add medication form — doctors only */}
                {canManageMeds && (
                  <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, marginBottom: 14, overflow: "hidden" }}>
                    <button onClick={() => { setShowMedForm(v => !v); setMedForm({ name: "", dose: "", freq: "", indication: "" }); setMedConflict(null); setMedForceAdd(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "none", border: "none", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PenLine size={14} color="#16605A" />
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, color: "#16605A" }}>Prescrire un médicament</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F" }}>{currentUser.name} · {currentUser.role}</span>
                      </div>
                      {showMedForm ? <ChevronUp size={14} color="#5A756F" /> : <ChevronDown size={14} color="#5A756F" />}
                    </button>

                    {showMedForm && (
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F4F7F6" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                          {/* Med name with live allergy check */}
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Nom du médicament *</label>
                            <input
                              value={medForm.name}
                              onChange={e => handleMedNameChange(e.target.value)}
                              placeholder="ex: Amoxicilline 500mg"
                              style={{ ...inputStyle, border: medConflict ? "1.5px solid #D6452F" : "1.5px solid #D9E2DF" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Dose *</label>
                            <input value={medForm.dose} onChange={e => setMedForm(f => ({ ...f, dose: e.target.value }))} placeholder="ex: 500mg" style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Fréquence</label>
                            <input value={medForm.freq} onChange={e => setMedForm(f => ({ ...f, freq: e.target.value }))} placeholder="ex: 3× / jour" style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Indication / Motif</label>
                          <input value={medForm.indication} onChange={e => setMedForm(f => ({ ...f, indication: e.target.value }))} placeholder="ex: Antibiotique post-opératoire — prévention infection" style={inputStyle} />
                        </div>

                        {/* Allergy conflict warning */}
                        {medConflict && (
                          <div style={{ marginTop: 12, background: "#FBEAE6", border: "1.5px solid #D6452F", borderRadius: 9, padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <AlertCircle size={16} color="#D6452F" />
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700, color: "#D6452F", letterSpacing: "0.07em" }}>
                                CONTRE-INDICATION DÉTECTÉE — Allergie : {medConflict}
                              </span>
                            </div>
                            <p style={{ fontSize: 13, color: "#5A1A0F", lineHeight: 1.55, marginBottom: 10 }}>
                              Le médicament <strong>{medForm.name}</strong> appartient à la famille des substances auxquelles ce patient est allergique (<strong>{medConflict}</strong>).
                              La prescription est bloquée par défaut. En tant que médecin, vous pouvez passer outre avec justification clinique.
                            </p>
                            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                              <input type="checkbox" checked={medForceAdd} onChange={e => setMedForceAdd(e.target.checked)} style={{ marginTop: 2, width: 14, height: 14, flexShrink: 0 }} />
                              <span style={{ fontSize: 12.5, color: "#D6452F", fontWeight: 600 }}>
                                Je confirme avoir évalué le risque allergique et prends la décision médicale de prescrire ce médicament malgré l'allergie documentée.
                              </span>
                            </label>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
                          <button onClick={() => { setShowMedForm(false); setMedConflict(null); setMedForceAdd(false); }} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 16px", cursor: "pointer", color: "#5A756F", fontSize: 13 }}>Annuler</button>
                          <button
                            onClick={addMed}
                            disabled={!medForm.name.trim() || !medForm.dose.trim() || (!!medConflict && !medForceAdd)}
                            style={{ background: medConflict && !medForceAdd ? "#9AADA8" : "#16605A", color: "#fff", border: "none", borderRadius: 7, padding: "8px 22px", cursor: (!medForm.name.trim() || !medForm.dose.trim() || (!!medConflict && !medForceAdd)) ? "not-allowed" : "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 13, opacity: (!medForm.name.trim() || !medForm.dose.trim()) ? 0.5 : 1 }}
                          >
                            {medConflict && !medForceAdd ? "⛔ Bloqué — allergie" : "✓ Prescrire"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Medication list — all meds, allergic ones flagged */}
                {meds.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#5A756F", fontSize: 13.5 }}>Aucun médicament prescrit.</div>
                ) : (
                  <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#E3EEEC" }}>
                          {["Médicament", "Dose", "Fréquence", "Prescrit par", "Depuis", "Indication", ...(canManageMeds ? [""] : [])].map(h => (
                            <th key={h} style={{ padding: "9px 13px", textAlign: "left", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, letterSpacing: "0.10em", color: "#16605A", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {meds.map((m, i) => {
                          const conflict = detectAllergyConflict(m.name, rec.allergies);
                          const rowBg = conflict ? "#FFF8F7" : "#fff";
                          return (
                            <tr key={m.name + i} style={{ borderTop: i > 0 ? "1px solid #D9E2DF" : undefined, background: rowBg }}>
                              <td style={{ padding: "11px 13px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontWeight: 700, fontSize: 13, color: conflict ? "#D6452F" : "#0F312D" }}>{m.name}</span>
                                  {conflict && (
                                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8.5, background: "#D6452F", color: "#fff", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                                      ⚠ ALLERGIE: {conflict}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: "11px 13px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: conflict ? "#D6452F" : "#D6452F", fontWeight: 700 }}>{m.dose}</td>
                              <td style={{ padding: "11px 13px", fontSize: 12.5, color: "#33534E" }}>{m.freq}</td>
                              <td style={{ padding: "11px 13px", fontSize: 12, color: "#5A756F" }}>{m.by}</td>
                              <td style={{ padding: "11px 13px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#5A756F" }}>{m.since}</td>
                              <td style={{ padding: "11px 13px", fontSize: 12, color: "#33534E", maxWidth: 200 }}>{m.indication}</td>
                              {canManageMeds && (
                                <td style={{ padding: "11px 13px" }}>
                                  <button
                                    onClick={() => removeMed(m.name)}
                                    title={conflict ? "Retirer ce médicament contre-indiqué" : "Retirer ce médicament"}
                                    style={{ display: "flex", alignItems: "center", gap: 4, background: conflict ? "#D6452F" : "none", color: conflict ? "#fff" : "#D6452F", border: conflict ? "none" : "1px solid #D6452F40", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}
                                  >
                                    <X size={11} /> {conflict ? "Retirer ⚠" : "Retirer"}
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary footer */}
                {meds.length > 0 && (() => {
                  const conflicted = meds.filter(m => detectAllergyConflict(m.name, rec.allergies));
                  return conflicted.length > 0 ? (
                    <div style={{ marginTop: 12, background: "#FBEAE6", border: "1.5px solid #D6452F", borderRadius: 9, padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#D6452F", fontWeight: 700, letterSpacing: "0.08em" }}>
                          ⚠ {conflicted.length} médicament{conflicted.length > 1 ? "s" : ""} contre-indiqué{conflicted.length > 1 ? "s" : ""} détecté{conflicted.length > 1 ? "s" : ""}
                        </span>
                        <div style={{ fontSize: 12.5, color: "#5A1A0F", marginTop: 3 }}>
                          {conflicted.map(m => m.name).join(", ")}
                        </div>
                      </div>
                      {canManageMeds && (
                        <button
                          onClick={() => conflicted.forEach(m => removeMed(m.name))}
                          style={{ background: "#D6452F", color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          Retirer tous les contre-indiqués
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, background: "#E3EEEC", border: "1px solid #16605A40", borderRadius: 8, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={14} color="#16605A" />
                      <span style={{ fontSize: 12.5, color: "#16605A", fontWeight: 500 }}>Aucune interaction allergique détectée dans la prescription actuelle.</span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* NOTES */}
            {recordTab === "notes" && (
              <div>
                {/* Add note form */}
                {canWriteNotes && (
                  <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
                    <button onClick={() => setShowNoteForm(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "none", border: "none", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PenLine size={14} color="#16605A" />
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, color: "#16605A" }}>Ajouter une note clinique</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F" }}>{currentUser.name} · {currentUser.role}</span>
                      </div>
                      {showNoteForm ? <ChevronUp size={14} color="#5A756F" /> : <ChevronDown size={14} color="#5A756F" />}
                    </button>
                    {showNoteForm && (
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F4F7F6" }}>
                        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Rédigez votre note clinique ici... (observation, évolution, décision thérapeutique, consignes infirmières)" rows={5}
                          style={{ width: "100%", border: "1.5px solid #D9E2DF", borderRadius: 8, padding: "10px 12px", fontSize: 13.5, fontFamily: "'IBM Plex Sans', sans-serif", color: "#0F312D", outline: "none", resize: "vertical", boxSizing: "border-box", marginTop: 12, lineHeight: 1.6 }} />
                        <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                          <input value={noteTags} onChange={e => setNoteTags(e.target.value)} placeholder="Tags (séparés par virgule) ex: Stable, Post-op J+2" style={{ flex: 1, border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 12px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", background: "#F4F7F6", color: "#0F312D", outline: "none" }} />
                          <button onClick={addNote} disabled={!noteText.trim()} style={{ background: "#0F312D", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: noteText.trim() ? "pointer" : "default", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, opacity: noteText.trim() ? 1 : 0.5 }}>Enregistrer</button>
                          <button onClick={() => { setShowNoteForm(false); setNoteText(""); setNoteTags(""); }} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 14px", cursor: "pointer", color: "#5A756F", fontSize: 13 }}>Annuler</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Notes list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {notes.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#5A756F", fontSize: 13 }}>Aucune note clinique enregistrée.</div>}
                  {notes.map(note => (
                    <div key={note.id} style={{ background: "#fff", border: "1px solid #D9E2DF", borderLeft: `3px solid ${note.role.startsWith("cardio") || note.role.startsWith("phys") || note.author.startsWith("Dr") ? "#16605A" : "#B9873F"}`, borderRadius: 10, padding: "14px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E3EEEC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {note.author.startsWith("Dr") ? <Stethoscope size={13} color="#16605A" /> : <ClipboardList size={13} color="#B9873F" />}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#0F312D" }}>{note.author}</span>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", marginLeft: 8, textTransform: "uppercase" }}>{note.role}</span>
                          </div>
                        </div>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#5A756F" }}>{note.date}</span>
                      </div>
                      <p style={{ fontSize: 13.5, color: "#33534E", lineHeight: 1.65, marginBottom: 10 }}>{note.text}</p>
                      {note.tags.length > 0 && (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {note.tags.map(tag => <span key={tag} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, padding: "2px 8px", background: "#E3EEEC", color: "#16605A", borderRadius: 4 }}>{tag}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHAT */}
            {recordTab === "chat" && (
              <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 290px)", minHeight: 360 }}>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12 }}>
                  {chats.map(msg => (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.isStaff ? "flex-start" : "flex-end" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", marginBottom: 3, letterSpacing: "0.06em" }}>{msg.from} · {msg.role} · {msg.time}</div>
                      <div style={{ maxWidth: "72%", background: msg.isStaff ? "#E3EEEC" : "#0F312D", color: msg.isStaff ? "#0F312D" : "#fff", borderRadius: msg.isStaff ? "4px 14px 14px 14px" : "14px 4px 14px 14px", padding: "10px 14px", fontSize: 13.5, lineHeight: 1.55 }}>{msg.text}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid #D9E2DF" }}>
                  <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMsg()} placeholder="Écrire un message de consultation..." style={{ flex: 1, border: "1.5px solid #D9E2DF", borderRadius: 8, padding: "10px 14px", fontSize: 13.5, fontFamily: "'IBM Plex Sans', sans-serif", background: "#fff", color: "#0F312D", outline: "none" }} />
                  <button onClick={sendMsg} style={{ background: "#16605A", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13 }}>Envoyer</button>
                </div>
              </div>
            )}

            {/* RENDEZ-VOUS */}
            {recordTab === "rdv" && (
              <div>
                {/* Add appointment form */}
                {canScheduleAppt && (
                  <div style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
                    <button onClick={() => setShowApptForm(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "none", border: "none", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CalendarPlus size={14} color="#B9873F" />
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, color: "#B9873F" }}>Planifier un rendez-vous</span>
                      </div>
                      {showApptForm ? <ChevronUp size={14} color="#5A756F" /> : <ChevronDown size={14} color="#5A756F" />}
                    </button>
                    {showApptForm && (
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F4F7F6" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>TITRE DU RDV</label>
                            <input value={apptForm.title} onChange={e => setApptForm(f => ({ ...f, title: e.target.value }))} placeholder="ex: Contrôle post-CABG J+7" style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>TYPE</label>
                            <select value={apptForm.type} onChange={e => setApptForm(f => ({ ...f, type: e.target.value as Appointment["type"] }))} style={inputStyle}>
                              {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>DATE</label>
                            <input type="date" value={apptForm.date} onChange={e => setApptForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>HEURE</label>
                            <input type="time" value={apptForm.time} onChange={e => setApptForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>MÉDECIN</label>
                            <select value={apptForm.doctorId} onChange={e => { const s = STAFF_SEED.find(x => x.id === e.target.value); setApptForm(f => ({ ...f, doctorId: e.target.value, doctorName: s?.name ?? "" })); }} style={inputStyle}>
                              {STAFF_SEED.filter(s => ["cardiologist","physician"].includes(s.role)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>LIEU</label>
                            <input value={apptForm.location} onChange={e => setApptForm(f => ({ ...f, location: e.target.value }))} placeholder="ex: Cardio · Bureau 204" style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>NOTES / INSTRUCTIONS</label>
                          <textarea value={apptForm.notes} onChange={e => setApptForm(f => ({ ...f, notes: e.target.value }))} placeholder="Instructions de préparation, consignes particulières..." rows={2} style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.5 }} />
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
                          <button onClick={() => setShowApptForm(false)} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 16px", cursor: "pointer", color: "#5A756F", fontSize: 13 }}>Annuler</button>
                          <button onClick={addAppt} disabled={!apptForm.title || !apptForm.date || !apptForm.time} style={{ background: "#B9873F", color: "#fff", border: "none", borderRadius: 7, padding: "8px 20px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, opacity: !apptForm.title || !apptForm.date || !apptForm.time ? 0.5 : 1 }}>
                            <CalendarPlus size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />Confirmer le RDV
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Appointments list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {appts.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#5A756F", fontSize: 13 }}>Aucun rendez-vous planifié.</div>}
                  {appts.sort((a, b) => a.date.localeCompare(b.date)).map(appt => {
                    const tc = TYPE_CFG[appt.type];
                    const statusColors: Record<string, { c: string; bg: string }> = { scheduled: { c: "#B9873F", bg: "#FDF3E3" }, confirmed: { c: "#16605A", bg: "#E3EEEC" }, done: { c: "#5A756F", bg: "#F4F7F6" }, cancelled: { c: "#D6452F", bg: "#FBEAE6" } };
                    const sc = statusColors[appt.status] ?? statusColors.scheduled;
                    const doctor = STAFF_SEED.find(s => s.id === appt.doctorId);
                    const dStatus = doctor ? STAFF_STATUS_CFG[doctor.status] : null;
                    return (
                      <div key={appt.id} style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                        {/* Date block */}
                        <div style={{ textAlign: "center", minWidth: 52, background: "#F4F7F6", borderRadius: 8, padding: "8px 0" }}>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5A756F" }}>{appt.date.split("-")[1]}/{appt.date.split("-")[0].slice(2)}</div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700, color: "#0F312D", lineHeight: 1 }}>{appt.date.split("-")[2]}</div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5A756F", marginTop: 2 }}>{appt.time}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "#0F312D" }}>{appt.title}</span>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, padding: "2px 7px", borderRadius: 4, background: tc.bg, color: tc.color }}>{tc.label}</span>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, padding: "2px 7px", borderRadius: 4, background: sc.bg, color: sc.c }}>{appt.status}</span>
                          </div>
                          <div style={{ display: "flex", gap: 14, marginBottom: 5 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#5A756F" }}>
                              <MapPin size={11} />{appt.location || "—"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#5A756F" }}>
                              <Clock size={11} />{appt.duration} min
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#33534E" }}>
                              <Stethoscope size={11} color="#16605A" />{appt.doctorName}
                            </div>
                            {dStatus && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: dStatus.dot }} />
                                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: dStatus.color }}>{dStatus.label}</span>
                              </div>
                            )}
                          </div>
                          {appt.notes && <div style={{ marginTop: 6, fontSize: 12, color: "#5A756F", background: "#F4F7F6", borderRadius: 6, padding: "6px 10px" }}>{appt.notes}</div>}
                        </div>
                        {/* Cancel button */}
                        {appt.status !== "done" && appt.status !== "cancelled" && canScheduleAppt && (
                          <button onClick={() => setApptsByPatient(prev => ({ ...prev, [selectedId]: (prev[selectedId] ?? []).map(a => a.id === appt.id ? { ...a, status: "cancelled" as const } : a) }))}
                            style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 6, padding: "5px 10px", cursor: "pointer", color: "#D6452F", fontSize: 11 }}>Annuler</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── Call / Locate modal ───────────────────────────────────────────────── */}
      {callModal && callPatient && callRec && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: 540, maxWidth: "95vw", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>
            {/* Modal header */}
            <div style={{ background: callStatus === "connected" ? "#16605A" : callStatus === "calling" ? "#0F312D" : callStatus === "ended" ? "#5A756F" : "#0F312D", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {callStatus === "calling" ? <PhoneCall size={20} color="#fff" /> : callStatus === "connected" ? <HeartPulse size={20} color="#fff" /> : <PhoneOff size={20} color="#fff" />}
                </div>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>{callPatient.name}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: "0.08em", marginTop: 2 }}>
                    {callStatus === "calling" ? "Connexion en cours..." : callStatus === "connected" ? "✓ CONNECTÉ · Monitoring actif" : callStatus === "ended" ? "Appel terminé" : ""}
                    {" · "}{callRec.emergencyPhone}
                  </div>
                </div>
              </div>
              <button onClick={() => { setCallModal(null); setCallStatus("idle"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}><X size={20} /></button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Live vitals during call */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
                {[
                  { l: "SpO₂", v: `${callPatient.spo2.toFixed(0)}%`, c: callPatient.spo2 < 90 ? "#D6452F" : "#16605A", sub: "Saturation O₂" },
                  { l: "FC", v: `${callPatient.hr} bpm`, c: callPatient.hr > 110 ? "#D6452F" : "#0F312D", sub: "Fréq. cardiaque" },
                  { l: "TA", v: `${callPatient.bpSys}/${callPatient.bpDia}`, c: "#0F312D", sub: "Tension art." },
                ].map(({ l, v, c, sub }) => (
                  <div key={l} style={{ background: "#F4F7F6", borderRadius: 9, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#5A756F", marginTop: 4, letterSpacing: "0.08em" }}>{sub}</div>
                    {callStatus === "connected" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16605A", margin: "5px auto 0", animation: "pulse 1.5s infinite" }} />}
                  </div>
                ))}
              </div>

              {/* Patient location */}
              <div style={{ background: "#E3EEEC", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#16605A", letterSpacing: "0.10em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase" }}>
                  <MapPin size={11} /> Localisation GPS du patient
                </div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "#0F312D", marginBottom: 3 }}>{callRec.address}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#16605A" }}>
                  {callRec.gpsLat.toFixed(5)}°N, {Math.abs(callRec.gpsLng).toFixed(5)}°W
                </div>
                {/* Simulated map tile */}
                <div style={{ marginTop: 10, height: 90, background: "linear-gradient(135deg,#c8e6c9 0%,#a5d6a7 30%,#81c784 60%,#66bb6a 100%)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(255,255,255,0.25) 18px,rgba(255,255,255,0.25) 19px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,0.25) 28px,rgba(255,255,255,0.25) 29px)" }} />
                  <div style={{ position: "relative", textAlign: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50% 50% 50% 0", background: "#D6452F", border: "2px solid #fff", margin: "0 auto 4px", transform: "rotate(-45deg)" }} />
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, background: "rgba(255,255,255,0.9)", padding: "2px 7px", borderRadius: 4, color: "#0F312D" }}>GPS EN DIRECT</div>
                  </div>
                </div>
              </div>

              {/* Contact & condition */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                <div style={{ background: "#F4F7F6", borderRadius: 9, padding: "10px 14px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", marginBottom: 4, textTransform: "uppercase" }}>Contact d'urgence</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F312D" }}>{callRec.emergencyContact}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#16605A" }}>{callRec.emergencyPhone}</div>
                </div>
                <div style={{ background: "#F4F7F6", borderRadius: 9, padding: "10px 14px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#5A756F", marginBottom: 4, textTransform: "uppercase" }}>Condition / Allergies</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F312D" }}>{callPatient.condition}</div>
                  {callRec.allergies.length > 0 && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#D6452F" }}>⚠ {callRec.allergies.join(", ")}</div>}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                {callStatus !== "ended" && (
                  <button onClick={endCall} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#D6452F", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
                    <PhoneOff size={16} /> Terminer l'appel
                  </button>
                )}
                <button onClick={() => { setCallModal(null); setCallStatus("idle"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#F4F7F6", color: "#0F312D", border: "1px solid #D9E2DF", borderRadius: 8, padding: "12px 0", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>
                  <X size={16} /> Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Staff Status Editor ──────────────────────────────────────────────────────
function StaffStatusEditor({ staff, onSave, onCancel, canEdit }: {
  staff: StaffMember; onSave: (s: StaffStatusKey, note: string) => void; onCancel: () => void; canEdit: boolean;
}) {
  const [st, setSt] = useState<StaffStatusKey>(staff.status);
  const [note, setNote] = useState(staff.statusNote);
  if (!canEdit) return null;
  return (
    <div style={{ background: "#F4F7F6", borderRadius: 8, padding: 10 }}>
      <select value={st} onChange={e => setSt(e.target.value as StaffStatusKey)} style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 5, padding: "5px 8px", fontSize: 12, background: "#fff", marginBottom: 6, color: "#0F312D", outline: "none" }}>
        {Object.entries(STAFF_STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note de statut (optionnel)" style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 5, padding: "5px 8px", fontSize: 11.5, background: "#fff", marginBottom: 6, color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
      <div style={{ display: "flex", gap: 5 }}>
        <button onClick={() => onSave(st, note)} style={{ flex: 1, background: "#0F312D", color: "#fff", border: "none", borderRadius: 5, padding: "5px 0", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Mettre à jour</button>
        <button onClick={onCancel} style={{ background: "none", border: "1px solid #D9E2DF", borderRadius: 5, padding: "5px 10px", cursor: "pointer", fontSize: 11, color: "#5A756F" }}>✕</button>
      </div>
    </div>
  );
}

