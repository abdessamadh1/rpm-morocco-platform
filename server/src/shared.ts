// ─── Types ────────────────────────────────────────────────────────────────────
export type Screen = "landing" | "dashboard" | "calculator" | "devices" | "alerts" | "records" | "calendar";
export interface SparkPoint { v: number; i: number; }
export interface Patient {
  id: string; name: string; age: number; condition: string; ward: string;
  spo2: number; hr: number; bpSys: number; bpDia: number;
  alert: boolean; alertType: string; acknowledged: boolean;
  spo2Data: SparkPoint[]; hrData: SparkPoint[]; bpData: SparkPoint[];
  thresholdSpo2: number; thresholdHrHigh: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const genSpark = (base: number, variance: number): SparkPoint[] =>
  Array.from({ length: 24 }, (_, i) => ({
    v: Math.max(50, Math.min(200, base + (Math.random() - 0.5) * variance * 2)),
    i,
  }));

export const pushSpark = (arr: SparkPoint[], next: number): SparkPoint[] =>
  [...arr.slice(1), { v: next, i: arr[arr.length - 1].i + 1 }];

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ─── Mock patients ─────────────────────────────────────────────────────────────
export const SEED: Patient[] = [
  { id: "P-001", name: "Mohammed Al-Fassi", age: 67, condition: "Post CABG", ward: "Cardio", spo2: 97, hr: 72, bpSys: 128, bpDia: 82, alert: false, alertType: "", acknowledged: false, spo2Data: genSpark(97, 1.2), hrData: genSpark(72, 6), bpData: genSpark(128, 5), thresholdSpo2: 90, thresholdHrHigh: 110 },
  { id: "P-002", name: "Fatima Benali", age: 54, condition: "Post valve repair", ward: "Cardio", spo2: 87, hr: 124, bpSys: 149, bpDia: 96, alert: true, alertType: "SpO₂ CRITICAL", acknowledged: false, spo2Data: genSpark(87, 2), hrData: genSpark(124, 9), bpData: genSpark(149, 8), thresholdSpo2: 90, thresholdHrHigh: 110 },
  { id: "P-003", name: "Youssef Chakir", age: 71, condition: "Post hip replacement", ward: "Ortho", spo2: 95, hr: 84, bpSys: 134, bpDia: 86, alert: false, alertType: "", acknowledged: false, spo2Data: genSpark(95, 1.8), hrData: genSpark(84, 6), bpData: genSpark(134, 7), thresholdSpo2: 90, thresholdHrHigh: 115 },
  { id: "P-004", name: "Amina Tazi", age: 62, condition: "Post coronary stent", ward: "Cardio", spo2: 96, hr: 74, bpSys: 118, bpDia: 76, alert: false, alertType: "", acknowledged: false, spo2Data: genSpark(96, 1.5), hrData: genSpark(74, 7), bpData: genSpark(118, 5), thresholdSpo2: 90, thresholdHrHigh: 110 },
  { id: "P-005", name: "Omar Idrissi", age: 58, condition: "Post lung resection", ward: "Thoracic", spo2: 92, hr: 96, bpSys: 138, bpDia: 90, alert: false, alertType: "", acknowledged: false, spo2Data: genSpark(92, 2.2), hrData: genSpark(96, 8), bpData: genSpark(138, 9), thresholdSpo2: 90, thresholdHrHigh: 110 },
  { id: "P-006", name: "Khadija Mansouri", age: 69, condition: "Post CABG", ward: "Cardio", spo2: 96, hr: 68, bpSys: 122, bpDia: 78, alert: false, alertType: "", acknowledged: false, spo2Data: genSpark(96, 1.4), hrData: genSpark(68, 5), bpData: genSpark(122, 6), thresholdSpo2: 90, thresholdHrHigh: 110 },
  { id: "P-007", name: "Hassan Berrada", age: 73, condition: "Post bowel resection", ward: "Surgical", spo2: 93, hr: 128, bpSys: 156, bpDia: 99, alert: true, alertType: "HR ELEVATED", acknowledged: false, spo2Data: genSpark(93, 2), hrData: genSpark(128, 11), bpData: genSpark(156, 12), thresholdSpo2: 90, thresholdHrHigh: 110 },
  { id: "P-008", name: "Nadia El-Alaoui", age: 48, condition: "Post appendectomy", ward: "Surgical", spo2: 98, hr: 79, bpSys: 120, bpDia: 74, alert: false, alertType: "", acknowledged: false, spo2Data: genSpark(98, 0.9), hrData: genSpark(79, 5), bpData: genSpark(120, 5), thresholdSpo2: 90, thresholdHrHigh: 110 },
  { id: "P-009", name: "Rachid Ouazzani", age: 60, condition: "Post aortic stent", ward: "Vascular", spo2: 94, hr: 81, bpSys: 130, bpDia: 85, alert: false, alertType: "", acknowledged: false, spo2Data: genSpark(94, 1.6), hrData: genSpark(81, 6), bpData: genSpark(130, 7), thresholdSpo2: 90, thresholdHrHigh: 110 },
];

// ─── Auth types & risk utils ──────────────────────────────────────────────────
export type RiskLevel = "stable" | "nurse" | "high" | "extreme";

export interface LoggedUser {
  id: string; name: string;
  role: "admin" | "nurse" | "cardiologist" | "physician" | "technician" | "patient";
  clinic: string; patientId?: string;
}

export const getRisk = (spo2: number, hr: number): RiskLevel => {
  if (spo2 < 85 || hr > 135) return "extreme";
  if (spo2 < 88 || hr > 120) return "high";
  if (spo2 < 90 || hr > 110) return "nurse";
  return "stable";
};

export const CREDS: Record<string, { pass: string; user: LoggedUser }> = {
  "ADM-001": { pass: "admin2026",   user: { id: "ADM-001", name: "Yassine Alaoui",     role: "admin",         clinic: "RPM Morocco HQ" } },
  "NRS-001": { pass: "nurse2026",   user: { id: "NRS-001", name: "Aicha Bensouda",     role: "nurse",         clinic: "Clinique Al-Shifa · Casa" } },
  "NRS-002": { pass: "nurse2026",   user: { id: "NRS-002", name: "Karim El-Ouali",     role: "nurse",         clinic: "Polyclinique Atlas · Rabat" } },
  "DR-001":  { pass: "doctor2026",  user: { id: "DR-001",  name: "Dr. Nadia Mouffak", role: "cardiologist",  clinic: "Clinique Al-Shifa · Casa" } },
  "DR-002":  { pass: "doctor2026",  user: { id: "DR-002",  name: "Dr. Hassan Qassem", role: "physician",     clinic: "Clinique Ibn Rochd · Casa" } },
  "TCH-001": { pass: "tech2026",    user: { id: "TCH-001", name: "Salma Rifai",        role: "technician",    clinic: "RPM Morocco HQ" } },
  "P-001":   { pass: "patient2026", user: { id: "P-001",   name: "Mohammed Al-Fassi", role: "patient",       clinic: "Clinique Al-Shifa · Casa",     patientId: "P-001" } },
  "P-002":   { pass: "patient2026", user: { id: "P-002",   name: "Fatima Benali",     role: "patient",       clinic: "Clinique Al-Shifa · Casa",     patientId: "P-002" } },
  "P-003":   { pass: "patient2026", user: { id: "P-003",   name: "Youssef Chakir",    role: "patient",       clinic: "Polyclinique Atlas · Rabat",   patientId: "P-003" } },
  "P-004":   { pass: "patient2026", user: { id: "P-004",   name: "Amina Tazi",        role: "patient",       clinic: "Clinique Al-Shifa · Casa",     patientId: "P-004" } },
  "P-005":   { pass: "patient2026", user: { id: "P-005",   name: "Omar Idrissi",      role: "patient",       clinic: "Polyclinique Atlas · Rabat",   patientId: "P-005" } },
  "P-006":   { pass: "patient2026", user: { id: "P-006",   name: "Khadija Mansouri",  role: "patient",       clinic: "Clinique Al-Shifa · Casa",     patientId: "P-006" } },
  "P-007":   { pass: "patient2026", user: { id: "P-007",   name: "Hassan Berrada",    role: "patient",       clinic: "Clinique Ibn Rochd · Casa",    patientId: "P-007" } },
  "P-008":   { pass: "patient2026", user: { id: "P-008",   name: "Nadia El-Alaoui",   role: "patient",       clinic: "Clinique Ibn Rochd · Casa",    patientId: "P-008" } },
  "P-009":   { pass: "patient2026", user: { id: "P-009",   name: "Rachid Ouazzani",   role: "patient",       clinic: "Clinique Al-Shifa · Casa",     patientId: "P-009" } },
};

export const SUBSCRIBED_PATIENTS = new Set(["P-001","P-002","P-003","P-004","P-005","P-006","P-007","P-008","P-009"]);

export const ROLE_SCREENS: Record<string, Screen[]> = {
  admin:        ["dashboard", "alerts", "records", "devices", "calculator", "calendar", "landing"],
  nurse:        ["dashboard", "alerts", "records", "calendar"],
  cardiologist: ["dashboard", "alerts", "records", "calendar"],
  physician:    ["dashboard", "alerts", "records", "calendar"],
  technician:   ["devices", "calendar"],
  patient:      [],
};

// ─── Medical data types & records ─────────────────────────────────────────────
export interface Medication { name: string; dose: string; freq: string; by: string; since: string; indication: string; }
export interface DoctorNote { id: string; author: string; role: string; date: string; text: string; tags: string[]; }
export interface ChatMsg    { id: string; from: string; role: string; text: string; time: string; isStaff: boolean; }
export interface MedRecord  {
  patientId: string; bloodType: string; allergies: string[];
  emergencyContact: string; emergencyPhone: string;
  address: string; gpsLat: number; gpsLng: number;
  insurance: string; subscriptionPlan: string; deviceId: string;
  medications: Medication[]; notes: DoctorNote[]; messages: ChatMsg[];
}

export const MED_RECORDS: Record<string, MedRecord> = {
  "P-001": {
    patientId: "P-001", bloodType: "A+", allergies: ["Pénicilline"],
    emergencyContact: "Fatima Al-Fassi (épouse)", emergencyPhone: "+212 6 44 12 87 53",
    address: "12 Rue des Orangers, Ain Chock, Casablanca 20250",
    gpsLat: 33.5601, gpsLng: -7.6234, insurance: "CNOPS N°A-2241-07",
    subscriptionPlan: "RPM Standard · ECG + SpO₂", deviceId: "ECG-MA-0042",
    medications: [
      { name: "Aspirine 100mg", dose: "100mg", freq: "1× / jour matin", by: "Dr. Mouffak", since: "2026-07-05", indication: "Anti-agrégant post-CABG" },
      { name: "Bisoprolol 5mg", dose: "5mg", freq: "1× / jour matin", by: "Dr. Mouffak", since: "2026-07-05", indication: "Bêtabloquant" },
    ],
    notes: [
      { id: "n1", author: "Dr. Nadia Mouffak", role: "cardiologist", date: "2026-07-10 09:30", text: "Patient stable J+3 post-CABG.", tags: ["Post-op J+3", "Stable"] },
    ],
    messages: [
      { id: "m1", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "Bonjour M. Al-Fassi, comment vous sentez-vous ?", time: "07:45", isStaff: true },
    ],
  },
  "P-002": {
    patientId: "P-002", bloodType: "O-", allergies: ["Iode", "Aspirine"],
    emergencyContact: "Khalid Benali (fils)", emergencyPhone: "+212 6 61 34 77 29",
    address: "45 Bd Zerktouni, Maarif, Casablanca 20380",
    gpsLat: 33.5890, gpsLng: -7.6254, insurance: "CNSS N°B-5512-54",
    subscriptionPlan: "RPM Premium · ECG + SpO₂ + BP", deviceId: "ECG-MA-0043",
    medications: [
      { name: "Warfarine 4mg", dose: "4mg", freq: "Selon INR", by: "Dr. Mouffak", since: "2026-07-09", indication: "Anticoagulation post-valve" },
    ],
    notes: [
      { id: "n1", author: "Dr. Nadia Mouffak", role: "cardiologist", date: "2026-07-09 14:00", text: "ALERTE CRITIQUE — SpO₂ 87%", tags: ["CRITIQUE"] },
    ],
    messages: [
      { id: "m1", from: "Aicha Bensouda", role: "nurse", text: "Mme Benali, une alerte critique a été détectée.", time: "06:48", isStaff: true },
    ],
  },
  "P-003": {
    patientId: "P-003", bloodType: "B+", allergies: ["AINS", "Latex"],
    emergencyContact: "Samira Chakir (fille)", emergencyPhone: "+212 6 55 88 41 12",
    address: "8 Avenue Hassan II, Agdal, Rabat 10090",
    gpsLat: 34.0085, gpsLng: -6.8517, insurance: "RAMED N°C-0087-71",
    subscriptionPlan: "RPM Standard · BP + SpO₂", deviceId: "BP-MA-0018",
    medications: [],
    notes: [],
    messages: [],
  },
  "P-004": {
    patientId: "P-004", bloodType: "AB+", allergies: [],
    emergencyContact: "Mehdi Tazi (époux)", emergencyPhone: "+212 6 70 22 58 94",
    address: "23 Rue Ibn Batouta, Casablanca 20070",
    gpsLat: 33.5950, gpsLng: -7.6316, insurance: "CNOPS N°A-3388-62",
    subscriptionPlan: "RPM Standard · ECG + SpO₂", deviceId: "ECG-MA-0051",
    medications: [],
    notes: [],
    messages: [],
  },
  "P-005": {
    patientId: "P-005", bloodType: "A-", allergies: ["Sulfamides"],
    emergencyContact: "Zineb Idrissi (épouse)", emergencyPhone: "+212 6 60 91 44 77",
    address: "5 Allée des Roses, Hay Riad, Rabat 10100",
    gpsLat: 33.9681, gpsLng: -6.8574, insurance: "CNSS N°B-7720-58",
    subscriptionPlan: "RPM Premium · SpO₂ + ECG", deviceId: "SPO-MA-0009",
    medications: [],
    notes: [],
    messages: [],
  },
  "P-006": {
    patientId: "P-006", bloodType: "O+", allergies: [],
    emergencyContact: "Ahmed Mansouri (fils)", emergencyPhone: "+212 6 52 17 83 60",
    address: "18 Rue Moulay Rachid, Casablanca 20060",
    gpsLat: 33.5920, gpsLng: -7.6405, insurance: "CNOPS N°A-1144-69",
    subscriptionPlan: "RPM Standard · ECG + SpO₂", deviceId: "ECG-MA-0044",
    medications: [],
    notes: [],
    messages: [],
  },
  "P-007": {
    patientId: "P-007", bloodType: "B-", allergies: ["Céphalosporines"],
    emergencyContact: "Laila Berrada (épouse)", emergencyPhone: "+212 6 63 40 19 85",
    address: "32 Rue d'Agadir, Casablanca 20340",
    gpsLat: 33.5842, gpsLng: -7.6181, insurance: "CNSS N°B-3301-73",
    subscriptionPlan: "RPM Premium · BP + ECG + SpO₂", deviceId: "BP-MA-0019",
    medications: [],
    notes: [],
    messages: [],
  },
  "P-008": {
    patientId: "P-008", bloodType: "A+", allergies: [],
    emergencyContact: "Youssef El-Alaoui (époux)", emergencyPhone: "+212 6 74 55 21 38",
    address: "7 Rue de Fès, Casablanca 20200",
    gpsLat: 33.5518, gpsLng: -7.6698, insurance: "CNSS N°B-9900-48",
    subscriptionPlan: "RPM Starter · SpO₂", deviceId: "SPO-MA-0010",
    medications: [],
    notes: [],
    messages: [],
  },
  "P-009": {
    patientId: "P-009", bloodType: "AB-", allergies: ["Héparine", "Contraste iodé"],
    emergencyContact: "Malika Ouazzani (épouse)", emergencyPhone: "+212 6 65 87 44 22",
    address: "91 Bd d'Anfa, Casablanca 20050",
    gpsLat: 33.5989, gpsLng: -7.6522, insurance: "CNOPS N°A-4477-60",
    subscriptionPlan: "RPM Premium · ECG + BP + SpO₂", deviceId: "ECG-MA-0038",
    medications: [],
    notes: [],
    messages: [],
  },
};

// ─── Staff ──────────────────────────────────────────────────────────────────
export type StaffStatusKey = "available" | "busy" | "in_surgery" | "on_call" | "consultation" | "break" | "offline";

export interface StaffMember {
  id: string; name: string; role: string; specialty: string; clinic: string;
  status: StaffStatusKey; statusNote: string; phone: string; pager: string;
  currentPatient?: string;
}

export const STAFF_STATUS_CFG: Record<StaffStatusKey, { label: string; color: string; bg: string; dot: string }> = {
  available:    { label: "Disponible",       color: "#16605A", bg: "#E3EEEC", dot: "#16605A" },
  busy:         { label: "Occupé",           color: "#B9873F", bg: "#FDF3E3", dot: "#B9873F" },
  in_surgery:   { label: "En salle op.",     color: "#D6452F", bg: "#FBEAE6", dot: "#D6452F" },
  on_call:      { label: "Astreinte",        color: "#16605A", bg: "#E3EEEC", dot: "#22AA99" },
  consultation: { label: "En consultation",  color: "#B9873F", bg: "#FDF3E3", dot: "#B9873F" },
  break:        { label: "Pause",            color: "#5A756F", bg: "#F4F7F6", dot: "#5A756F" },
  offline:      { label: "Hors ligne",       color: "#9AADA8", bg: "#F4F7F6", dot: "#C0CECA" },
};

export const STAFF_SEED: StaffMember[] = [
  { id: "NRS-001", name: "Aicha Bensouda",       role: "nurse",        specialty: "soins infirmiers",  clinic: "Clinique Al-Shifa · Casa",   status: "available",    statusNote: "Disponible — salle 3",       phone: "+212 6 61 10 11 12", pager: "NRS-001", currentPatient: "P-002" },
  { id: "NRS-002", name: "Karim El-Ouali",       role: "nurse",        specialty: "soins infirmiers",  clinic: "Polyclinique Atlas · Rabat",  status: "consultation", statusNote: "Suivi P-003 / P-005",        phone: "+212 6 62 20 21 22", pager: "NRS-002", currentPatient: "P-003" },
  { id: "NRS-003", name: "Souad Rachidi",         role: "nurse",        specialty: "soins infirmiers",  clinic: "Clinique Al-Shifa · Casa",   status: "break",        statusNote: "Pause 13h–14h",              phone: "+212 6 66 60 61 62", pager: "NRS-003" },
  { id: "NRS-004", name: "Yassine Belkadi",       role: "nurse",        specialty: "soins infirmiers",  clinic: "Clinique Ibn Rochd · Casa",   status: "available",    statusNote: "Disponible — service cardiologie", phone: "+212 6 67 70 71 72", pager: "NRS-004" },
  { id: "DR-001",  name: "Dr. Nadia Mouffak",    role: "cardiologist", specialty: "cardiologie",       clinic: "Clinique Al-Shifa · Casa",   status: "in_surgery",   statusNote: "Bloc 2 — valve TAVI",        phone: "+212 6 63 30 31 32", pager: "DR-001" },
  { id: "DR-002",  name: "Dr. Hassan Qassem",    role: "physician",    specialty: "médecine générale", clinic: "Clinique Ibn Rochd · Casa",   status: "on_call",      statusNote: "Astreinte nuit — joignable", phone: "+212 6 64 40 41 42", pager: "DR-002", currentPatient: "P-007" },
  { id: "DR-003",  name: "Dr. Leila Amrani",     role: "cardiologist", specialty: "cardiologie",       clinic: "Polyclinique Atlas · Rabat",  status: "available",    statusNote: "Disponible — consultation",  phone: "+212 6 65 50 51 52", pager: "DR-003" },
  { id: "DR-004",  name: "Dr. Mehdi Oulkadi",    role: "physician",    specialty: "orthopédie",        clinic: "Clinique Al-Shifa · Casa",   status: "available",    statusNote: "Consultations salle 7",      phone: "+212 6 68 80 81 82", pager: "DR-004" },
];

// ─── Appointments ──────────────────────────────────────────────────────────────
export interface Appointment {
  id: string; patientId: string; doctorId: string; doctorName: string;
  type: "consultation" | "follow_up" | "procedure" | "imaging" | "lab";
  title: string; date: string; time: string; duration: number;
  location: string; notes: string; status: "scheduled" | "confirmed" | "done" | "cancelled";
  createdBy: string; createdAt: string;
}

export const APPT_SEED: Appointment[] = [
  { id: "APT-001", patientId: "P-001", doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak", type: "follow_up", title: "Contrôle post-CABG J+7", date: "2026-07-15", time: "09:30", duration: 30, location: "Cardio · Bureau 204", notes: "Écho cardiaque + ECG.", status: "confirmed", createdBy: "DR-001", createdAt: "2026-07-10 09:35" },
  { id: "APT-002", patientId: "P-002", doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak", type: "procedure", title: "Cardioversion électrique", date: "2026-07-12", time: "14:00", duration: 60, location: "Salle de procédure · Bloc A", notes: "Risque FA persistante.", status: "scheduled", createdBy: "DR-001", createdAt: "2026-07-11 07:00" },
  { id: "APT-003", patientId: "P-003", doctorId: "DR-002", doctorName: "Dr. Hassan Qassem", type: "imaging", title: "Radio contrôle PTH droite", date: "2026-08-22", time: "10:00", duration: 20, location: "Radiologie · RDC", notes: "Bilan osseux prothèse.", status: "scheduled", createdBy: "DR-002", createdAt: "2026-07-08 11:15" },
];

// ─── Allergy ↔ Drug interaction map ──────────────────────────────────────────
export const ALLERGY_DRUG_MAP: Record<string, string[]> = {
  "Pénicilline":       ["amoxicilline","ampicilline","pénicilline","augmentin","piperacilline"],
  "Aspirine":          ["aspirine","acide acétylsalicylique"],
  "AINS":              ["ibuprofène","naproxène","kétoprofène","diclofénac","méloxicam","célécoxib"],
  "Iode":              ["amiodarone","cordarone","povidone","produit de contraste"],
  "Contraste iodé":    ["amiodarone","cordarone","produit de contraste"],
  "Sulfamides":        ["sulfamide","cotrimoxazole","triméthoprime","bactrim"],
  "Céphalosporines":   ["céfazoline","céftriaxone","céfuroxime","céfalexine"],
  "Héparine":          ["héparine","enoxaparine","lovenox","nadroparine"],
  "Morphine":          ["morphine","codéine","tramadol","fentanyl","oxycodone"],
  "Latex":             [],
};

export function detectAllergyConflict(medName: string, allergies: string[]): string | null {
  const lower = medName.toLowerCase();
  for (const allergy of allergies) {
    if (lower.includes(allergy.toLowerCase())) return allergy;
    const keywords = ALLERGY_DRUG_MAP[allergy] ?? [];
    if (keywords.some(kw => lower.includes(kw))) return allergy;
  }
  return null;
}

export const inputStyle = {
  width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px",
  fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6",
  color: "#0F312D", outline: "none", boxSizing: "border-box" as const,
};

export const SPECIALTY_LABELS: Record<string, string> = {
  "tous": "Tous les rôles",
  "soins infirmiers": "Infirmier(e)s",
  "cardiologie": "Cardiologie",
  "médecine générale": "Médecine générale",
};

// ─── Notification system ──────────────────────────────────────────────────────
export interface RPMNotification {
  id: string; patientId: string; patientName: string;
  risk: RiskLevel; message: string; detail: string;
  time: string; read: boolean;
  spo2: number; hr: number; bpSys: number; bpDia: number;
  assignedDoctorId: string; assignedNurseId: string;
  gpsLat: number; gpsLng: number; address: string;
  visibleToRoles: string[];
}

export const buildNotifications = (): RPMNotification[] => {
  const now = new Date();
  const t = (minAgo: number) => {
    const d = new Date(now.getTime() - minAgo * 60000);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };
  return [
    { id: "N-001", patientId: "P-002", patientName: "Fatima Benali", risk: "extreme", message: "SpO₂ 87% · FC 124 bpm — ALERTE CRITIQUE", detail: "Saturation dangereusement basse post-valve repair.", time: t(4), read: false, spo2: 87, hr: 124, bpSys: 149, bpDia: 96, assignedDoctorId: "DR-001", assignedNurseId: "NRS-001", gpsLat: 33.5890, gpsLng: -7.6254, address: "45 Bd Zerktouni, Casablanca", visibleToRoles: ["admin","nurse","cardiologist","physician"] },
    { id: "N-002", patientId: "P-007", patientName: "Hassan Berrada", risk: "high", message: "FC 128 bpm — FA persistante", detail: "Cardioversion à envisager.", time: t(12), read: false, spo2: 91, hr: 128, bpSys: 156, bpDia: 99, assignedDoctorId: "DR-002", assignedNurseId: "NRS-001", gpsLat: 33.5842, gpsLng: -7.6181, address: "32 Rue d'Agadir, Casablanca", visibleToRoles: ["admin","nurse","cardiologist","physician"] },
  ];
};
