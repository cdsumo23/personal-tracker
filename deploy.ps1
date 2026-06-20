# =====================================================
# Smart Planner - Deployment Script
# Run this from the project root: .\deploy.ps1
# =====================================================

$ProjectRoot = $PSScriptRoot
$WebDir      = Join-Path $ProjectRoot "apps\web"
$ApiDir      = Join-Path $ProjectRoot "apps\api"
$OutDir      = Join-Path $ProjectRoot "deploy-output"

# Clean and recreate output folder
if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Path $OutDir | Out-Null

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Smart Planner Deployment Packager   " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────
# STEP 1: Build the API
# ─────────────────────────────────────────
Write-Host "[1/4] Building Backend API..." -ForegroundColor Yellow
Set-Location $ProjectRoot
npm.cmd run build --workspace=apps/api
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: API build failed. Aborting." -ForegroundColor Red
    exit 1
}
Write-Host "      Backend build complete." -ForegroundColor Green

# ─────────────────────────────────────────
# STEP 2: Build the Frontend
# ─────────────────────────────────────────
Write-Host "[2/4] Building Frontend (Next.js)..." -ForegroundColor Yellow
npm.cmd run build --workspace=apps/web
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed. Aborting." -ForegroundColor Red
    exit 1
}
Write-Host "      Frontend build complete." -ForegroundColor Green

# ─────────────────────────────────────────
# STEP 3: Package Backend (api-deploy.zip)
# ─────────────────────────────────────────
Write-Host "[3/4] Packaging Backend..." -ForegroundColor Yellow

$ApiZip = Join-Path $OutDir "api-deploy.zip"
$ApiItems = @(
    (Join-Path $ApiDir "dist"),
    (Join-Path $ApiDir "prisma"),
    (Join-Path $ApiDir "package.json")
)
Compress-Archive -Path $ApiItems -DestinationPath $ApiZip -Force

$ApiSizeMB = [math]::Round((Get-Item $ApiZip).Length / 1MB, 1)
Write-Host "      api-deploy.zip created ($ApiSizeMB MB)" -ForegroundColor Green

# ─────────────────────────────────────────
# STEP 4: Package Frontend (web-deploy.zip)
# Excludes .next/cache which is 700+ MB
# of local build cache — NOT needed on server
# ─────────────────────────────────────────
Write-Host "[4/4] Packaging Frontend (excluding cache)..." -ForegroundColor Yellow

$WebZip     = Join-Path $OutDir "web-deploy.zip"
$TempWebDir = Join-Path $OutDir "web-temp"

# Copy only the necessary files to a temp folder
New-Item -ItemType Directory -Path $TempWebDir | Out-Null

# Copy .next but exclude .next/cache
$NextSrc  = Join-Path $WebDir ".next"
$NextDest = Join-Path $TempWebDir ".next"
Copy-Item -Recurse -Path $NextSrc -Destination $NextDest

# Remove cache from the copy
$CachePath = Join-Path $NextDest "cache"
if (Test-Path $CachePath) {
    Remove-Item -Recurse -Force $CachePath
}

# Copy public/, package.json, next.config.js
Copy-Item -Path (Join-Path $WebDir "public")         -Destination (Join-Path $TempWebDir "public")        -Recurse
Copy-Item -Path (Join-Path $WebDir "package.json")   -Destination (Join-Path $TempWebDir "package.json")
Copy-Item -Path (Join-Path $WebDir "next.config.js") -Destination (Join-Path $TempWebDir "next.config.js")

# Zip the temp folder contents
Compress-Archive -Path (Join-Path $TempWebDir "*") -DestinationPath $WebZip -Force

# Cleanup temp
Remove-Item -Recurse -Force $TempWebDir

$WebSizeMB = [math]::Round((Get-Item $WebZip).Length / 1MB, 1)
Write-Host "      web-deploy.zip created ($WebSizeMB MB)" -ForegroundColor Green

# ─────────────────────────────────────────
# Done!
# ─────────────────────────────────────────
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Deployment packages ready!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Output folder: $OutDir" -ForegroundColor White
Write-Host ""
Write-Host "  Files to upload to cPanel:" -ForegroundColor White
Write-Host "  -> api-deploy.zip  => smart-planner-api/  (replace dist/ and prisma/)" -ForegroundColor White
Write-Host "  -> web-deploy.zip  => smart-planner-web/  (replace .next/ and public/)" -ForegroundColor White
Write-Host ""
Write-Host "  After uploading, go to cPanel > Setup Node.js App" -ForegroundColor White
Write-Host "  and click RESTART for both apps." -ForegroundColor White
Write-Host ""
