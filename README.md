# 🩺 RPM Morocco — B2B Health-Tech Remote Patient Monitoring Platform

Production-ready, full-stack B2B Remote Patient Monitoring (RPM) platform engineered for clinic chains and hospital networks in Morocco. 

---

## 🏗️ 1. Architecture & Tech Stack Selection

| Component | Technology | Rationale & Selection Criteria |
| :--- | :--- | :--- |
| **Frontend** | **React 18 + Vite + TypeScript + Tailwind v4 + Radix UI** | Rebuilt directly from the Figma design bundle with zero visual loss, ultra-fast HMR, lightweight asset bundle suitable for clinical networks. |
| **Backend API** | **Node.js + Express + TypeScript** | Standard, battle-tested REST & Server-Sent Events (SSE) streaming API sharing TypeScript types with the frontend. |
| **Database** | **PostgreSQL + Prisma ORM** *(Zero-config SQLite fallback for local dev)* | Strict ACID compliance, relational integrity (Patients ↔ Staff ↔ Vitals ↔ Records ↔ Appointments), and GPS spatial capabilities. |
| **Authentication** | **JWT with HttpOnly / Secure / SameSite Cookies + bcrypt** | Implements Role-Based Access Control (RBAC) across 5 clinical roles (`admin`, `cardiologist`, `physician`, `nurse`, `technician`, `patient`). |
| **Hosting** | **Google Cloud Run / Render / Vercel / Railway** | Containerized serverless execution with auto-scaling, zero idle cost, and automatic SSL. |

---

## 📊 2. Entity-Relationship & Data Model Overview

```
 [User] (id, email, passwordHash, role, clinic, patientId)
    │
    ▼ 1:1
 [Patient] (id, name, age, condition, ward, spo2, hr, bpSys, bpDia, alert, thresholdSpo2, thresholdHrHigh)
    ├──► 1:N [VitalLog] (id, patientId, timestamp, spo2, hr, bpSys, bpDia, riskLevel)
    ├──► 1:N [Appointment] (id, patientId, doctorId, type, date, time, duration, status)
    ├──► 1:1 [MedRecord] (patientId, bloodType, allergies, emergencyContact, gpsLat, gpsLng)
    │         ├──► 1:N [Medication] (id, name, dose, freq, indication)
    │         ├──► 1:N [ClinicalNote] (id, author, role, date, text, tags)
    │         └──► 1:N [ChatMessage] (id, from, role, text, time, isStaff)
 [Staff] (id, name, role, specialty, clinic, status, statusNote, phone, pager)
 [AuditLog] (id, timestamp, userId, userRole, action, targetEntity, details)
```

---

## 🔒 3. Cybersecurity Hardening Matrix

| Security Protection | Implementation Method | Status |
| :--- | :--- | :--- |
| **Input Sanitization** | Automatic HTML & SQL entity escaping on all incoming request bodies (`sanitizeRequestBody` middleware). | ✅ Applied |
| **XSS Protection** | Output encoding + Strict Content-Security-Policy (CSP) headers + `X-XSS-Protection: 1; mode=block`. | ✅ Applied |
| **CSRF & Cookie Theft** | JWT stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies (inaccessible via JavaScript). | ✅ Applied |
| **Rate Limiting** | `express-rate-limit` restricting auth endpoints (10 req / 15m) and global API (150 req / 1m). | ✅ Applied |
| **RBAC Authorization** | Route-level permission checks (`authorize(["admin", "nurse", ...])`). | ✅ Applied |
| **Medication Safety** | Automated allergy ↔ drug conflict detector (`checkMedicationSafety`) preventing dangerous prescriptions. | ✅ Applied |
| **Audit Logging** | Complete audit trail logged to `AuditLog` table on all patient creation, threshold tuning, and logins. | ✅ Applied |

---

## 🚀 4. How to Run Locally

### Prerequisites
- Node.js v18+ and `npm`

### Step 1: Install Dependencies
```bash
# Install root/frontend dependencies
npm i

# Install backend server dependencies
cd server && npm i && cd ..
```

