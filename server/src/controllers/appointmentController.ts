import { Response } from "express";
import { db } from "../db/database";
import { AuthenticatedRequest } from "../middleware/auth";
import { Appointment } from "../shared";

export function getAppointments(req: AuthenticatedRequest, res: Response) {
  const appts = db.getAllAppointments();
  if (req.user?.role === "patient" && req.user.patientId) {
    const pAppts = appts.filter(a => a.patientId === req.user?.patientId);
    return res.json({ success: true, data: pAppts });
  }
  return res.json({ success: true, data: appts });
}

export function createAppointment(req: AuthenticatedRequest, res: Response) {
  const { patientId, doctorId, doctorName, type, title, date, time, duration, location, notes } = req.body;
  if (!patientId || !doctorId || !title || !date || !time) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Missing required appointment fields." } });
  }
  const newAppt: Appointment = {
    id: `APT-${Date.now()}`, patientId, doctorId,
    doctorName: doctorName || "Médecin RPM", type: type || "consultation",
    title, date, time, duration: Number(duration) || 30,
    location: location || "Cabinet Medical", notes: notes || "",
    status: "scheduled", createdBy: req.user!.id, createdAt: new Date().toLocaleString("fr-FR")
  };
  db.addAppointment(newAppt, req.user!.id, req.user!.role);
  return res.status(201).json({ success: true, data: newAppt });
}
