import { Response } from "express";
import { db } from "../db/database";
import { AuthenticatedRequest } from "../middleware/auth";
import { Patient, MedRecord, LoggedUser, genSpark } from "../shared";

export function getPatients(req: AuthenticatedRequest, res: Response) {
  const patients = db.getAllPatients();
  if (req.user?.role === "patient" && req.user.patientId) {
    const p = patients.filter(pt => pt.id === req.user?.patientId);
    return res.json({ success: true, data: p });
  }
  return res.json({ success: true, data: patients });
}

export function getPatientById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const patient = db.getPatientById(id);
  if (!patient) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found." } });
  }
  return res.json({ success: true, data: patient });
}

export function updateThresholds(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { spo2, hrHigh } = req.body;
  if (typeof spo2 !== "number" || typeof hrHigh !== "number") {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "spo2 and hrHigh must be numeric." } });
  }
  const updated = db.updatePatientThresholds(id, spo2, hrHigh, req.user!.id, req.user!.role);
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found." } });
  }
  return res.json({ success: true, data: updated });
}

export function acknowledgeAlert(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const updated = db.acknowledgeAlert(id, req.user!.id, req.user!.role);
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found." } });
  }
  return res.json({ success: true, data: updated });
}

export function addPatient(req: AuthenticatedRequest, res: Response) {
  const { firstName, lastName, age, condition, ward, bloodType, allergies, emergencyContact, emergencyPhone, address, insurance, subscriptionPlan } = req.body;

  if (!firstName || !lastName || !age || !condition) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Missing required patient fields." } });
  }

  const allPatients = db.getAllPatients();
  const nextNum = allPatients.length + 1;
  const padded = String(nextNum).padStart(3, "0");
  const newId = `P-${padded}`;
  const fullName = `${firstName.trim()} ${lastName.trim()}`;

  const newPatient: Patient = {
    id: newId, name: fullName, age: Number(age), condition: condition.trim(),
    ward: ward || "Cardio", spo2: 97, hr: 72, bpSys: 120, bpDia: 78,
    alert: false, alertType: "", acknowledged: false,
    spo2Data: genSpark(97, 1), hrData: genSpark(72, 5), bpData: genSpark(120, 5),
    thresholdSpo2: 90, thresholdHrHigh: 110
  };

  const newRec: MedRecord = {
    patientId: newId, bloodType: bloodType || "A+",
    allergies: allergies ? allergies.split(",").map((a: string) => a.trim()).filter(Boolean) : [],
    emergencyContact: emergencyContact || "", emergencyPhone: emergencyPhone || "",
    address: address || "Casablanca, Morocco", gpsLat: 33.5731, gpsLng: -7.5898,
    insurance: insurance || "", subscriptionPlan: subscriptionPlan || "RPM Standard",
    deviceId: `DEV-${padded}`, medications: [],
    notes: [{ id: `n-${Date.now()}`, author: req.user!.name, role: req.user!.role, date: new Date().toLocaleString("fr-FR"), text: `Patient ${fullName} enregistré.`, tags: ["Admission"] }],
    messages: []
  };

  const userObj: LoggedUser = { id: newId, name: fullName, role: "patient", clinic: req.user!.clinic || "RPM Morocco", patientId: newId };
  db.addPatient(newPatient, newRec, { id: newId, passHash: "patient2026", user: userObj });
  return res.status(201).json({ success: true, data: { patient: newPatient, record: newRec } });
}
