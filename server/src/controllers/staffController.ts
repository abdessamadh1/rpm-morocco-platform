import { Response } from "express";
import { db } from "../db/database";
import { AuthenticatedRequest } from "../middleware/auth";

export function getStaff(req: AuthenticatedRequest, res: Response) {
  const staff = db.getAllStaff();
  return res.json({ success: true, data: staff });
}

export function updateStaffStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status, statusNote } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Status is required." } });
  }

  const updated = db.updateStaffStatus(id, status, statusNote || "", req.user!.id, req.user!.role);
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Staff member not found." } });
  }

  return res.json({ success: true, data: updated });
}
