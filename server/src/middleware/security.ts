import { Request, Response, NextFunction } from "express";
import { sanitizeInput } from "../utils/security";

// Simple Memory Rate Limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests: number = 100, windowMs: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();
    const clientRecord = rateLimitMap.get(ip);

    if (!clientRecord || now > clientRecord.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientRecord.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please try again later."
        }
      });
    }

    clientRecord.count += 1;
    next();
  };
}

export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Baseline Security Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline'");
  next();
}

export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
}
