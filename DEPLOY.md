# 🚀 Deploying SecureVault

SecureVault is split into two deployables:

| Part | Where | Why |
| --- | --- | --- |
| **Frontend** (React/Vite) | **Vercel** | Static SPA — Vercel's sweet spot |
| **Backend** (Spring Boot) + **PostgreSQL** | **Render** | Vercel can't run a long-lived Java server or host a database |

You deploy the **backend first** (to get its URL), then the **frontend**, then connect the two.

---

## 1️⃣ Backend + database → Render

1. Go to **https://dashboard.render.com** and sign in with GitHub.
2. **New ➜ Blueprint**, select the `Singh28priyanka/SecureVault` repo, click **Apply**.
   Render reads [`render.yaml`](./render.yaml) and provisions:
   - a free **PostgreSQL** database (`securevault-db`)
   - the **backend** web service (`securevault-backend`) from `backend/Dockerfile`
3. When prompted for the `CORS_ORIGINS` env var, you can leave it blank for now
   (you'll set it in step 3).
4. Wait for the build to finish, then note the backend URL, e.g.
   **`https://securevault-backend.onrender.com`**.
5. Verify it's alive: open `https://<your-backend>.onrender.com/api/health` → `{"status":"UP"}`.

> First request after idle can take ~50s on Render's free tier (cold start).

---

## 2️⃣ Frontend → Vercel

1. Go to **https://vercel.com/new** and import the same GitHub repo.
2. **Root Directory:** set to **`frontend`** (important — the app lives in a subfolder).
   Vercel auto-detects Vite; [`frontend/vercel.json`](./frontend/vercel.json) handles SPA routing.
3. Add an **Environment Variable**:
   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://<your-backend>.onrender.com/api` |
4. Click **Deploy**. You'll get a URL like **`https://secure-vault.vercel.app`**.

---

## 3️⃣ Connect them (CORS)

1. Back in **Render → securevault-backend → Environment**, set:
   | Key | Value |
   | --- | --- |
   | `CORS_ORIGINS` | `https://secure-vault.vercel.app` |  ← your exact Vercel URL
2. Save — Render redeploys automatically.
3. Open your Vercel URL and sign in with `demo@securevault.io` / `Demo@12345`. 🎉

---

## 🔐 Before going "real"

The blueprint ships **demo** secrets so it works out of the box. For anything beyond a
class demo, rotate these on Render (Environment tab):

- `JWT_SECRET` — a Base64-encoded 256-bit random key
- `VAULT_MASTER_KEY` — a 32-byte random string
  (⚠️ changing this after data exists makes existing encrypted secrets unreadable)

---

## Alternative: one-box Docker (any VPS)

No cloud accounts — runs the whole stack (Postgres + Redis + backend + frontend):

```bash
docker compose up --build
# Frontend → http://localhost:3000   Backend → http://localhost:8080
```
