Write-Host "Installing backend dependencies..."
Push-Location backend
npm install
Pop-Location

Write-Host "Installing frontend dependencies..."
Push-Location frontend
npm install
Pop-Location

if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
if (-not (Test-Path frontend/.env)) { Copy-Item frontend/.env.example frontend/.env }

Write-Host "Done. Edit backend/.env with your OPENAI_API_KEY / TAVILY_API_KEY / DATABASE_URL, then:"
Write-Host "  cd backend; npm run dev"
Write-Host "  cd frontend; npm run dev"
