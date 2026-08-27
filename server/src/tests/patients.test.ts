import request from "supertest";
import app from "../index";
import { generateToken } from "../utils/security";

describe("Patient Management Integration Tests", () => {
  let doctorToken: string;

  beforeAll(() => {
    doctorToken = generateToken({
      id: "DR-001",
      name: "Dr. Nadia Mouffak",
      role: "cardiologist",
      clinic: "Clinique Al-Shifa"
    });
  });

  test("GET /api/patients returns patient list", async () => {
    const res = await request(app)
      .get("/api/patients")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("PUT /api/patients/:id/thresholds updates SpO2 and HR thresholds", async () => {
    const res = await request(app)
      .put("/api/patients/P-001/thresholds")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ spo2: 92, hrHigh: 115 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.thresholdSpo2).toBe(92);
    expect(res.body.data.thresholdHrHigh).toBe(115);
  });

  test("POST /api/patients/:id/acknowledge clears active alert", async () => {
    const res = await request(app)
      .post("/api/patients/P-002/acknowledge")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.alert).toBe(false);
  });
});
