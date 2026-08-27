import { Router } from "express";
import { getAppointments, createAppointment } from "../controllers/appointmentController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getAppointments);
router.post("/", createAppointment);

export default router;