### Step 2: Start Backend Server (Port 5000)
```bash
cd server
npm run dev
```
*Output:*
```text
 🩺 RPM MOROCCO B2B API SERVER RUNNING ON PORT 5000
 🏥 Health Check: http://localhost:5000/health
 🔒 Security: Rate Limiter, Helmet CSP, XSS Sanitizer Active
```

### Step 3: Start Frontend Dev Server (Port 5173)
In a second terminal window:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 5. Running Automated Tests

Run unit and integration tests covering Authentication, Patient CRUD, Alert Thresholds, and Medication Safety:

```bash
cd server
npm test
```

*Test Coverage Highlights:*
- Password hashing & JWT payload validation
- `/health` endpoint status
- Patient threshold tuning & alert acknowledgment
- Penicillin ↔ Amoxicilline allergy conflict detection

---

## 🌐 6. Deploying & Connecting Custom Domain

### Deploying Backend & Database (Google Cloud Run / Render)
1. **Database**: Provision a managed PostgreSQL instance (e.g. Supabase, Render PostgreSQL, Cloud SQL).
2. **Container Build**: Build using the included `Dockerfile` or push to Google Cloud Artifact Registry:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/rpm-backend
   gcloud run deploy rpm-backend --image gcr.io/YOUR_PROJECT_ID/rpm-backend --platform managed --allow-unauthenticated
   ```
3. Set environment variables:
   - `DATABASE_URL`: `postgresql://user:pass@host:5432/rpm_db`
   - `JWT_SECRET`: A long random secret key
   - `CLIENT_ORIGIN`: `https://myapp.com`

### Deploying Frontend (Vercel / Netlify)
1. Push repository to GitHub.
2. Connect repository to Vercel/Netlify.
3. Set `VITE_API_BASE_URL` to `https://rpm-backend-xyz.a.run.app/api`.

### Connecting Custom Domain (`myapp.com`)
1. **DNS Records (at your domain registrar Namecheap/GoDaddy/Cloudflare):**
   - `A` Record: `@` → Point to host IP or `76.76.21.21` (Vercel)
   - `CNAME` Record: `www` → `cname.vercel-dns.com`
   - `CNAME` Record: `api` → `rpm-backend-xyz.a.run.app` (Cloud Run custom domain)
2. **SSL Certificate**: Automatic via Let's Encrypt / Vercel SSL / Cloud Run Managed SSL.

---

## 🩺 7. Health Check & Monitoring

- **Health Check Endpoint**: `GET /health`
  ```json
  {
    "status": "HEALTHY",
    "service": "RPM Morocco B2B Platform Backend",
    "timestamp": "2026-08-27T15:00:00.000Z",
    "uptimeSeconds": 1420,
    "database": "ONLINE (Connected)",
    "activePatients": 9
  }
  ```

---

## ✅ 8. Handover Checklist: Completed vs Manual Config

### Completed by Agent:
- [x] Full Figma screen conversion to responsive React components
- [x] Database Schema & ER relational model designed
- [x] Express + TypeScript REST API & Server-Sent Events (SSE) live vitals streaming
- [x] JWT cookie authentication & 5-role RBAC authorization
- [x] Cybersecurity hardening (Helmet, rate limiting, XSS sanitization, HttpOnly cookies)
- [x] Medication safety allergy conflict detector
- [x] Automated Jest unit & integration test suite
- [x] GitHub Actions CI/CD pipeline workflow (`ci-cd.yml`)
- [x] Production Dockerfile & docker-compose configuration
- [x] Health check endpoint (`/health`)

### To Configure Manually by You:
1. **Domain Purchase**: Register your domain (e.g. `rpm-morocco.com`) on Cloudflare / Namecheap.
2. **Production Hosting**: Deploy container to Google Cloud Run / Render and set `DATABASE_URL` for PostgreSQL.
3. **Third-Party API Keys**: Insert real Twilio / SMS Gateway API keys if SMS notifications are enabled.