import {
  Patient, SEED, CREDS, LoggedUser, MedRecord, MED_RECORDS,
  STAFF_SEED, StaffMember, APPT_SEED, Appointment, genSpark
} from "../shared";

// In-Memory Clinical Database (simulates PostgreSQL)
class ClinicalDatabase {
  private users: Map<string, { id: string; email: string; passHash: string; user: LoggedUser }> = new Map();
  private patients: Map<string, Patient> = new Map();
  private staff: Map<string, StaffMember> = new Map();
  private records: Map<string, MedRecord> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private auditLogs: Array<{ id: string; timestamp: string; userId: string; userRole: string; action: string; details: string }> = [];

  constructor() {
    this.seed();
  }

  private seed() {
    Object.entries(CREDS).forEach(([id, val]) => {
      this.users.set(id.toLowerCase(), {
        id,
        email: `${id.toLowerCase()}@rpm.ma`,
        passHash: val.pass,
        user: val.user
      });
    });

    SEED.forEach(p => this.patients.set(p.id, { ...p }));
    STAFF_SEED.forEach(s => this.staff.set(s.id, { ...s }));
    Object.entries(MED_RECORDS).forEach(([id, rec]) => {
      this.records.set(id, JSON.parse(JSON.stringify(rec)));
    });
    APPT_SEED.forEach(a => this.appointments.set(a.id, { ...a }));
    this.logAudit("SYSTEM", "system", "DATABASE_SEEDED", "Initialized database with RPM Morocco clinical seed data.");
  }

  public logAudit(userId: string, userRole: string, action: string, details: string) {
    const entry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toISOString(),
      userId, userRole, action, details
    };
    this.auditLogs.push(entry);
    return entry;
  }

  public getAuditLogs() { return [...this.auditLogs].reverse(); }

  public getUserByEmailOrId(identifier: string) {
    const key = identifier.toLowerCase().trim();
    for (const entry of this.users.values()) {
      if (entry.id.toLowerCase() === key || entry.email.toLowerCase() === key) return entry;
    }
    return null;
  }

  public createUser(email: string, passHash: string, user: LoggedUser) {
    const entry = { id: user.id, email, passHash, user };
    this.users.set(user.id.toLowerCase(), entry);
    return entry;
  }

  public getAllPatients(): Patient[] { return Array.from(this.patients.values()); }
  public getPatientById(id: string): Patient | undefined { return this.patients.get(id); }

  public addPatient(p: Patient, rec: MedRecord, cred: { id: string; passHash: string; user: LoggedUser }) {
    this.patients.set(p.id, p);
    this.records.set(p.id, rec);
    this.users.set(cred.id.toLowerCase(), { id: cred.id, email: `${cred.id.toLowerCase()}@rpm.ma`, passHash: cred.passHash, user: cred.user });
    this.logAudit(cred.user.id, cred.user.role, "PATIENT_CREATED", `Added patient ${p.name} (${p.id})`);
    return p;
  }

  public updatePatientThresholds(id: string, spo2: number, hrHigh: number, userId: string, role: string) {
    const p = this.patients.get(id);
    if (!p) return null;
    p.thresholdSpo2 = spo2;
    p.thresholdHrHigh = hrHigh;
    this.patients.set(id, p);
    this.logAudit(userId, role, "THRESHOLD_UPDATE", `Updated thresholds for ${id}: SpO2 min ${spo2}%, HR max ${hrHigh} bpm`);
    return p;
  }

  public acknowledgeAlert(id: string, userId: string, role: string) {
    const p = this.patients.get(id);
    if (!p) return null;
    p.alert = false;
    p.acknowledged = true;
    p.alertType = "";
    this.patients.set(id, p);
    this.logAudit(userId, role, "ALERT_ACKNOWLEDGED", `Alert acknowledged for patient ${id}`);
    return p;
  }

  public updateTelemetry(id: string, spo2: number, hr: number, bpSys: number, bpDia: number) {
    const p = this.patients.get(id);
    if (!p) return null;
    p.spo2 = spo2;
    p.hr = hr;
    p.bpSys = bpSys;
    p.bpDia = bpDia;

    const alertFired = (spo2 < p.thresholdSpo2 || hr > p.thresholdHrHigh) && !p.acknowledged;
    p.alert = alertFired;
    if (alertFired) {
      p.alertType = spo2 < p.thresholdSpo2 ? "SpO₂ CRITICAL" : "HR ELEVATED";
    }

    const nextIdx = p.spo2Data.length > 0 ? p.spo2Data[p.spo2Data.length - 1].i + 1 : 0;
    p.spo2Data = [...p.spo2Data.slice(1), { v: spo2, i: nextIdx }];
    p.hrData = [...p.hrData.slice(1), { v: hr, i: nextIdx }];
    p.bpData = [...p.bpData.slice(1), { v: bpSys, i: nextIdx }];
    this.patients.set(id, p);
    return p;
  }

  public getAllStaff(): StaffMember[] { return Array.from(this.staff.values()); }

  public updateStaffStatus(id: string, status: any, statusNote: string, userId: string, role: string) {
    const s = this.staff.get(id);
    if (!s) return null;
    s.status = status;
    s.statusNote = statusNote;
    this.staff.set(id, s);
    this.logAudit(userId, role, "STAFF_STATUS_UPDATE", `Updated staff ${id} status to ${status}`);
    return s;
  }

  public getMedRecord(patientId: string): MedRecord | undefined { return this.records.get(patientId); }

  public addClinicalNote(patientId: string, note: { author: string; role: string; text: string; tags: string[] }) {
    const rec = this.records.get(patientId);
    if (!rec) return null;
    const newNote = {
      id: `n${Date.now()}`, author: note.author, role: note.role,
      date: new Date().toLocaleString("fr-FR"), text: note.text, tags: note.tags
    };
    rec.notes.unshift(newNote);
    this.records.set(patientId, rec);
    return newNote;
  }

  public addChatMessage(patientId: string, msg: { from: string; role: string; text: string; isStaff: boolean }) {
    const rec = this.records.get(patientId);
    if (!rec) return null;
    const newMsg = {
      id: `m${Date.now()}`, from: msg.from, role: msg.role, text: msg.text,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), isStaff: msg.isStaff
    };
    rec.messages.push(newMsg);
    this.records.set(patientId, rec);
    return newMsg;
  }

  public getAllAppointments(): Appointment[] { return Array.from(this.appointments.values()); }

  public addAppointment(appt: Appointment, userId: string, role: string) {
    this.appointments.set(appt.id, appt);
    this.logAudit(userId, role, "APPOINTMENT_CREATED", `Created appointment ${appt.title} for patient ${appt.patientId}`);
    return appt;
  }
}

export const db = new ClinicalDatabase();
