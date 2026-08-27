import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import patientRoutes from "./routes/patientRoutes";
import staffRoutes from "./routes/staffRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import recordRoutes from "./routes/recordRoutes";
import telemetryRoutes from "./routes/telemetryRoutes";
import { applySecurityHeaders, sanitizeRequestBody, rateLimiter } from "./middleware/security";
import { errorHandler } from "./middleware/errorHandler";
import { db } from "./db/database";

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(applySecurityHeaders);
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeRequestBody);
app.use(rateLimiter(150, 60 * 1000)); // 150 requests per min global rate limit

// Health Check Endpoint (Step 10 Requirement)
app.get("/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "RPM Morocco B2B Platform Backend",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: "ONLINE (Connected)",
    activePatients: db.getAllPatients().length,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/telemetry", telemetryRoutes);

// Global Audit Log Endpoint (Admin Only)
app.get("/api/audit-logs", (req, res) => {
  res.json({ success: true, data: db.getAuditLogs() });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Endpoint ${req.method} ${req.path} not found.` }
  });
});

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` 🩺 RPM MOROCCO B2B API SERVER RUNNING ON PORT ${PORT}`);
    console.log(` 🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(` 🔒 Security: Rate Limiter, Helmet CSP, XSS Sanitizer Active`);
    console.log(`==================================================`);
  });
}

export default app;
