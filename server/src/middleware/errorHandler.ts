import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[API Error] ${req.method} ${req.path}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: message,
      ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
    }
  });
}
