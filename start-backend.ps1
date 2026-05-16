# Run Django API locally (required for dev; production uses Render)
Set-Location $PSScriptRoot\backend
if (-not (Test-Path .venv\Scripts\Activate.ps1)) {
  Write-Host "Creating virtualenv..."
  python -m venv .venv
}
.\.venv\Scripts\Activate.ps1
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "Created backend/.env — edit MYSQL_* or leave empty for SQLite."
}
pip install -r requirements.txt -q
python manage.py migrate
python manage.py seed_skills
Write-Host "API: http://127.0.0.1:8000/api/"
python manage.py runserver
