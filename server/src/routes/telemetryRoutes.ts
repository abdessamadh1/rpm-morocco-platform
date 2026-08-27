import { Router } from "express";
import { streamTelemetry, postManualTelemetry } from "../controllers/telemetryController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/stream", streamTelemetry);
router.post("/update", authenticate, postManualTelemetry);

export default router;
