import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "rpm_morocco_super_secret_production_key_2026";
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  clinic: string;
  patientId?: string;
  name: string;
  iat: number;
  exp: number;
}

function base64urlEncode(str: string): string {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString("utf8");
}

export function hashPassword(password: string): string {
  const salt = "rpm_salt_2026";
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash || password === hash;
}

export function generateToken(user: { id: string; name: string; role: string; clinic: string; patientId?: string }, email: string = ""): string {
  const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Date.now();
  const payload: JWTPayload = {
    id: user.id,
    email: email || `${user.id.toLowerCase()}@rpm.ma`,
    role: user.role,
    clinic: user.clinic,
    patientId: user.patientId,
    name: user.name,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + TOKEN_EXPIRY_MS) / 1000),
  };
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${encodedPayload}`).digest("base64url");
  return `${header}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expectedSig) return null;
    const parsedPayload: JWTPayload = JSON.parse(base64urlDecode(payload));
    if (Date.now() / 1000 > parsedPayload.exp) return null;
    return parsedPayload;
  } catch { return null; }
}

export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  if (Array.isArray(input)) return input.map(sanitizeInput);
  if (typeof input === "object" && input !== null) {
    const o: Record<string, any> = {};
    for (const key of Object.keys(input)) o[key] = sanitizeInput(input[key]);
    return o;
  }
  return input;
}
