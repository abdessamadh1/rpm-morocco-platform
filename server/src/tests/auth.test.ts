import request from "supertest";
import app from "../index";
import { generateToken, verifyToken, hashPassword, verifyPassword } from "../utils/security";

describe("Security & Auth Unit Tests", () => {
  test("hashPassword and verifyPassword verify correctly", () => {
    const rawPass = "doctor2026";
    const hashed = hashPassword(rawPass);
    expect(verifyPassword(rawPass, hashed)).toBe(true);
    expect(verifyPassword("wrongpass", hashed)).toBe(false);
  });

  test("generateToken and verifyToken generate valid JWT payload", () => {
    const dummyUser = { id: "DR-001", name: "Dr. Nadia Mouffak", role: "cardiologist" as const, clinic: "Clinique Al-Shifa" };
    const token = generateToken(dummyUser, "doctor@rpm.ma");
    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.id).toBe("DR-001");
    expect(payload?.role).toBe("cardiologist");
  });

  test("GET /health returns 200 OK and HEALTHY status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("HEALTHY");
    expect(res.body.service).toContain("RPM Morocco");
  });

  test("POST /api/auth/login succeeds with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "DR-001", password: "doctor2026" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe("cardiologist");
  });

  test("POST /api/auth/login fails with invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "DR-001", password: "wrongpassword" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});
