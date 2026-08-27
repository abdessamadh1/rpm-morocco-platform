import { useState } from "react";
import {
  X, Check, Phone, PhoneCall, Calendar, CalendarPlus, Stethoscope,
  HeartPulse, ClipboardList, ChevronLeft, ChevronRight, ChevronDown,
  UserCheck, UserX, Edit3, Clock, MapPin, Users, AlertCircle, Filter,
  Navigation, FileText, Shield, Radio, Bell, BellOff
} from "lucide-react";
import {
  LoggedUser, StaffMember, StaffStatusKey, CalendarEvent, CalEventType,
  SEED, STAFF_SEED, CAL_EVENTS, STAFF_STATUS_CFG, ROLE_CAL_COLOR,
  CAL_TYPE_CFG, SPECIALTY_LABELS, ROLE_SCREENS,
  getMonday, addDays, toYMD, today, todayYMD, thisMonday,
} from "./shared";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00–20:00
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

// ─── Staff Profile Modal ──────────────────────────────────────────────────────
const PERMISSION_FEATURES = [
  { key: "dashboard",  label: "Nurse Dashboard" },
  { key: "alerts",     label: "Risk & Alertes" },
  { key: "records",    label: "Dossiers Patients" },
  { key: "calendar",   label: "Calendrier" },
  { key: "devices",    label: "Devices & Accès" },
  { key: "calculator", label: "ROI Calculator" },
  { key: "landing",    label: "Platform Overview" },
];

