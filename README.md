<div align="center">

# 🛡️ SecureVault

### A Full-Stack Password Vault & Credential Management System

**Spring Boot · React · PostgreSQL · Redis · Docker**

Securely store, organise, generate, share and monitor credentials through
encrypted vaults — with MFA, threat detection, audit logging and password-health analytics.

### 🔗 Live Demo

**▶️ App:** https://securevault-singh28priyankas-projects.vercel.app &nbsp;·&nbsp; **API:** https://securevault-backend-29v1.onrender.com/api/health

Sign in with the demo account: **`demo@securevault.io`** / **`Demo@12345`**
_(First load after idle can take ~50s while the free-tier backend wakes up.)_

Frontend on **Vercel** · Backend + PostgreSQL on **Render**.

</div>

---

## ✨ Features

| Module | Highlights |
| --- | --- |
| **Authentication & Access Control** | Registration, JWT login, **TOTP multi-factor auth**, silent token refresh, role-based access (`USER` / `TEAM_MEMBER` / `ADMIN`) |
| **Password Vault** | AES-256-GCM encrypted secrets, 7 credential types, categories, search, filtering, favourites, secure notes |
| **Password Generator** | Cryptographically-strong generation, custom rules, look-alike exclusion, live strength + entropy analysis |
| **Secure Sharing** | Share credentials with **View / Edit / Full-control** permissions, temporary (expiring) access, revocation |
| **Encryption & Security** | AES-256-GCM at rest, BCrypt (work factor 12) hashing, authenticated + tamper-evident ciphertext |
| **Security Monitoring** | Login tracking, **anomaly detection** (brute-force, new-device), device management, real-time alerts |
| **Audit Logging** | Immutable trail of every action, paginated view, **Excel export** |
| **Notifications** | In-app notifications + email hooks (login, security, sharing, expiry, risk) |
| **Analytics Dashboard** | Password-health score, strength distribution, login trends, admin platform metrics |
| **Reports & Export** | Password-health **PDF** report, audit-log **Excel** workbook |

## 🎨 Design

A custom **"Aurora"** dark theme — a deep indigo night sky lit with teal, cyan,
violet and amber accents. Frosted-glass surfaces, gradient brand marks, animated
health ring and Recharts visualisations. No off-the-shelf component kit.

## 🧱 Tech Stack

**Backend** — Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA / Hibernate,
JWT (jjwt), TOTP, OpenPDF, Apache POI, Maven.
**Frontend** — React 18, Vite, Redux Toolkit, React Router, Axios, Tailwind CSS, Recharts.
**Data** — PostgreSQL (prod) / H2 (dev), Redis cache.
**Ops** — Docker, Docker Compose, Nginx.

---

## 🚀 Quick Start

### Option A — Run locally (no Docker, zero external setup)

The backend defaults to an **in-memory H2 database** and seeds demo data on start.

```bash
# 1) Backend  → http://localhost:8080
cd backend
mvn spring-boot:run

# 2) Frontend → http://localhost:5173   (in a second terminal)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and sign in with a demo account below.

### Option B — Full stack with Docker (PostgreSQL + Redis)

```bash
docker compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:8080
```

### 🔑 Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| **User** (start here) | `demo@securevault.io` | `Demo@12345` |
| Admin | `admin@securevault.io` | `Admin@12345` |
| Team Member | `team@securevault.io` | `Team@12345` |

---

## 🗂️ Project Structure

```
secure vault/
├── backend/                       # Spring Boot API
│   └── src/main/java/com/securevault/
│       ├── config/                # Security, CORS, data seeder
│       ├── controller/            # REST endpoints (11 modules)
│       ├── dto/                   # Request/response records
│       ├── entity/                # JPA entities
│       ├── repository/            # Spring Data repositories
│       ├── security/              # JWT service, filter, principal
│       └── service/               # Encryption, vault, MFA, monitoring, analytics, reports…
├── frontend/                      # React + Vite + Tailwind
│   └── src/
│       ├── api/                   # Axios client + endpoints
│       ├── store/                 # Redux Toolkit slices
│       ├── components/            # UI kit (Icon, Modal, charts, layout)
│       └── pages/                 # Login, Dashboard, Vault, Generator, Sharing, Security, Audit, Settings, Admin
├── docker-compose.yml
└── README.md
```

---

## 🔐 Security Notes

- **Vault secrets** are encrypted with **AES-256-GCM** using a random IV per value;
  the stored format is `Base64(IV ‖ ciphertext ‖ auth-tag)` — tamper-evident.
- **Master passwords** are never stored — only **BCrypt** hashes (work factor 12).
- **JWTs** are signed with HMAC-SHA and are short-lived; refresh tokens rotate access tokens.
- The demo `JWT_SECRET` and `VAULT_MASTER_KEY` in config are for local use only —
  **override them via environment variables** in any real deployment.

## 🔌 Key API Endpoints

```
POST /api/auth/register            POST /api/auth/login            GET  /api/auth/me
POST /api/auth/mfa/setup           POST /api/auth/mfa/enable
GET  /api/credentials              POST /api/credentials           GET  /api/credentials/{id}/reveal
POST /api/password/generate        POST /api/password/strength
POST /api/shares                   GET  /api/shares/with-me
GET  /api/security/alerts          GET  /api/security/logins       GET  /api/security/devices
GET  /api/dashboard                GET  /api/admin/dashboard
GET  /api/audit                    GET  /api/reports/password-health.pdf
```

## 🧪 Testing

```bash
cd backend && mvn test        # JUnit unit tests (encryption + password engine)
```

---

## 📅 Milestone Coverage

- **M1 — Setup & Vault:** auth, session management, encrypted credential storage ✅
- **M2 — Encryption & Passwords:** AES workflows, generator, strength checker, sharing & permissions ✅
- **M3 — Monitoring & Analytics:** login monitoring, anomaly detection, alerts, audit logs, dashboards, reports ✅
- **M4 — Testing & Deployment:** unit tests, Dockerised deployment, documentation ✅

<div align="center">
<sub>Built as a full-stack capstone — Spring Boot × React.</sub>
</div>
