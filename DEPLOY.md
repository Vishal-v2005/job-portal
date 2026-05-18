# Deploy: Frontend (Vercel) + Backend (Render)

Use this flow so the live React app talks to the live Django API.

| Part | Host | Example URL |
|------|------|-------------|
| **Frontend** | Vercel | `https://your-project.vercel.app` |
| **Backend API** | Render | `https://job-portal-api.onrender.com` |
| **Django Admin** | Render | `https://job-portal-api.onrender.com/admin/` |

Replace `your-project` and `job-portal-api` with the URLs Render/Vercel give you.

---

## Part 1 — Backend on Render (do this first)

### 1. Push code to GitHub

Your repo must be on GitHub (public or private with Render access).

### 2. Create Render service

1. Open [https://dashboard.render.com](https://dashboard.render.com) and sign in.
2. Click **New +** → **Blueprint**.
3. Connect the **job portal** GitHub repository.
4. Render reads [`render.yaml`](render.yaml) and creates:
   - **PostgreSQL** database `jobportal-db`
   - **Web service** `job-portal-api` (Django)
5. Click **Apply** and wait until the deploy status is **Live** (first build can take 5–10 minutes).

### 3. Copy your API URL

On the `job-portal-api` service page, copy the URL, for example:

`https://job-portal-api.onrender.com`

Test in the browser:

- `https://job-portal-api.onrender.com/api/skills/` → should ask for login or return JSON (401 is OK).

### 4. Create admin user (Render Shell)

1. In Render → **job-portal-api** → **Shell**.
2. Run:

```bash
python manage.py createsuperuser
```

Use **email** + password (your app logs in with email).

3. Optional: set admin role in shell:

```bash
python manage.py shell
```

```python
from accounts.models import User
u = User.objects.get(email="you@example.com")
u.role = "admin"
u.is_staff = True
u.is_superuser = True
u.save()
exit()
```

Admin panel: `https://job-portal-api.onrender.com/admin/`

---

## Part 2 — Frontend on Vercel

### 1. Import project

1. Open [https://vercel.com/new](https://vercel.com/new).
2. **Import** the same GitHub repository.
3. **Root Directory**: leave as repository root (uses root [`vercel.json`](vercel.json)).

### 2. Environment variable (required)

In Vercel project **Settings → Environment Variables**, add:

| Name | Value | Environments |
|------|--------|----------------|
| `VITE_API_URL` | `https://job-portal-api.onrender.com` | Production, Preview, Development |

Use **your** Render URL with **no** trailing slash.

### 3. Deploy

Click **Deploy**. When finished, Vercel shows a URL like:

`https://job-portal-xxxx.vercel.app`

That is your **live app link** for users.

### 4. Connect backend CORS to Vercel

Back on **Render** → **job-portal-api** → **Environment**:

| Key | Value |
|-----|--------|
| `CORS_ALLOWED_ORIGINS` | `https://job-portal-xxxx.vercel.app` |
| `CORS_ALLOW_VERCEL` | `true` |

Save → Render redeploys automatically.

---

## Part 3 — How to use the live site

1. Open your **Vercel URL** (frontend), e.g. `https://job-portal-xxxx.vercel.app`.
2. **Register** as Job Seeker or Recruiter.
3. **Job seeker**
   - Browse jobs → open a job → upload resume on apply → **Apply**.
   - Set skills under **Skills**.
4. **Recruiter**
   - **Post job** → set status **Published** so seekers can see it.
   - **Applications** → view resume, scores, update status.
5. **Admin**
   - Create user in Django admin, set `role` = `admin`.
   - Open **Analytics** in the app.

---

## Quick checklist

- [ ] Render service **Live**
- [ ] `createsuperuser` run on Render
- [ ] Vercel `VITE_API_URL` = Render API URL
- [ ] Render `CORS_ALLOWED_ORIGINS` = Vercel URL
- [ ] Recruiter jobs set to **published**
- [ ] Test register + login on Vercel URL

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend “Network Error” | Check `VITE_API_URL` on Vercel; redeploy after changing it. |
| CORS error in browser | Set `CORS_ALLOWED_ORIGINS` on Render to exact Vercel URL; redeploy Render. |
| 502 / slow first request | Render free tier sleeps after ~15 min idle; first hit wakes it (wait ~1 min). |
| Resume upload fails on Render | Free disk is ephemeral; fine for demo. For production use S3 or similar for `MEDIA_ROOT`. |
| Login fails | Use **email**, not username. Password from registration or `createsuperuser`. |

---

## Local vs production

| | Local | Production |
|---|--------|------------|
| Frontend | `http://localhost:5173` | `https://….vercel.app` |
| API | `http://127.0.0.1:8000` | `https://….onrender.com` |
| Config | `frontend/.env` → `VITE_API_URL` | Vercel env `VITE_API_URL` |
