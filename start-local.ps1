# Run backend + frontend locally (two windows)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; .\.venv\Scripts\Activate.ps1; python manage.py runserver"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"
Write-Host "Backend: http://127.0.0.1:8000  |  Frontend: http://localhost:5173"
