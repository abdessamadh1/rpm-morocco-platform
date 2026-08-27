import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "../utils/security";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required. Please log in." }
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Session expired or invalid token." }
    });
  }

  req.user = payload;
  next();
}

export function authorize(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required." }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Role '${req.user.role}' is not authorized for this operation.`
        }
      });
    }

    next();
  };
}
