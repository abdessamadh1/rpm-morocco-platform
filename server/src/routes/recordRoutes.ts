import { Router } from "express";
import { getMedRecord, addClinicalNote, addChatMessage, checkMedication } from "../controllers/recordController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/:patientId", getMedRecord);
router.post("/:patientId/notes", addClinicalNote);
router.post("/:patientId/messages", addChatMessage);
router.post("/:patientId/check-medication", checkMedication);

export default router;
