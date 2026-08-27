import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

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

// ─── Nav sections ─────────────────────────────────────────────────────────────
export const NAV = [
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
// ─── Sparkline ─────────────────────────────────────────────────────────────────
export function Spark({ data, color }: { data: SparkPoint[]; color: string }) {
  return (
    <div style={{ width: 80, height: 30, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

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

export const RISK_CFG: Record<RiskLevel, { label: string; color: string; bg: string; action: string; icon: string }> = {
  stable:  { label: "STABLE",       color: "#16605A", bg: "#E3EEEC", action: "Surveillance routinière",                              icon: "✓" },
  nurse:   { label: "NURSE ALERT",  color: "#B9873F", bg: "#FDF3E3", action: "Notifier infirmière assignée automatiquement",          icon: "⚠" },
  high:    { label: "HIGH RISK",    color: "#D6452F", bg: "#FFF0ED", action: "Appeler infirmière + médecin traitant",                 icon: "⚡" },
  extreme: { label: "EXTREME RISK", color: "#D6452F", bg: "#FBEAE6", action: "Déclencher ambulance + partager localisation GPS",      icon: "🚨" },
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

// Active device subscriptions (only these patient IDs can log in as patients)
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
      { name: "Bisoprolol 5mg (Bisoce)", dose: "5mg", freq: "1× / jour matin", by: "Dr. Mouffak", since: "2026-07-05", indication: "Bêtabloquant — FC cible 60–70 bpm" },
      { name: "Atorvastatine 40mg (Tahor)", dose: "40mg", freq: "1× / jour soir", by: "Dr. Mouffak", since: "2026-07-05", indication: "Statine — LDL cible < 0.7 g/L" },
      { name: "Clopidogrel 75mg (Plavix)", dose: "75mg", freq: "1× / jour matin", by: "Dr. Mouffak", since: "2026-07-05", indication: "Double anti-agrégation 12 mois post-pontage" },
      { name: "Oméprazole 20mg", dose: "20mg", freq: "1× / jour matin à jeun", by: "Dr. Mouffak", since: "2026-07-05", indication: "Protection gastrique — aspirine + clopidogrel" },
    ],
    notes: [
      { id: "n1", author: "Dr. Nadia Mouffak", role: "cardiologist", date: "2026-07-10 09:30", text: "Patient stable J+3 post-CABG. Plaie sternotomie propre, sutures intègres. ECG: rythme sinusal, pas de trouble de repolarisation. SpO₂ 97% en air ambiant. Continuer protocole télémonitoring. RDV consultation physique J+7.", tags: ["Post-op J+3", "Stable", "CABG"] },
      { id: "n2", author: "Aicha Bensouda", role: "nurse", date: "2026-07-11 07:15", text: "Appel matinal. Patient se plaint de légère fatigue et douleur cicatricielle 2/10. TA 128/82. FC 72 bpm. Pas de signe alarme. Rappel prise médicaments après petit-déjeuner.", tags: ["Routine", "Douleur cicatricielle légère"] },
    ],
    messages: [
      { id: "m1", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "Bonjour M. Al-Fassi, comment vous sentez-vous ce matin ?", time: "07:45", isStaff: true },
      { id: "m2", from: "Mohammed Al-Fassi", role: "patient", text: "Bonjour Docteur. Je me sens mieux qu'hier, un peu fatigué mais ça va. La cicatrice me fait légèrement mal.", time: "08:02", isStaff: false },
      { id: "m3", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "C'est tout à fait normal à J+3. Continuez vos médicaments. En cas de douleur > 5/10 ou essoufflement, contactez immédiatement la ligne d'urgence RPM.", time: "08:15", isStaff: true },
    ],
  },
  "P-002": {
    patientId: "P-002", bloodType: "O-", allergies: ["Iode", "Aspirine"],
    emergencyContact: "Khalid Benali (fils)", emergencyPhone: "+212 6 61 34 77 29",
    address: "45 Bd Zerktouni, Maarif, Casablanca 20380",
    gpsLat: 33.5890, gpsLng: -7.6254, insurance: "CNSS N°B-5512-54",
    subscriptionPlan: "RPM Premium · ECG + SpO₂ + BP", deviceId: "ECG-MA-0043",
    medications: [
      { name: "Warfarine 4mg (Sintrom)", dose: "4mg", freq: "Selon INR — ajustement hebdo", by: "Dr. Mouffak", since: "2026-07-09", indication: "Anticoagulation post-plastie valvulaire (INR cible 2.5–3.5)" },
      { name: "Furosémide 40mg (Lasilix)", dose: "40→80mg", freq: "1× / jour matin", by: "Dr. Mouffak", since: "2026-07-09", indication: "Diurétique — surcharge volumique post-valvuloplastie" },
      { name: "Métoprolol 50mg (Lopressor)", dose: "50mg", freq: "2× / jour", by: "Dr. Mouffak", since: "2026-07-09", indication: "Contrôle FC — cible < 80 bpm" },
    ],
    notes: [
      { id: "n1", author: "Dr. Nadia Mouffak", role: "cardiologist", date: "2026-07-09 14:00", text: "⚠ ALERTE CRITIQUE — SpO₂ 87%, FC 124 bpm. Patiente contactée par téléphone, dyspnée d'effort + palpitations. Augmentation Furosémide 40→80mg. Protocole EXTREME RISK activé. Hospitalisation si SpO₂ < 85% ou FC > 140 bpm.", tags: ["CRITIQUE", "SpO₂ critique", "Dyspnée", "Alerte automatique"] },
      { id: "n2", author: "Aicha Bensouda", role: "nurse", date: "2026-07-11 06:50", text: "Appel infirmier automatique déclenché 06:47 (SpO₂ 87%). Patiente réveillée, angoissée. FC 124 bpm. Position semi-assise conseillée. Médecin + SAMU notifiés. Protocole haute vigilance actif.", tags: ["Urgence", "Alerte déclenchée", "Suivi intensif"] },
    ],
    messages: [
      { id: "m1", from: "Aicha Bensouda", role: "nurse", text: "🚨 Mme Benali, une alerte critique a été détectée. Comment vous sentez-vous en ce moment ?", time: "06:48", isStaff: true },
      { id: "m2", from: "Fatima Benali", role: "patient", text: "J'ai du mal à respirer depuis ce matin. Je me sens très essoufflée et mon cœur bat très vite.", time: "06:52", isStaff: false },
      { id: "m3", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "Mme Benali, je suis alertée. Restez allongée légèrement redressée. Le SAMU a été notifié automatiquement. Si douleur thoracique forte, appelez le 15.", time: "06:55", isStaff: true },
      { id: "m4", from: "Fatima Benali", role: "patient", text: "D'accord Docteur. J'ai peur, mon fils est là avec moi.", time: "06:57", isStaff: false },
      { id: "m5", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "Bien. L'équipe d'urgence est en route. Restez calme, respirez lentement. Nous vous surveillons en temps réel.", time: "06:58", isStaff: true },
    ],
  },
  "P-003": {
    patientId: "P-003", bloodType: "B+", allergies: ["AINS", "Latex"],
    emergencyContact: "Samira Chakir (fille)", emergencyPhone: "+212 6 55 88 41 12",
    address: "8 Avenue Hassan II, Agdal, Rabat 10090",
    gpsLat: 34.0085, gpsLng: -6.8517, insurance: "RAMED N°C-0087-71",
    subscriptionPlan: "RPM Standard · BP + SpO₂", deviceId: "BP-MA-0018",
    medications: [
      { name: "Paracétamol 1g (Doliprane)", dose: "1g", freq: "3× / jour si douleur (max 4g/j)", by: "Dr. Qassem", since: "2026-07-07", indication: "Analgésie post-opératoire — prothèse de hanche" },
      { name: "Enoxaparine 40mg (Lovenox)", dose: "40mg SC", freq: "1× / jour — 28 jours", by: "Dr. Qassem", since: "2026-07-07", indication: "Prévention TVP/EP post-arthroplastie" },
      { name: "Ramipril 5mg (Triatec)", dose: "5mg", freq: "1× / jour matin", by: "Dr. Qassem", since: "2026-07-07", indication: "HTA — traitement de fond" },
    ],
    notes: [
      { id: "n1", author: "Dr. Hassan Qassem", role: "physician", date: "2026-07-08 11:00", text: "Patient stable J+1 post-PTH droite. Douleur 3/10 sous paracétamol. TA 134/86. SpO₂ 95%. Mobilisation assistée J+1 autorisée. Lovenox 28 jours. Contrôle radio J+45.", tags: ["Post-prothèse hanche", "J+1", "Stable"] },
    ],
    messages: [
      { id: "m1", from: "Karim El-Ouali", role: "nurse", text: "Bonjour M. Chakir, comment se passe la mobilisation aujourd'hui ?", time: "09:10", isStaff: true },
      { id: "m2", from: "Youssef Chakir", role: "patient", text: "C'est douloureux mais je fais les exercices. La douleur est à 3/10.", time: "09:25", isStaff: false },
      { id: "m3", from: "Karim El-Ouali", role: "nurse", text: "Très bien. N'oubliez pas votre injection Lovenox ce soir. Signalez toute rougeur ou gonflement du mollet immédiatement.", time: "09:28", isStaff: true },
    ],
  },
  "P-004": {
    patientId: "P-004", bloodType: "AB+", allergies: [],
    emergencyContact: "Mehdi Tazi (époux)", emergencyPhone: "+212 6 70 22 58 94",
    address: "23 Rue Ibn Batouta, Gauthier, Casablanca 20070",
    gpsLat: 33.5950, gpsLng: -7.6316, insurance: "CNOPS N°A-3388-62",
    subscriptionPlan: "RPM Standard · ECG + SpO₂", deviceId: "ECG-MA-0051",
    medications: [
      { name: "Ticagrélor 90mg (Brilique)", dose: "90mg", freq: "2× / jour — 12 mois min.", by: "Dr. Mouffak", since: "2026-07-10", indication: "Anti-agrégant post-stent coronarien (ne JAMAIS arrêter)" },
      { name: "Aspirine 75mg", dose: "75mg", freq: "1× / jour", by: "Dr. Mouffak", since: "2026-07-10", indication: "Double anti-agrégation post-stent" },
      { name: "Atorvastatine 80mg", dose: "80mg", freq: "1× / jour soir", by: "Dr. Mouffak", since: "2026-07-10", indication: "Haute dose post-SCA — LDL cible < 0.55 g/L" },
    ],
    notes: [
      { id: "n1", author: "Dr. Nadia Mouffak", role: "cardiologist", date: "2026-07-10 16:00", text: "J+1 post-angioplastie + stenting LAD. Procédure sans complication. ECG normalisé. FC 74 bpm, TA 118/76, SpO₂ 96%. Thrombus résolu. Éducation: ne jamais arrêter Brilique sans avis cardio.", tags: ["Post-stent", "J+1", "Stable"] },
    ],
    messages: [
      { id: "m1", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "Bonjour Mme Tazi, bonne nouvelle — votre stent est parfaitement en place.", time: "16:30", isStaff: true },
      { id: "m2", from: "Amina Tazi", role: "patient", text: "Merci Docteur! Est-ce que je peux reprendre le travail bientôt ?", time: "16:45", isStaff: false },
      { id: "m3", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "Repos 4 semaines minimum. Le plus important: prenez vos deux anticoagulants SANS aucune interruption, même si vous vous sentez bien.", time: "16:50", isStaff: true },
    ],
  },
  "P-005": {
    patientId: "P-005", bloodType: "A-", allergies: ["Sulfamides"],
    emergencyContact: "Zineb Idrissi (épouse)", emergencyPhone: "+212 6 60 91 44 77",
    address: "5 Allée des Roses, Hay Riad, Rabat 10100",
    gpsLat: 33.9681, gpsLng: -6.8574, insurance: "CNSS N°B-7720-58",
    subscriptionPlan: "RPM Premium · SpO₂ + ECG", deviceId: "SPO-MA-0009",
    medications: [
      { name: "Morphine LP 10mg (Skenan)", dose: "10mg", freq: "2× / jour à 12h d'intervalle", by: "Dr. Qassem", since: "2026-07-06", indication: "Analgésie post-lobectomie — douleur neuropathique thoracique" },
      { name: "Amoxicilline-Acide clavulanique", dose: "1g", freq: "2× / jour pendant 7 jours", by: "Dr. Qassem", since: "2026-07-06", indication: "Antibioprophylaxie post-résection pulmonaire" },
      { name: "Pantoprazole 40mg", dose: "40mg", freq: "1× / jour à jeun", by: "Dr. Qassem", since: "2026-07-06", indication: "Protection gastrique — morphine + antibiotique" },
    ],
    notes: [
      { id: "n1", author: "Dr. Hassan Qassem", role: "physician", date: "2026-07-10 10:15", text: "⚠ Batterie dispositif 12% — appeler pour recharge urgente. SpO₂ 92% acceptable J+5 post-lobectomie droite. FC 96. Spirométrie incitative J+3 débutée. Drain retiré J+4. Antibiotiques jusqu'à J+7.", tags: ["Batterie critique", "Post-lobectomie J+5", "SpO₂ limite"] },
    ],
    messages: [
      { id: "m1", from: "Karim El-Ouali", role: "nurse", text: "M. Idrissi, votre dispositif est à 12% de batterie — branchez-le cette nuit. Sinon nous perdons la surveillance.", time: "08:45", isStaff: true },
      { id: "m2", from: "Omar Idrissi", role: "patient", text: "Je le branche immédiatement. Merci du rappel!", time: "09:00", isStaff: false },
      { id: "m3", from: "Karim El-Ouali", role: "nurse", text: "Parfait. Comment sont vos douleurs aujourd'hui ?", time: "09:01", isStaff: true },
      { id: "m4", from: "Omar Idrissi", role: "patient", text: "Environ 4/10 quand je respire profondément. Je fais les exercices de spirométrie.", time: "09:10", isStaff: false },
    ],
  },
  "P-006": {
    patientId: "P-006", bloodType: "O+", allergies: [],
    emergencyContact: "Ahmed Mansouri (fils)", emergencyPhone: "+212 6 52 17 83 60",
    address: "18 Rue Moulay Rachid, Bourgogne, Casablanca 20060",
    gpsLat: 33.5920, gpsLng: -7.6405, insurance: "CNOPS N°A-1144-69",
    subscriptionPlan: "RPM Standard · ECG + SpO₂", deviceId: "ECG-MA-0044",
    medications: [
      { name: "Aspirine 100mg", dose: "100mg", freq: "1× / jour", by: "Dr. Mouffak", since: "2026-07-08", indication: "Anti-agrégation post-CABG triple" },
      { name: "Bisoprolol 2.5mg", dose: "2.5mg", freq: "1× / jour matin", by: "Dr. Mouffak", since: "2026-07-08", indication: "FC cible 55–65 bpm post-pontage" },
      { name: "Ivabradine 5mg (Procoralan)", dose: "5mg", freq: "2× / jour", by: "Dr. Mouffak", since: "2026-07-08", indication: "Réduction FC complémentaire" },
      { name: "Clopidogrel 75mg", dose: "75mg", freq: "1× / jour", by: "Dr. Mouffak", since: "2026-07-08", indication: "Double anti-agrégation 12 mois" },
    ],
    notes: [
      { id: "n1", author: "Dr. Nadia Mouffak", role: "cardiologist", date: "2026-07-10 08:30", text: "Mme Mansouri J+3 post-CABG triple. Bonne évolution. FC 68 — réponse excellente bisoprolol. SpO₂ 96%, TA 122/78. Plaie sternotomie propre. Kinésithérapie respiratoire J+3 autorisée.", tags: ["Post-CABG triple", "Bonne évolution", "J+3"] },
    ],
    messages: [
      { id: "m1", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "Bonjour Mme Mansouri, vos constantes sont très satisfaisantes ce matin.", time: "08:35", isStaff: true },
      { id: "m2", from: "Khadija Mansouri", role: "patient", text: "Merci Docteur. Je dors mieux. La douleur est à 1-2/10.", time: "09:00", isStaff: false },
    ],
  },
  "P-007": {
    patientId: "P-007", bloodType: "B-", allergies: ["Céphalosporines"],
    emergencyContact: "Laila Berrada (épouse)", emergencyPhone: "+212 6 63 40 19 85",
    address: "32 Rue d'Agadir, Maarif, Casablanca 20340",
    gpsLat: 33.5842, gpsLng: -7.6181, insurance: "CNSS N°B-3301-73",
    subscriptionPlan: "RPM Premium · BP + ECG + SpO₂", deviceId: "BP-MA-0019",
    medications: [
      { name: "Amiodarone 200mg (Cordarone)", dose: "200mg", freq: "2× / jour phase charge, puis 1×/j", by: "Dr. Qassem", since: "2026-07-05", indication: "FA post-opératoire — antiarythmique classe III" },
      { name: "Métoprolol 50mg", dose: "50mg", freq: "2× / jour", by: "Dr. Qassem", since: "2026-07-05", indication: "Contrôle FC — FA résistante" },
      { name: "Hépar. non fractionn. IV", dose: "500 UI/h", freq: "Perfusion continue protocole", by: "Dr. Qassem", since: "2026-07-09", indication: "Anticoagulation FA — relais AVK" },
      { name: "Paracétamol 1g", dose: "1g", freq: "4× / jour max", by: "Dr. Qassem", since: "2026-07-05", indication: "Analgésie post-résection colique" },
    ],
    notes: [
      { id: "n1", author: "Dr. Hassan Qassem", role: "physician", date: "2026-07-10 12:00", text: "⚡ HAUTE VIGILANCE — FC 128 bpm malgré Amiodarone + Métoprolol. FA persistante J+6. Cardioversion électrique élective si non-retour en rythme sinusal à J+10. TA 156/99 — ajustement anti-HTA prévu. Appel infirmier auto si FC > 130.", tags: ["FA persistante", "Haute vigilance", "HIGH RISK"] },
    ],
    messages: [
      { id: "m1", from: "Dr. Hassan Qassem", role: "physician", text: "M. Berrada, votre fréquence cardiaque reste élevée. Avez-vous des palpitations ou un essoufflement ?", time: "12:30", isStaff: true },
      { id: "m2", from: "Hassan Berrada", role: "patient", text: "Oui, je sens mon cœur battre très vite surtout quand je me lève.", time: "12:45", isStaff: false },
      { id: "m3", from: "Dr. Hassan Qassem", role: "physician", text: "Restez au lit au maximum. En cas de vertige ou douleur thoracique intense, appelez le 15 immédiatement. Votre épouse est-elle présente ?", time: "12:48", isStaff: true },
      { id: "m4", from: "Hassan Berrada", role: "patient", text: "Oui elle est là. Merci Docteur.", time: "12:52", isStaff: false },
    ],
  },
  "P-008": {
    patientId: "P-008", bloodType: "A+", allergies: [],
    emergencyContact: "Youssef El-Alaoui (époux)", emergencyPhone: "+212 6 74 55 21 38",
    address: "7 Rue de Fès, Hay Hassani, Casablanca 20200",
    gpsLat: 33.5518, gpsLng: -7.6698, insurance: "CNSS N°B-9900-48",
    subscriptionPlan: "RPM Starter · SpO₂", deviceId: "SPO-MA-0010",
    medications: [
      { name: "Amoxicilline 1g", dose: "1g", freq: "3× / jour — 5 jours", by: "Dr. Qassem", since: "2026-07-10", indication: "Antibioprophylaxie post-appendicectomie laparoscopique" },
      { name: "Ibuprofène 400mg", dose: "400mg", freq: "3× / jour avec repas — 5 jours", by: "Dr. Qassem", since: "2026-07-10", indication: "AINS analgésique — douleur post-laparoscopie" },
    ],
    notes: [
      { id: "n1", author: "Dr. Hassan Qassem", role: "physician", date: "2026-07-11 07:00", text: "Mme El-Alaoui J+1 post-appendicectomie laparoscopique. Suites simples. SpO₂ 98%, FC 79, TA 120/74. Douleur 2/10. Sortie prévisionnelle J+2. Dispositif récupéré à la sortie.", tags: ["Post-appendicectomie", "Stable", "Sortie J+2"] },
    ],
    messages: [
      { id: "m1", from: "Karim El-Ouali", role: "nurse", text: "Bonjour Mme El-Alaoui, tout est stable ce matin selon vos constantes.", time: "07:30", isStaff: true },
      { id: "m2", from: "Nadia El-Alaoui", role: "patient", text: "Je me sens beaucoup mieux! Quand puis-je rentrer à la maison ?", time: "07:45", isStaff: false },
      { id: "m3", from: "Karim El-Ouali", role: "nurse", text: "Demain si tout reste stable ce soir. Le dispositif sera récupéré lors de votre sortie.", time: "07:47", isStaff: true },
    ],
  },
  "P-009": {
    patientId: "P-009", bloodType: "AB-", allergies: ["Héparine", "Contraste iodé"],
    emergencyContact: "Malika Ouazzani (épouse)", emergencyPhone: "+212 6 65 87 44 22",
    address: "91 Bd d'Anfa, Anfa, Casablanca 20050",
    gpsLat: 33.5989, gpsLng: -7.6522, insurance: "CNOPS N°A-4477-60",
    subscriptionPlan: "RPM Premium · ECG + BP + SpO₂", deviceId: "ECG-MA-0038",
    medications: [
      { name: "Fondaparinux 2.5mg (Arixtra)", dose: "2.5mg SC", freq: "1× / jour", by: "Dr. Mouffak", since: "2026-07-04", indication: "Anticoagulation post-EVAR (allergie héparine — alternative Xa)" },
      { name: "Aspirine 100mg", dose: "100mg", freq: "1× / jour", by: "Dr. Mouffak", since: "2026-07-04", indication: "Anti-agrégation post-stent aortique" },
      { name: "Amlodipine 10mg", dose: "10mg", freq: "1× / jour", by: "Dr. Mouffak", since: "2026-07-04", indication: "HTA — calcium-bloquant (IEC contre-indiqué post-EVAR)" },
      { name: "Atorvastatine 40mg", dose: "40mg", freq: "1× / jour soir", by: "Dr. Mouffak", since: "2026-07-04", indication: "Statine — protection stent aortique" },
    ],
    notes: [
      { id: "n1", author: "Dr. Nadia Mouffak", role: "cardiologist", date: "2026-07-10 09:00", text: "⚠ NO SIGNAL depuis 4 min. Patient contacté par tél. — répond, bien. Sorti brièvement (déplacement). Consignes: rester à domicile pour couverture réseau. Prochain télémonitoring 14h. Si no-signal > 30 min, envoi technicien.", tags: ["No-signal", "Contact téléphonique", "Réseau"] },
    ],
    messages: [
      { id: "m1", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "M. Ouazzani, votre dispositif a perdu le signal. Tout va bien ?", time: "06:10", isStaff: true },
      { id: "m2", from: "Rachid Ouazzani", role: "patient", text: "Oui oui, j'étais sorti faire une courte marche. Je rentre maintenant.", time: "06:18", isStaff: false },
      { id: "m3", from: "Dr. Nadia Mouffak", role: "cardiologist", text: "Restez à l'intérieur SVP pour maintenir la connexion. Les données reprennent automatiquement.", time: "06:19", isStaff: true },
    ],
  },
};


// ─── Staff status system ──────────────────────────────────────────────────────
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
  { id: "NRS-001", name: "Aicha Bensouda",        role: "nurse",        specialty: "soins infirmiers",  clinic: "Clinique Al-Shifa · Casa",      status: "available",    statusNote: "Disponible — salle 3",         phone: "+212 6 61 10 11 12", pager: "NRS-001", currentPatient: "P-002" },
  { id: "NRS-002", name: "Karim El-Ouali",        role: "nurse",        specialty: "soins infirmiers",  clinic: "Polyclinique Atlas · Rabat",    status: "consultation", statusNote: "Suivi P-003 / P-005",          phone: "+212 6 62 20 21 22", pager: "NRS-002", currentPatient: "P-003" },
  { id: "NRS-003", name: "Souad Rachidi",          role: "nurse",        specialty: "soins infirmiers",  clinic: "Clinique Al-Shifa · Casa",      status: "break",        statusNote: "Pause 13h–14h",                phone: "+212 6 66 60 61 62", pager: "NRS-003" },
  { id: "NRS-004", name: "Yassine Belkadi",        role: "nurse",        specialty: "soins infirmiers",  clinic: "Clinique Ibn Rochd · Casa",     status: "available",    statusNote: "Disponible — service cardiologie", phone: "+212 6 67 70 71 72", pager: "NRS-004" },
  { id: "DR-001",  name: "Dr. Nadia Mouffak",     role: "cardiologist", specialty: "cardiologie",       clinic: "Clinique Al-Shifa · Casa",      status: "in_surgery",   statusNote: "Bloc 2 — valve TAVI",          phone: "+212 6 63 30 31 32", pager: "DR-001" },
  { id: "DR-002",  name: "Dr. Hassan Qassem",     role: "physician",    specialty: "médecine générale", clinic: "Clinique Ibn Rochd · Casa",     status: "on_call",      statusNote: "Astreinte nuit — joignable",   phone: "+212 6 64 40 41 42", pager: "DR-002", currentPatient: "P-007" },
  { id: "DR-003",  name: "Dr. Leila Amrani",      role: "cardiologist", specialty: "cardiologie",       clinic: "Polyclinique Atlas · Rabat",    status: "available",    statusNote: "Disponible — consultation",    phone: "+212 6 65 50 51 52", pager: "DR-003" },
  { id: "DR-004",  name: "Dr. Mehdi Oulkadi",     role: "physician",    specialty: "orthopédie",        clinic: "Clinique Al-Shifa · Casa",      status: "available",    statusNote: "Consultations salle 7",        phone: "+212 6 68 80 81 82", pager: "DR-004" },
  { id: "DR-005",  name: "Dr. Samira Benkirane",  role: "physician",    specialty: "neurologie",        clinic: "Polyclinique Atlas · Rabat",    status: "busy",         statusNote: "EEG en cours — salle 4",       phone: "+212 6 69 90 91 92", pager: "DR-005" },
  { id: "DR-006",  name: "Dr. Tariq Benali",      role: "physician",    specialty: "pneumologie",       clinic: "Clinique Ibn Rochd · Casa",     status: "available",    statusNote: "Disponible — aile thoracique", phone: "+212 6 70 00 01 02", pager: "DR-006" },
  { id: "DR-007",  name: "Dr. Fatima-Zohra Alj",  role: "physician",    specialty: "chirurgie générale",clinic: "Clinique Al-Shifa · Casa",      status: "in_surgery",   statusNote: "Bloc 1 — résection côlon",     phone: "+212 6 71 10 11 12", pager: "DR-007" },
  { id: "DR-008",  name: "Dr. Adil Chraibi",      role: "physician",    specialty: "réanimation",       clinic: "Clinique Ibn Rochd · Casa",     status: "on_call",      statusNote: "Astreinte réa — unité 3",      phone: "+212 6 72 20 21 22", pager: "DR-008" },
];

// ─── Appointment (rendez-vous) system ─────────────────────────────────────────
export interface Appointment {
  id: string; patientId: string; doctorId: string; doctorName: string;
  type: "consultation" | "follow_up" | "procedure" | "imaging" | "lab";
  title: string; date: string; time: string; duration: number;
  location: string; notes: string; status: "scheduled" | "confirmed" | "done" | "cancelled";
  createdBy: string; createdAt: string;
}

export const TYPE_CFG: Record<Appointment["type"], { label: string; color: string; bg: string }> = {
  consultation: { label: "Consultation",   color: "#16605A", bg: "#E3EEEC" },
  follow_up:    { label: "Suivi",          color: "#B9873F", bg: "#FDF3E3" },
  procedure:    { label: "Acte médical",   color: "#D6452F", bg: "#FBEAE6" },
  imaging:      { label: "Imagerie",       color: "#5A756F", bg: "#F4F7F6" },
  lab:          { label: "Bilan labo",     color: "#5A756F", bg: "#F4F7F6" },
};

export const APPT_SEED: Appointment[] = [
  { id: "APT-001", patientId: "P-001", doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak",  type: "follow_up",    title: "Contrôle post-CABG J+7",           date: "2026-07-15", time: "09:30", duration: 30, location: "Cardio · Bureau 204", notes: "Écho cardiaque + ECG de repos. Amener carnet de surveillance.",             status: "confirmed",  createdBy: "DR-001", createdAt: "2026-07-10 09:35" },
  { id: "APT-002", patientId: "P-002", doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak",  type: "procedure",    title: "Cardioversion électrique si besoin", date: "2026-07-12", time: "14:00", duration: 60, location: "Salle de procédure · Bloc A",  notes: "⚠ Risque FA persistante. Anesthésie locale. Consentement requis.",         status: "scheduled",  createdBy: "DR-001", createdAt: "2026-07-11 07:00" },
  { id: "APT-003", patientId: "P-003", doctorId: "DR-002", doctorName: "Dr. Hassan Qassem",  type: "imaging",      title: "Radio de contrôle PTH droite J+45", date: "2026-08-22", time: "10:00", duration: 20, location: "Radiologie · RDC",             notes: "Bilan osseux prothèse hanche. Pas de préparation particulière.",           status: "scheduled",  createdBy: "DR-002", createdAt: "2026-07-08 11:15" },
  { id: "APT-004", patientId: "P-004", doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak",  type: "follow_up",    title: "Suivi coronarien post-stent S+4",   date: "2026-08-05", time: "11:00", duration: 30, location: "Cardio · Bureau 204",          notes: "Vérifier observance Brilique + Aspirine. Bilan lipidique à prescrire.",   status: "scheduled",  createdBy: "DR-001", createdAt: "2026-07-10 16:05" },
  { id: "APT-005", patientId: "P-005", doctorId: "DR-002", doctorName: "Dr. Hassan Qassem",  type: "lab",          title: "Bilan infectieux J+10 post-lobecto", date: "2026-07-17", time: "08:00", duration: 15, location: "Laboratoire · Niveau -1",      notes: "NFS, CRP, hémocultures si fièvre. Résultats sous 4h.",                    status: "confirmed",  createdBy: "NRS-002", createdAt: "2026-07-10 10:20" },
  { id: "APT-006", patientId: "P-007", doctorId: "DR-002", doctorName: "Dr. Hassan Qassem",  type: "consultation", title: "Décision cardioversion FA",         date: "2026-07-13", time: "15:30", duration: 45, location: "Cardio · Bureau 108",          notes: "FA persistante J+8. Discuter cardioversion électrique ou pharmacologique.", status: "confirmed",  createdBy: "DR-002", createdAt: "2026-07-11 12:55" },
  { id: "APT-007", patientId: "P-006", doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak",  type: "follow_up",    title: "Contrôle post-CABG triple J+10",   date: "2026-07-18", time: "09:00", duration: 30, location: "Cardio · Bureau 204",          notes: "Kinésithérapie respiratoire + ECG. Continuer protocole.",                 status: "scheduled",  createdBy: "DR-001", createdAt: "2026-07-10 08:45" },
];

// ─── Allergy ↔ Drug interaction map ──────────────────────────────────────────
export const ALLERGY_DRUG_MAP: Record<string, string[]> = {
  "Pénicilline":       ["amoxicilline","ampicilline","pénicilline","augmentin","piperacilline","tazobactam","flucloxacilline","oxacilline"],
  "Aspirine":          ["aspirine","acide acétylsalicylique"],
  "AINS":              ["ibuprofène","naproxène","kétoprofène","diclofénac","méloxicam","célécoxib","indométacine","piroxicam","kétorolac"],
  "Iode":              ["amiodarone","cordarone","povidone","produit de contraste","iopamidol","iohexol","iodure"],
  "Contraste iodé":    ["amiodarone","cordarone","produit de contraste","iopamidol","iohexol","iobitridol"],
  "Sulfamides":        ["sulfamide","cotrimoxazole","triméthoprime","sulfaméthoxazole","bactrim","sulfasalazine"],
  "Céphalosporines":   ["céfazoline","céftriaxone","céfuroxime","céfalexine","céfixime","céfotaxime","céfépime","céfpodoxime"],
  "Héparine":          ["héparine","enoxaparine","lovenox","nadroparine","tinzaparine","daltéparine","fraxiparine"],
  "Morphine":          ["morphine","codéine","tramadol","fentanyl","oxycodone","hydromorphone","nalbuphine","buprénorphine"],
  "Latex":             [],
};

// Returns the allergy name that conflicts with a drug name, or null
export function detectAllergyConflict(medName: string, allergies: string[]): string | null {
  const lower = medName.toLowerCase();
  for (const allergy of allergies) {
    // Direct name match
    if (lower.includes(allergy.toLowerCase())) return allergy;
    // Keyword match from map
    const keywords = ALLERGY_DRUG_MAP[allergy] ?? [];
    if (keywords.some(kw => lower.includes(kw))) return allergy;
  }
  return null;
}

// Shared input style for forms
export const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #D9E2DF", borderRadius: 7, padding: "8px 11px",
  fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", background: "#F4F7F6",
  color: "#0F312D", outline: "none", boxSizing: "border-box",
};

// ─── Calendar system ──────────────────────────────────────────────────────────
export type CalEventType = "consultation" | "surgery" | "follow_up" | "procedure" | "imaging" | "team_meeting" | "er";
export interface CalendarEvent {
  id: string;
  type: CalEventType;
  title: string;
  patientId?: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  teamIds: string[];
  addedById: string;
  addedByName: string;
  addedByRole: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  roomType: "consultation" | "surgery" | "er" | "imaging" | "meeting_room" | "office";
  roomNumber: string;
  clinic: string;
  notes: string;
  status: "scheduled" | "confirmed" | "in_progress" | "done" | "cancelled";
}

export const CAL_TYPE_CFG: Record<CalEventType, { label: string; icon: string }> = {
  consultation: { label: "Consultation",    icon: "🩺" },
  surgery:      { label: "Chirurgie",       icon: "⚕️" },
  follow_up:    { label: "Suivi",           icon: "📋" },
  procedure:    { label: "Procédure",       icon: "💉" },
  imaging:      { label: "Imagerie",        icon: "🔬" },
  team_meeting: { label: "Réunion d'équipe",icon: "👥" },
  er:           { label: "Urgences",        icon: "🚨" },
};

export const ROLE_CAL_COLOR: Record<string, { bg: string; border: string; text: string; light: string }> = {
  nurse:        { bg: "#16605A", border: "#0E4A45", text: "#fff", light: "#E3EEEC" },
  cardiologist: { bg: "#D6452F", border: "#A83220", text: "#fff", light: "#FBEAE6" },
  physician:    { bg: "#B9873F", border: "#8E6427", text: "#fff", light: "#FDF3E3" },
  admin:        { bg: "#0F312D", border: "#0A211E", text: "#fff", light: "#E8ECEB" },
  technician:   { bg: "#5A756F", border: "#3D5550", text: "#fff", light: "#EBF0EF" },
};

// Week helpers
export const getMonday = (d: Date) => {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
};
export const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
export const toYMD = (d: Date) => d.toISOString().slice(0, 10);
export const today = new Date();
export const todayYMD = toYMD(today);
export const thisMonday = getMonday(today);

export const CAL_EVENTS: CalendarEvent[] = [
  { id: "CE-001", type: "consultation",  title: "Consultation cardio post-TAVI",      patientId: "P-001", patientName: "Mohammed Al-Fassi",  doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak",    teamIds: ["NRS-001"],          addedById: "NRS-001", addedByName: "Aicha Bensouda", addedByRole: "nurse",        date: todayYMD,              startTime: "09:00", endTime: "09:45", roomType: "consultation", roomNumber: "Salle 3",  clinic: "Clinique Al-Shifa · Casa",   notes: "Post-TAVI J+30, vérifier TA et FC",  status: "confirmed" },
  { id: "CE-002", type: "surgery",       title: "Valve TAVI — Fatima Benali",         patientId: "P-002", patientName: "Fatima Benali",       doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak",    teamIds: ["NRS-001","DR-008"], addedById: "DR-001", addedByName: "Dr. Nadia Mouffak", addedByRole: "cardiologist", date: todayYMD,              startTime: "11:00", endTime: "14:00", roomType: "surgery",      roomNumber: "Bloc 2",   clinic: "Clinique Al-Shifa · Casa",   notes: "TAVI sous AG — anesthésiste réa Dr. Chraibi", status: "in_progress" },
  { id: "CE-003", type: "follow_up",    title: "Suivi PTH — Youssef Chakir",         patientId: "P-003", patientName: "Youssef Chakir",      doctorId: "DR-004", doctorName: "Dr. Mehdi Oulkadi",     teamIds: ["NRS-002"],          addedById: "NRS-002", addedByName: "Karim El-Ouali",  addedByRole: "nurse",        date: todayYMD,              startTime: "10:00", endTime: "10:30", roomType: "consultation", roomNumber: "Salle 7",  clinic: "Clinique Al-Shifa · Casa",   notes: "Contrôle PTH J+45, radio prévue",    status: "scheduled" },
  { id: "CE-004", type: "team_meeting", title: "Réunion équipe cardiologie",          patientId: undefined, patientName: undefined,          doctorId: "DR-001", doctorName: "Dr. Nadia Mouffak",    teamIds: ["DR-003","NRS-001","NRS-002","NRS-004"], addedById: "DR-001", addedByName: "Dr. Nadia Mouffak", addedByRole: "cardiologist", date: todayYMD, startTime: "08:00", endTime: "08:45", roomType: "meeting_room", roomNumber: "Salle de conf A", clinic: "Clinique Al-Shifa · Casa", notes: "Tour de garde et cas complexes", status: "confirmed" },
  { id: "CE-005", type: "consultation", title: "Consultation neurologique",           patientId: "P-007", patientName: "Hassan Berrada",      doctorId: "DR-005", doctorName: "Dr. Samira Benkirane",  teamIds: ["NRS-004"],          addedById: "DR-005", addedByName: "Dr. Samira Benkirane", addedByRole: "physician", date: todayYMD,           startTime: "14:30", endTime: "15:15", roomType: "consultation", roomNumber: "Salle 4",  clinic: "Polyclinique Atlas · Rabat", notes: "EEG + bilan neurologique FA",        status: "scheduled" },
  { id: "CE-006", type: "imaging",      title: "Radio thorax — Omar Idrissi",        patientId: "P-005", patientName: "Omar Idrissi",        doctorId: "DR-006", doctorName: "Dr. Tariq Benali",     teamIds: [],                   addedById: "NRS-002", addedByName: "Karim El-Ouali",  addedByRole: "nurse",        date: toYMD(addDays(thisMonday,1)), startTime: "09:30", endTime: "10:00", roomType: "imaging", roomNumber: "Radio 1", clinic: "Polyclinique Atlas · Rabat", notes: "Contrôle post résection pulmonaire", status: "scheduled" },
  { id: "CE-007", type: "er",           title: "URGENCE — choc septique",            patientId: "P-007", patientName: "Hassan Berrada",      doctorId: "DR-008", doctorName: "Dr. Adil Chraibi",     teamIds: ["NRS-001","DR-002"], addedById: "DR-008", addedByName: "Dr. Adil Chraibi",    addedByRole: "physician",    date: toYMD(addDays(thisMonday,1)), startTime: "07:30", endTime: "09:30", roomType: "er",   roomNumber: "Réa 3",    clinic: "Clinique Ibn Rochd · Casa",  notes: "Prise en charge urgente — équipe réa", status: "done" },
  { id: "CE-008", type: "procedure",    title: "Pose cathéter central",              patientId: "P-009", patientName: "Rachid Ouazzani",     doctorId: "DR-002", doctorName: "Dr. Hassan Qassem",    teamIds: ["NRS-003"],          addedById: "DR-002", addedByName: "Dr. Hassan Qassem", addedByRole: "physician",    date: toYMD(addDays(thisMonday,1)), startTime: "11:30", endTime: "12:30", roomType: "surgery", roomNumber: "Bloc 3", clinic: "Clinique Ibn Rochd · Casa",  notes: "Cathéter veineux central sous écho", status: "scheduled" },
  { id: "CE-009", type: "consultation", title: "Consultation cardio de suivi",       patientId: "P-004", patientName: "Amina Tazi",          doctorId: "DR-003", doctorName: "Dr. Leila Amrani",     teamIds: ["NRS-002"],          addedById: "NRS-002", addedByName: "Karim El-Ouali",  addedByRole: "nurse",        date: toYMD(addDays(thisMonday,2)), startTime: "10:00", endTime: "10:45", roomType: "consultation", roomNumber: "Salle 2", clinic: "Polyclinique Atlas · Rabat", notes: "Stent coronaire J+60, ECG + écho",   status: "scheduled" },
  { id: "CE-010", type: "surgery",      title: "Résection colique — programme",      patientId: "P-006", patientName: "Khadija Mansouri",    doctorId: "DR-007", doctorName: "Dr. Fatima-Zohra Alj", teamIds: ["DR-008","NRS-001"], addedById: "DR-007", addedByName: "Dr. Fatima-Zohra Alj", addedByRole: "physician", date: toYMD(addDays(thisMonday,2)), startTime: "08:30", endTime: "12:00", roomType: "surgery", roomNumber: "Bloc 1", clinic: "Clinique Al-Shifa · Casa", notes: "Résection côlon droit, laparoscopie",  status: "confirmed" },
  { id: "CE-011", type: "team_meeting", title: "Staff meeting multidisciplinaire",   patientId: undefined, patientName: undefined,          doctorId: "DR-002", doctorName: "Dr. Hassan Qassem",    teamIds: ["DR-001","DR-003","DR-005","DR-006","NRS-001","NRS-002","NRS-003","NRS-004"], addedById: "admin", addedByName: "Admin RPM", addedByRole: "admin", date: toYMD(addDays(thisMonday,3)), startTime: "07:30", endTime: "08:30", roomType: "meeting_room", roomNumber: "Amphi B", clinic: "Clinique Al-Shifa · Casa", notes: "Présentation cas complexes de la semaine", status: "scheduled" },
  { id: "CE-012", type: "follow_up",    title: "Suivi vasculaire — Rachid Ouazzani", patientId: "P-009", patientName: "Rachid Ouazzani",     doctorId: "DR-002", doctorName: "Dr. Hassan Qassem",    teamIds: ["NRS-003"],          addedById: "NRS-003", addedByName: "Souad Rachidi",   addedByRole: "nurse",        date: toYMD(addDays(thisMonday,4)), startTime: "15:00", endTime: "15:30", roomType: "consultation", roomNumber: "Salle 5",  clinic: "Clinique Ibn Rochd · Casa",  notes: "Stent aortique J+21, echo doppler",  status: "scheduled" },
  { id: "CE-013", type: "imaging",      title: "IRM cérébrale — H. Berrada",         patientId: "P-007", patientName: "Hassan Berrada",      doctorId: "DR-005", doctorName: "Dr. Samira Benkirane",  teamIds: [],                   addedById: "DR-005", addedByName: "Dr. Samira Benkirane", addedByRole: "physician", date: toYMD(addDays(thisMonday,4)), startTime: "13:00", endTime: "14:30", roomType: "imaging", roomNumber: "IRM 1",  clinic: "Polyclinique Atlas · Rabat", notes: "IRM sans injection — AVC ischémique?", status: "scheduled" },
  { id: "CE-014", type: "consultation", title: "Pneumo post résection — O. Idrissi", patientId: "P-005", patientName: "Omar Idrissi",        doctorId: "DR-006", doctorName: "Dr. Tariq Benali",     teamIds: ["NRS-002"],          addedById: "DR-006", addedByName: "Dr. Tariq Benali",    addedByRole: "physician",    date: toYMD(addDays(thisMonday,5)), startTime: "11:00", endTime: "11:45", roomType: "consultation", roomNumber: "Salle 6", clinic: "Clinique Ibn Rochd · Casa", notes: "Spirométrie + Radio de contrôle",     status: "scheduled" },
];

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
    { id: "N-001", patientId: "P-002", patientName: "Fatima Benali",    risk: "extreme", message: "SpO₂ 87% · FC 124 bpm — ALERTE CRITIQUE", detail: "Saturation dangereusement basse post-valve repair. SAMU notifié automatiquement.", time: t(4),  read: false, spo2: 87,  hr: 124, bpSys: 149, bpDia: 96, assignedDoctorId: "DR-001", assignedNurseId: "NRS-001", gpsLat: 33.5890, gpsLng: -7.6254, address: "45 Bd Zerktouni, Maarif, Casablanca", visibleToRoles: ["admin","nurse","cardiologist","physician"] },
    { id: "N-002", patientId: "P-007", patientName: "Hassan Berrada",   risk: "high",    message: "FC 128 bpm — FA persistante malgré traitement", detail: "Amiodarone + Métoprolol insuffisants. Cardioversion à envisager.", time: t(12), read: false, spo2: 91,  hr: 128, bpSys: 156, bpDia: 99, assignedDoctorId: "DR-002", assignedNurseId: "NRS-001", gpsLat: 33.5842, gpsLng: -7.6181, address: "32 Rue d'Agadir, Maarif, Casablanca", visibleToRoles: ["admin","nurse","cardiologist","physician"] },
    { id: "N-003", patientId: "P-005", patientName: "Omar Idrissi",     risk: "nurse",   message: "Batterie dispositif 12% — connexion en danger", detail: "Patient contacté. Branchement en cours. SpO₂ 92% stable.", time: t(28), read: false, spo2: 92,  hr: 96,  bpSys: 138, bpDia: 90, assignedDoctorId: "DR-002", assignedNurseId: "NRS-002", gpsLat: 33.9681, gpsLng: -6.8574, address: "5 Allée des Roses, Hay Riad, Rabat", visibleToRoles: ["admin","nurse","technician"] },
    { id: "N-004", patientId: "P-009", patientName: "Rachid Ouazzani",  risk: "nurse",   message: "Signal perdu 4 min — patient hors domicile", detail: "Contact téléphonique établi. Patient de retour à domicile.", time: t(41), read: true,  spo2: 96,  hr: 78,  bpSys: 138, bpDia: 88, assignedDoctorId: "DR-001", assignedNurseId: "NRS-001", gpsLat: 33.5989, gpsLng: -7.6522, address: "91 Bd d'Anfa, Anfa, Casablanca", visibleToRoles: ["admin","nurse","technician"] },
    { id: "N-005", patientId: "P-003", patientName: "Youssef Chakir",   risk: "stable",  message: "Rappel: Radio contrôle PTH J+45 non confirmée", detail: "RDV radiologie 2026-08-22 — confirmation du patient en attente.", time: t(95), read: true,  spo2: 95,  hr: 84,  bpSys: 134, bpDia: 86, assignedDoctorId: "DR-002", assignedNurseId: "NRS-002", gpsLat: 34.0085, gpsLng: -6.8517, address: "8 Avenue Hassan II, Agdal, Rabat", visibleToRoles: ["admin","cardiologist","physician"] },
  ];
};

export const SPECIALTY_LABELS: Record<string, string> = {
  "tous":               "Tous les rôles",
  "soins infirmiers":   "Infirmier(e)s",
  "cardiologie":        "Cardiologie",
  "médecine générale":  "Médecine générale",
  "orthopédie":         "Orthopédie",
  "neurologie":         "Neurologie",
  "pneumologie":        "Pneumologie",
  "chirurgie générale": "Chirurgie générale",
  "réanimation":        "Réanimation",
};

