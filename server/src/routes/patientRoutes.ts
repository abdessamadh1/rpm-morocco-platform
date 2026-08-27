import { Router } from "express";
import { getPatients, getPatientById, updateThresholds, acknowledgeAlert, addPatient } from "../controllers/patientController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getPatients);
router.post("/", authorize(["admin", "nurse"]), addPatient);
router.get("/:id", getPatientById);
router.put("/:id/thresholds", authorize(["admin", "nurse", "cardiologist", "physician"]), updateThresholds);
router.post("/:id/acknowledge", authorize(["admin", "nurse", "cardiologist", "physician"]), acknowledgeAlert);

export default router;
