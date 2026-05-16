# Smart Job Portal (React + Django REST + MySQL)

Monorepo layout: `backend/` (Django + DRF + JWT), `frontend/` (Vite + React). The API uses **MySQL** when `MYSQL_*` variables are set in `backend/.env`; otherwise it falls back to **SQLite** for quick local runs.

## Prerequisites

- Python 3.11+
- Node.js LTS
- MySQL 8 (optional if using SQLite fallback)

## MySQL (optional)

Create a database and user, then copy `backend/.env.example` to `backend/.env` and set `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, etc.

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env: set SECRET_KEY; set MYSQL_* or leave MYSQL_DATABASE empty for SQLite
python manage.py migrate
python manage.py seed_skills
python manage.py createsuperuser
python manage.py runserver
```

- API base: `http://127.0.0.1:8000/api/`
- Admin: `http://127.0.0.1:8000/admin/` — set a user’s **role** to `admin` to unlock analytics.

## Frontend

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Set `VITE_API_URL` in `.env` if the API is not on `http://127.0.0.1:8000`.

## Features

- **Roles:** job seeker, recruiter, admin (admin via Django admin `role` field).
- **JWT auth** (`/api/auth/token/` with **email** + password).
- **Resume upload** (PDF/TXT), text extraction, **skill suggestions** from a dictionary; seekers **confirm skills** on the Skills page.
- **Job recommendations** (`/api/jobs/recommended/`) and **recruiter candidate suggestions** per job.
- **Applications** with status updates by recruiters.
- **Admin analytics** JSON + charts in the UI (`/api/analytics/summary/`).

## Windows note (MySQL driver)

If `mysqlclient` fails to install, this project uses **PyMySQL** (`pymysql.install_as_MySQLdb()` in `config/__init__.py`). Ensure `MYSQL_*` is correct when not using SQLite.
