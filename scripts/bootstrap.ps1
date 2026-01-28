# © 2026 Forsati. All rights reserved.
# Bootstrap script for Forsati Platform (Windows PowerShell)
# This script checks prerequisites and initializes the development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Forsati Platform Bootstrap" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$PrereqPass = $true
$HealthPass = $true

function Check-Command {
    param([string]$Name, [string]$VersionCmd)
    try {
        $version = Invoke-Expression "$VersionCmd 2>&1" | Select-Object -First 1
        Write-Host "✓ $Name is installed: $version" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ $Name is not installed" -ForegroundColor Red
        return $false
    }
}

function Check-Service {
    param([string]$Name, [string]$Url, [int]$Timeout = 5)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
        Write-Host "✓ $Name is healthy at $Url" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ $Name is not reachable at $Url" -ForegroundColor Red
        return $false
    }
}

Write-Host "📋 Checking Prerequisites..." -ForegroundColor Yellow
Write-Host "----------------------------"

if (-not (Check-Command "Git" "git --version")) { $PrereqPass = $false }
if (-not (Check-Command "Docker" "docker --version")) { $PrereqPass = $false }
if (-not (Check-Command "Docker Compose" "docker-compose --version")) { $PrereqPass = $false }
if (-not (Check-Command "Node.js" "node --version")) { $PrereqPass = $false }
if (-not (Check-Command "npm" "npm --version")) { $PrereqPass = $false }
if (-not (Check-Command "Python" "python --version")) { $PrereqPass = $false }

Write-Host ""

if (-not $PrereqPass) {
    Write-Host "❌ Prerequisites check failed. Please install missing tools." -ForegroundColor Red
    exit 1
}

Write-Host "✓ All prerequisites are installed" -ForegroundColor Green
Write-Host ""

# Check for .env file
Write-Host "📋 Checking Environment Configuration..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

$envPath = Join-Path $PSScriptRoot ".." ".env"
$envExamplePath = Join-Path $PSScriptRoot ".." ".env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Write-Host "⚠ .env file not found. Creating from .env.example..." -ForegroundColor Yellow
        Copy-Item $envExamplePath $envPath
        Write-Host "⚠ Please edit .env file and fill in your secret values" -ForegroundColor Yellow
        Write-Host "   Required variables:"
        Write-Host "   - POSTGRES_PASSWORD"
        Write-Host "   - MINIO_ROOT_USER, MINIO_ROOT_PASSWORD"
        Write-Host "   - KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD"
        Write-Host "   - STRAPI_APP_KEYS, STRAPI_API_TOKEN_SALT, etc."
    } else {
        Write-Host "✗ Neither .env nor .env.example found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

Write-Host ""

# Initialize submodules
Write-Host "📋 Initializing Git Submodules..." -ForegroundColor Yellow
Write-Host "----------------------------------"
git submodule update --init --recursive

Write-Host ""

# Check if Docker is running
Write-Host "📋 Checking Docker..." -ForegroundColor Yellow
Write-Host "---------------------"
try {
    docker info | Out-Null
    Write-Host "✓ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker daemon is not running. Please start Docker." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 Environment Variables Required:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MARKET_DEFAULT, ENABLED_MARKETS" -ForegroundColor White
Write-Host "POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD" -ForegroundColor White
Write-Host "STRAPI_URL, STRAPI_API_TOKEN, STRAPI_APP_KEYS, STRAPI_API_TOKEN_SALT" -ForegroundColor White
Write-Host "STRAPI_ADMIN_JWT_SECRET, STRAPI_TRANSFER_TOKEN_SALT, STRAPI_JWT_SECRET" -ForegroundColor White
Write-Host "MINIO_ENDPOINT, MINIO_PORT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD" -ForegroundColor White
Write-Host "KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD" -ForegroundColor White
Write-Host "INGESTOR_URL, INGESTOR_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "⚠ Fill these in .env file before running docker-compose" -ForegroundColor Yellow
Write-Host ""
Write-Host "To start services, run:" -ForegroundColor Cyan
Write-Host "  docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "Service URLs (after starting):" -ForegroundColor Cyan
Write-Host "  Strapi Admin:    http://localhost:1337/admin" -ForegroundColor White
Write-Host "  MinIO Console:   http://localhost:9001" -ForegroundColor White
Write-Host "  Keycloak Admin:  http://localhost:8080/admin" -ForegroundColor White
Write-Host "  Ingestor Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
