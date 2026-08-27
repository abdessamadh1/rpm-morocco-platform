import { Request, Response } from "express";
import { db } from "../db/database";
import { generateToken, verifyPassword } from "../utils/security";
import { AuthenticatedRequest } from "../middleware/auth";

export function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Username/ID and password are required." }
    });
  }

  const userEntry = db.getUserByEmailOrId(username);

  if (!userEntry || !verifyPassword(password, userEntry.passHash)) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Invalid username/ID or password." }
    });
  }

  const token = generateToken(userEntry.user, userEntry.email);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  db.logAudit(userEntry.user.id, userEntry.user.role, "USER_LOGIN", `User ${userEntry.user.name} logged in.`);

  return res.json({
    success: true,
    data: { token, user: userEntry.user }
  });
}

export function logout(req: AuthenticatedRequest, res: Response) {
  if (req.user) {
    db.logAudit(req.user.id, req.user.role, "USER_LOGOUT", `User ${req.user.name} logged out.`);
  }
  res.clearCookie("token");
  return res.json({ success: true, message: "Logged out successfully." });
}

export function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
  }
  return res.json({ success: true, data: { user: req.user } });
}
