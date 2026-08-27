import { Response } from "express";
import { db } from "../db/database";
import { AuthenticatedRequest } from "../middleware/auth";
import { checkMedicationSafety } from "../utils/allergyDetector";

export function getMedRecord(req: AuthenticatedRequest, res: Response) {
  const { patientId } = req.params;
  if (req.user?.role === "patient" && req.user.patientId !== patientId) {
    return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You can only access your own medical record." } });
  }
  const record = db.getMedRecord(patientId);
  if (!record) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Medical record not found." } });
  }
  return res.json({ success: true, data: record });
}

export function addClinicalNote(req: AuthenticatedRequest, res: Response) {
  const { patientId } = req.params;
  const { text, tags } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Note text is required." } });
  }
  const note = db.addClinicalNote(patientId, { author: req.user!.name, role: req.user!.role, text, tags: tags || ["Routine"] });
  if (!note) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Medical record not found." } });
  }
  return res.status(201).json({ success: true, data: note });
}

export function addChatMessage(req: AuthenticatedRequest, res: Response) {
  const { patientId } = req.params;
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Message text is required." } });
  }
  const isStaff = req.user!.role !== "patient";
  const msg = db.addChatMessage(patientId, { from: req.user!.name, role: req.user!.role, text, isStaff });
  if (!msg) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Medical record not found." } });
  }
  return res.status(201).json({ success: true, data: msg });
}

export function checkMedication(req: AuthenticatedRequest, res: Response) {
  const { patientId } = req.params;
  const { medName } = req.body;
  const record = db.getMedRecord(patientId);
  if (!record) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Medical record not found." } });
  }
  const result = checkMedicationSafety(medName, record.allergies);
  return res.json({ success: true, data: result });
}
