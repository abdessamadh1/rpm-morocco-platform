import { Router } from "express";
import { login, logout, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { rateLimiter } from "../middleware/security";

const router = Router();

router.post("/login", rateLimiter(10, 15 * 60 * 1000), login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
