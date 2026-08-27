import { Router } from "express";
import { getStaff, updateStaffStatus } from "../controllers/staffController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getStaff);
router.put("/:id/status", updateStaffStatus);

export default router;