export function StaffProfileModal({ staffId, currentUser, onClose, onNavigateToPatient }: {
  staffId: string;
  currentUser: LoggedUser;
  onClose: () => void;
  onNavigateToPatient: (id: string) => void;
}) {
  const member = STAFF_SEED.find(s => s.id === staffId);
  if (!member) return null;

  const sCfg = STAFF_STATUS_CFG[member.status];
  const clr  = ROLE_CAL_COLOR[member.role] ?? ROLE_CAL_COLOR["physician"];
  const initials = member.name.replace("Dr. ","").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const allowedScreens = ROLE_SCREENS[member.role] ?? [];
  const isAdmin = currentUser.role === "admin";

  const [editPerms, setEditPerms] = useState(false);
  const [permScreens, setPermScreens] = useState<string[]>(allowedScreens);

  const togglePerm = (key: string) => {
    setPermScreens(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const currentPatient = member.currentPatient ? SEED.find(p => p.id === member.currentPatient) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.55)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 480, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 28px 70px rgba(15,49,45,0.3)" }}>
        {/* Header banner */}
        <div style={{ background: clr.bg, padding: "28px 28px 24px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><X size={15} /></button>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Avatar */}
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: "#fff" }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 4 }}>{member.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>{SPECIALTY_LABELS[member.specialty] ?? member.specialty}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: sCfg.dot }} />
                <span style={{ fontSize: 11.5, color: "#fff", fontWeight: 600 }}>{sCfg.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "0 28px 28px" }}>
          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20, marginBottom: 20 }}>
            {[
              { label: "Clinique",      value: member.clinic },
              { label: "Rôle système",  value: member.role.charAt(0).toUpperCase() + member.role.slice(1) },
              { label: "Téléphone",     value: member.phone },
              { label: "Pager",         value: `📟 ${member.pager}` },
              { label: "Spécialité",    value: SPECIALTY_LABELS[member.specialty] ?? member.specialty },
              { label: "Note de statut",value: member.statusNote },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#F4F7F6", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F312D" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Current patient */}
          {currentPatient && (
            <div style={{ background: "#FBEAE6", border: "1px solid #D6452F30", borderRadius: 9, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#D6452F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Patient en cours</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0F312D" }}>{currentPatient.name}</div>
                  <div style={{ fontSize: 12, color: "#5A756F" }}>{currentPatient.condition} · {currentPatient.ward}</div>
                </div>
                <button onClick={() => { onNavigateToPatient(currentPatient.id); onClose(); }}
                  style={{ background: "#0F312D", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11.5, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 }}>
                  Voir dossier
                </button>
              </div>
            </div>
          )}

          {/* Badge / card */}
          <div style={{ border: `2px solid ${clr.bg}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20, background: "#FAFFFE" }}>
            <div style={{ fontSize: 10, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Badge d'identification</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: clr.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 15, color: clr.text }}>{initials}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, color: "#0F312D" }}>{member.name}</div>
                <div style={{ fontSize: 11, color: "#5A756F" }}>{member.id} · {member.clinic}</div>
              </div>
              <div style={{ background: clr.bg, color: clr.text, fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", padding: "3px 8px", borderRadius: 4, letterSpacing: "0.08em", fontWeight: 700 }}>{member.role.toUpperCase()}</div>
            </div>
          </div>

          {/* Admin permissions panel */}
          {isAdmin && (
            <div style={{ border: "1px solid #D9E2DF", borderRadius: 10, overflow: "hidden", marginBottom: 4 }}>
              <div style={{ background: "#0F312D", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Shield size={13} color="#B9873F" />
                  <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 12, color: "#fff" }}>Gestion des autorisations</span>
                </div>
                <button onClick={() => setEditPerms(!editPerms)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", color: "#fff", fontSize: 11, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  {editPerms ? "Annuler" : "Modifier"}
                </button>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "#5A756F", marginBottom: 10 }}>Accès aux modules de la plateforme:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {PERMISSION_FEATURES.map(f => {
                    const has = permScreens.includes(f.key);
                    return (
                      <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 7, background: has ? "#E3EEEC" : "#F4F7F6" }}>
                        <span style={{ fontSize: 12.5, color: "#0F312D", fontWeight: has ? 600 : 400 }}>{f.label}</span>
                        {editPerms ? (
                          <button onClick={() => togglePerm(f.key)} style={{ background: has ? "#16605A" : "#D9E2DF", border: "none", borderRadius: 12, width: 36, height: 20, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: has ? 18 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: has ? "#16605A" : "#9AADA8", fontWeight: 600 }}>{has ? "✓ Autorisé" : "— Restreint"}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {editPerms && (
                  <button onClick={() => setEditPerms(false)} style={{ marginTop: 12, width: "100%", background: "#16605A", color: "#fff", border: "none", borderRadius: 7, padding: "9px 0", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 12.5 }}>
                    Enregistrer les autorisations
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Screen ──────────────────────────────────────────────────────────

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function CalendarScreen({ currentUser, onNavigateToPatient, onOpenProfile }: {
  currentUser: LoggedUser;
  onNavigateToPatient: (id: string) => void;
  onOpenProfile: (staffId: string) => void;
}) {
  const [weekStart, setWeekStart] = useState<Date>(getMonday(today));
  const [events, setEvents] = useState<CalendarEvent[]>(CAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTeamPage, setShowTeamPage] = useState(false);
  const [teamPageMsg, setTeamPageMsg] = useState("");
  const [teamPageSent, setTeamPageSent] = useState(false);
  const [internalProfileId, setInternalProfileId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    type: "consultation" as CalEventType,
    title: "",
    patientId: "",
    doctorId: "",
    date: todayYMD,
    startTime: "09:00",
    endTime: "09:45",
    roomType: "consultation" as CalendarEvent["roomType"],
    roomNumber: "",
    clinic: currentUser.clinic,
    notes: "",
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = `${weekDays[0].getDate()} ${MONTHS_FR[weekDays[0].getMonth()]} — ${weekDays[6].getDate()} ${MONTHS_FR[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;
  const canAdd = ["nurse","cardiologist","physician","admin"].includes(currentUser.role);

  const eventsForDay = (ymd: string) => events.filter(e => e.date === ymd);

  const getEventStyle = (e: CalendarEvent, dayEvents: CalendarEvent[]) => {
    const startM = timeToMins(e.startTime) - 7 * 60;
    const endM   = timeToMins(e.endTime)   - 7 * 60;
    const totalH = 13 * 60;
    const top    = (startM / totalH) * 100;
    const height = Math.max(4, (endM - startM) / totalH * 100);
    const raw = ROLE_CAL_COLOR[e.addedByRole] ?? ROLE_CAL_COLOR["physician"];
    // For event blocks: light pastel bg, solid color as border+text
    const clr = { bg: raw.light, border: raw.bg, text: raw.bg };
    return { top: `${top}%`, height: `${height}%`, clr };
  };

  const handleAdd = () => {
    if (!addForm.title || !addForm.doctorId || !addForm.date) return;
    const doc = STAFF_SEED.find(s => s.id === addForm.doctorId);
    const pat = SEED.find(p => p.id === addForm.patientId);
    const newEv: CalendarEvent = {
      id: `CE-${Date.now()}`,
      type: addForm.type,
      title: addForm.title,
      patientId: addForm.patientId || undefined,
      patientName: pat?.name,
      doctorId: addForm.doctorId,
      doctorName: doc?.name ?? addForm.doctorId,
      teamIds: [],
      addedById: currentUser.id,
      addedByName: currentUser.name,
      addedByRole: currentUser.role,
      date: addForm.date,
      startTime: addForm.startTime,
      endTime: addForm.endTime,
      roomType: addForm.roomType,
      roomNumber: addForm.roomNumber,
      clinic: addForm.clinic,
      notes: addForm.notes,
      status: "scheduled",
    };
    CAL_EVENTS.push(newEv);
    setEvents([...CAL_EVENTS]);
    setShowAddForm(false);
    setAddForm({ type: "consultation", title: "", patientId: "", doctorId: "", date: todayYMD, startTime: "09:00", endTime: "09:45", roomType: "consultation", roomNumber: "", clinic: currentUser.clinic, notes: "" });
  };

  const statusColor: Record<CalendarEvent["status"], string> = {
    scheduled: "#B9873F", confirmed: "#16605A", in_progress: "#D6452F", done: "#5A756F", cancelled: "#C0CECA",
  };

  const openProfile = (staffId: string) => { setInternalProfileId(staffId); onOpenProfile(staffId); };

  return (
    <div style={{ paddingTop: 52, minHeight: "100vh", background: "#F4F7F6" }}>
      {/* Profile modal rendered at highest z-index so it sits above event modal */}
      {internalProfileId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900 }}>
          <StaffProfileModal
            staffId={internalProfileId}
            currentUser={currentUser}
            onClose={() => setInternalProfileId(null)}
            onNavigateToPatient={id => { onNavigateToPatient(id); setInternalProfileId(null); setSelectedEvent(null); }}
          />
        </div>
      )}
      {/* Team page modal */}
      {showTeamPage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.55)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 440, overflow: "hidden", boxShadow: "0 24px 64px rgba(15,49,45,0.28)" }}>
            <div style={{ background: "#0F312D", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Users size={14} color="#B9873F" />
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Convoquer l'équipe</span>
              </div>
              <button onClick={() => { setShowTeamPage(false); setTeamPageSent(false); setTeamPageMsg(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24 }}>
              {teamPageSent ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📟</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: "#16605A", marginBottom: 6 }}>Pager envoyé à toute l'équipe</div>
                  <div style={{ fontSize: 12, color: "#5A756F" }}>{STAFF_SEED.length} membres notifiés · réponse sous 5 min</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Membres qui seront notifiés</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {STAFF_SEED.map(s => {
                        const sc = STAFF_STATUS_CFG[s.status];
                        return (
                          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "#F4F7F6", borderRadius: 7 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot }} />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F312D", flex: 1 }}>{s.name}</span>
                            <span style={{ fontSize: 10.5, color: sc.color }}>{sc.label}</span>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#9AADA8" }}>📟 {s.pager}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <textarea
                    value={teamPageMsg}
                    onChange={e => setTeamPageMsg(e.target.value)}
                    placeholder="Message de convocation (objet de la réunion, salle, heure...)"
                    rows={3}
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", color: "#0F312D", background: "#F4F7F6", resize: "none", boxSizing: "border-box", outline: "none", marginBottom: 14 }}
                  />
                  <button onClick={() => setTeamPageSent(true)} disabled={!teamPageMsg.trim()}
                    style={{ width: "100%", background: teamPageMsg.trim() ? "#B9873F" : "#D9E2DF", color: teamPageMsg.trim() ? "#fff" : "#9AADA8", border: "none", borderRadius: 8, padding: "11px 0", cursor: teamPageMsg.trim() ? "pointer" : "not-allowed", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13 }}>
                    📟 Envoyer pager à toute l'équipe ({STAFF_SEED.length} personnes)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.55)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedEvent(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 460, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(15,49,45,0.28)" }}>
            {(() => {
              const ev = selectedEvent;
              const clr = ROLE_CAL_COLOR[ev.addedByRole] ?? ROLE_CAL_COLOR["physician"];
              const typeCfg = CAL_TYPE_CFG[ev.type];
              const team = ev.teamIds.map(id => STAFF_SEED.find(s => s.id === id)).filter(Boolean) as StaffMember[];
              const doc = STAFF_SEED.find(s => s.id === ev.doctorId);
              return (
                <>
                  <div style={{ background: clr.bg, padding: "18px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{typeCfg.icon}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.3)", color: clr.text, letterSpacing: "0.07em" }}>{typeCfg.label.toUpperCase()}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.3)", color: clr.text, fontWeight: 700 }}>● {ev.status.toUpperCase()}</span>
                      </div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: clr.text }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: `${clr.text}CC`, marginTop: 3 }}>{ev.date} · {ev.startTime} — {ev.endTime}</div>
                    </div>
                    <button onClick={() => setSelectedEvent(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: clr.text, flexShrink: 0 }}><X size={14} /></button>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1, padding: "20px 22px" }}>
                    {/* Location */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                      <div style={{ flex: 1, background: "#F4F7F6", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>Salle / Lieu</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F312D" }}>{ev.roomNumber}</div>
                        <div style={{ fontSize: 11, color: "#5A756F" }}>{ev.roomType} · {ev.clinic}</div>
                      </div>
                      <div style={{ flex: 1, background: "#F4F7F6", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>Durée</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F312D" }}>{timeToMins(ev.endTime) - timeToMins(ev.startTime)} min</div>
                        <div style={{ fontSize: 11, color: "#5A756F" }}>{ev.startTime} → {ev.endTime}</div>
                      </div>
                    </div>

                    {/* Patient */}
                    {ev.patientId && ev.patientName && (
                      <div style={{ background: "#FBEAE6", border: "1px solid #D6452F20", borderRadius: 9, padding: "12px 16px", marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "#D6452F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Patient</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#0F312D" }}>{ev.patientName}</div>
                            <div style={{ fontSize: 12, color: "#5A756F" }}>{ev.patientId} · {SEED.find(p => p.id === ev.patientId)?.condition}</div>
                          </div>
                          <button onClick={() => { onNavigateToPatient(ev.patientId!); setSelectedEvent(null); }}
                            style={{ background: "#D6452F", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11.5, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                            <FileText size={11} /> Dossier
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Doctor */}
                    {doc && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Médecin responsable</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#F4F7F6", borderRadius: 9 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: ROLE_CAL_COLOR[doc.role]?.bg ?? "#E3EEEC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 12, color: ROLE_CAL_COLOR[doc.role]?.text ?? "#fff" }}>
                              {doc.name.replace("Dr. ","").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                            </span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <button onClick={() => setInternalProfileId(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 700, fontSize: 13, color: "#16605A", textDecoration: "underline", textDecorationColor: "#16605A50", fontFamily: "'IBM Plex Sans', sans-serif" }}>{doc.name}</button>
                            <div style={{ fontSize: 11, color: "#5A756F" }}>{SPECIALTY_LABELS[doc.specialty] ?? doc.specialty}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10.5, color: STAFF_STATUS_CFG[doc.status].color, fontWeight: 600 }}>{STAFF_STATUS_CFG[doc.status].label}</div>
                            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#9AADA8" }}>📟 {doc.pager}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Team */}
                    {team.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Équipe ({team.length})</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {team.map(s => {
                            const sc = STAFF_STATUS_CFG[s.status];
                            return (
                              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#F4F7F6", borderRadius: 8 }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                                <button onClick={() => setInternalProfileId(s.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600, fontSize: 12.5, color: "#16605A", textDecoration: "underline", textDecorationColor: "#16605A50", fontFamily: "'IBM Plex Sans', sans-serif" }}>{s.name}</button>
                                <span style={{ fontSize: 11, color: "#5A756F", flex: 1 }}>{SPECIALTY_LABELS[s.specialty] ?? s.specialty}</span>
                                <span style={{ fontSize: 10, color: sc.color, fontWeight: 600 }}>{sc.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Added by */}
                    <div style={{ background: "#F4F7F6", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                      <div style={{ fontSize: 10, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>Ajouté par</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ROLE_CAL_COLOR[ev.addedByRole]?.bg ?? "#16605A" }} />
                        <span style={{ fontWeight: 600, fontSize: 12.5, color: "#0F312D" }}>{ev.addedByName}</span>
                        <span style={{ fontSize: 11, color: "#5A756F" }}>({ev.addedByRole})</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {ev.notes && (
                      <div style={{ background: "#F4F7F6", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Notes</div>
                        <div style={{ fontSize: 13, color: "#0F312D", lineHeight: 1.5 }}>{ev.notes}</div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add event form */}
      {showAddForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,49,45,0.55)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 500, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(15,49,45,0.28)" }}>
            <div style={{ background: "#0F312D", padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <CalendarPlus size={15} color="#B9873F" />
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Ajouter un événement</span>
              </div>
              <button onClick={() => setShowAddForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={16} /></button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: 22 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Type */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Type</label>
                  <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value as CalEventType }))}
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }}>
                    {(Object.keys(CAL_TYPE_CFG) as CalEventType[]).map(t => <option key={t} value={t}>{CAL_TYPE_CFG[t].icon} {CAL_TYPE_CFG[t].label}</option>)}
                  </select>
                </div>
                {/* Title */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Titre</label>
                  <input value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Consultation cardio post-op"
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                </div>
                {/* Patient */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Patient (optionnel)</label>
                  <select value={addForm.patientId} onChange={e => setAddForm(f => ({ ...f, patientId: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }}>
                    <option value="">— Aucun patient —</option>
                    {SEED.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                  </select>
                </div>
                {/* Doctor */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Médecin responsable</label>
                  <select value={addForm.doctorId} onChange={e => setAddForm(f => ({ ...f, doctorId: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none" }}>
                    <option value="">— Choisir un médecin —</option>
                    {STAFF_SEED.filter(s => ["cardiologist","physician"].includes(s.role)).map(s => <option key={s.id} value={s.id}>{s.name} · {SPECIALTY_LABELS[s.specialty]}</option>)}
                  </select>
                </div>
                {/* Date */}
                <div>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Date</label>
                  <input type="date" value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                </div>
                {/* Room number */}
                <div>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Salle / Numéro</label>
                  <input value={addForm.roomNumber} onChange={e => setAddForm(f => ({ ...f, roomNumber: e.target.value }))} placeholder="Ex: Salle 3, Bloc 2, Réa 1"
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                </div>
                {/* Start time */}
                <div>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Début</label>
                  <input type="time" value={addForm.startTime} onChange={e => setAddForm(f => ({ ...f, startTime: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                </div>
                {/* End time */}
                <div>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Fin</label>
                  <input type="time" value={addForm.endTime} onChange={e => setAddForm(f => ({ ...f, endTime: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none", boxSizing: "border-box" }} />
                </div>
                {/* Notes */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, color: "#5A756F", letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Notes</label>
                  <textarea value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Instructions, contexte clinique..."
                    style={{ width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6", color: "#0F312D", outline: "none", resize: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <button onClick={handleAdd} disabled={!addForm.title || !addForm.doctorId}
                style={{ marginTop: 16, width: "100%", background: addForm.title && addForm.doctorId ? "#16605A" : "#D9E2DF", color: addForm.title && addForm.doctorId ? "#fff" : "#9AADA8", border: "none", borderRadius: 8, padding: "12px 0", cursor: addForm.title && addForm.doctorId ? "pointer" : "not-allowed", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13.5 }}>
                Ajouter au calendrier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main calendar layout */}
      <div style={{ padding: "20px 24px" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
            <button onClick={() => setWeekStart(addDays(weekStart, -7))} style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: "6px 0 0 6px", padding: "7px 13px", cursor: "pointer", color: "#5A756F" }}>‹</button>
            <button onClick={() => setWeekStart(getMonday(today))} style={{ background: "#fff", border: "1px solid #D9E2DF", borderLeft: "none", borderRight: "none", padding: "7px 14px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#0F312D", fontWeight: 600 }}>Auj.</button>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))} style={{ background: "#fff", border: "1px solid #D9E2DF", borderRadius: "0 6px 6px 0", padding: "7px 13px", cursor: "pointer", color: "#5A756F" }}>›</button>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F312D" }}>{weekLabel}</span>
          <div style={{ flex: 1 }} />
          {/* Legend */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {[["nurse","Infirmier"],["cardiologist","Cardio"],["physician","Médecin"],["admin","Admin"]].map(([role, lbl]) => (
              <div key={role} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: ROLE_CAL_COLOR[role]?.bg ?? "#16605A" }} />
                <span style={{ fontSize: 11, color: "#5A756F" }}>{lbl}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowTeamPage(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#FDF3E3", color: "#B9873F", border: "1px solid #B9873F40", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12 }}>
            <Users size={13} /> Page équipe
          </button>
          {canAdd && (
            <button onClick={() => setShowAddForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#16605A", color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12 }}>
              <CalendarPlus size={13} /> Ajouter
            </button>
          )}
        </div>

        {/* Week grid */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #D9E2DF", overflow: "hidden" }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", borderBottom: "2px solid #D9E2DF" }}>
            <div style={{ padding: "10px 0", background: "#F4F7F6" }} />
            {weekDays.map((d, i) => {
              const isToday = toYMD(d) === todayYMD;
              return (
                <div key={i} style={{ padding: "10px 8px", textAlign: "center", background: isToday ? "#E3EEEC" : "#F4F7F6", borderLeft: "1px solid #D9E2DF" }}>
                  <div style={{ fontSize: 11, color: isToday ? "#16605A" : "#5A756F", fontWeight: 600, letterSpacing: "0.05em" }}>{DAYS_FR[i]}</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: isToday ? "#16605A" : "#0F312D", lineHeight: 1.1 }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", overflowY: "auto", maxHeight: "calc(100vh - 260px)" }}>
            {/* Hour labels */}
            <div style={{ position: "relative" }}>
              {HOURS.map(h => (
                <div key={h} style={{ height: 60, borderBottom: "1px solid #EEF1F0", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 3 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#9AADA8", letterSpacing: "0.05em" }}>{String(h).padStart(2,"0")}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((d, di) => {
              const ymd = toYMD(d);
              const isToday = ymd === todayYMD;
              const dayEvs = eventsForDay(ymd);
              return (
                <div key={di} style={{ position: "relative", borderLeft: "1px solid #D9E2DF", background: isToday ? "#FAFFFE" : "#fff" }}>
                  {/* Hour grid lines */}
                  {HOURS.map(h => (
                    <div key={h} style={{ height: 60, borderBottom: "1px solid #F0F3F2" }} />
                  ))}
                  {/* Events absolutely positioned */}
                  {dayEvs.map(ev => {
                    const { top, height, clr } = getEventStyle(ev, dayEvs);
                    const mins = timeToMins(ev.endTime) - timeToMins(ev.startTime);
                    return (
                      <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                        style={{
                          position: "absolute", left: 2, right: 2, top, height,
                          background: clr.bg, borderLeft: `3px solid ${clr.border}`,
                          borderRadius: 5, cursor: "pointer", textAlign: "left",
                          padding: "3px 6px", overflow: "hidden",
                          border: `1px solid ${clr.border}30`, borderLeftWidth: 3,
                          boxShadow: "0 1px 4px rgba(15,49,45,0.08)",
                        }}>
                        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 10.5, color: clr.border, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {CAL_TYPE_CFG[ev.type].icon} {ev.title}
                        </div>
                        {mins >= 30 && (
                          <div style={{ fontSize: 9.5, color: `${clr.border}CC`, fontFamily: "'IBM Plex Mono', monospace", marginTop: 1 }}>
                            {ev.startTime}–{ev.endTime}
                          </div>
                        )}
                        {mins >= 45 && ev.roomNumber && (
                          <div style={{ fontSize: 9, color: `${clr.border}AA`, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            📍 {ev.roomNumber}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
