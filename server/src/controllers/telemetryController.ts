import { Request, Response } from "express";
import { db } from "../db/database";
import { AuthenticatedRequest } from "../middleware/auth";
import { clamp } from "../shared";

const sseClients: Response[] = [];

export function streamTelemetry(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);

  const patients = db.getAllPatients();
  res.write(`data: ${JSON.stringify({ type: "INITIAL_SNAPSHOT", patients })}\n\n`);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
}

setInterval(() => {
  if (sseClients.length === 0) return;
  const patients = db.getAllPatients();
  const updatedPatients = patients.map(p => {
    const newSpo2 = clamp(p.spo2 + (Math.random() - 0.5) * 0.6, 82, 100);
    const newHr = clamp(p.hr + (Math.random() - 0.48) * 2, 45, 160);
    const newBp = clamp(p.bpSys + (Math.random() - 0.5) * 1.5, 90, 200);
    return db.updateTelemetry(p.id, Math.round(newSpo2 * 10) / 10, Math.round(newHr), Math.round(newBp), p.bpDia);
  }).filter(Boolean);
  const payload = JSON.stringify({ type: "TELEMETRY_TICK", timestamp: new Date().toISOString(), patients: updatedPatients });
  sseClients.forEach(client => client.write(`data: ${payload}\n\n`));
}, 2500);

export function postManualTelemetry(req: AuthenticatedRequest, res: Response) {
  const { patientId, spo2, hr, bpSys, bpDia } = req.body;
  if (!patientId || typeof spo2 !== "number" || typeof hr !== "number") {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Patient ID, SpO2, and HR are required." } });
  }
  const updated = db.updateTelemetry(patientId, spo2, hr, bpSys || 120, bpDia || 80);
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found." } });
  }
  return res.json({ success: true, data: updated });
}
