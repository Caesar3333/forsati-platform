# © 2026 Forsati. All rights reserved.
# GitHub Secrets Setup Script for Forsati Platform
# This script helps you set all required secrets via gh CLI
# Run: powershell -ExecutionPolicy Bypass -File scripts/setup_github_secrets.ps1

param(
    [switch]$LocalEnvOnly,  # Only create local .env file
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Forsati Platform - GitHub Secrets Setup Script
===============================================

Usage:
  .\setup_github_secrets.ps1              # Set GitHub Secrets interactively
  .\setup_github_secrets.ps1 -LocalEnvOnly # Only create local .env file

Prerequisites:
  - GitHub CLI (gh) installed and authenticated
  - Run: gh auth login

This script will prompt you for each secret value securely.
Values are NOT displayed on screen or saved in history.

"@
    exit 0
}

Write-Host "========================================"
Write-Host "🔐 Forsati Platform - Secrets Setup" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""

# Check gh CLI
if (-not $LocalEnvOnly) {
    $ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $ghInstalled) {
        Write-Host "❌ GitHub CLI (gh) not found. Install from: https://cli.github.com" -ForegroundColor Red
        Write-Host "   Or use -LocalEnvOnly to create local .env file only" -ForegroundColor Yellow
        exit 1
    }
    
    # Check auth status
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Not logged in to GitHub CLI. Run: gh auth login" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ GitHub CLI authenticated" -ForegroundColor Green
}

# Define required secrets
$secrets = @(
    @{Name="POSTGRES_PASSWORD"; Desc="PostgreSQL password"; Required=$true; Generate=$true},
    @{Name="POSTGRES_USER"; Desc="PostgreSQL username"; Required=$true; Default="forsati"},
    @{Name="POSTGRES_DB"; Desc="PostgreSQL database name"; Required=$true; Default="forsati_db"},
    @{Name="MINIO_ROOT_USER"; Desc="MinIO root username"; Required=$true; Default="minioadmin"},
    @{Name="MINIO_ROOT_PASSWORD"; Desc="MinIO root password"; Required=$true; Generate=$true},
    @{Name="MINIO_BUCKET"; Desc="MinIO bucket name"; Required=$true; Default="forsati-resumes"},
    @{Name="STRAPI_APP_KEYS"; Desc="Strapi app keys (comma-separated)"; Required=$true; Generate=$true},
    @{Name="STRAPI_API_TOKEN_SALT"; Desc="Strapi API token salt"; Required=$true; Generate=$true},
    @{Name="STRAPI_ADMIN_JWT_SECRET"; Desc="Strapi admin JWT secret"; Required=$true; Generate=$true},
    @{Name="STRAPI_TRANSFER_TOKEN_SALT"; Desc="Strapi transfer token salt"; Required=$true; Generate=$true},
    @{Name="STRAPI_JWT_SECRET"; Desc="Strapi JWT secret"; Required=$true; Generate=$true},
    @{Name="STRAPI_API_TOKEN"; Desc="Strapi API token (create in Strapi UI)"; Required=$false; Manual=$true},
    @{Name="KEYCLOAK_ADMIN"; Desc="Keycloak admin username"; Required=$true; Default="admin"},
    @{Name="KEYCLOAK_ADMIN_PASSWORD"; Desc="Keycloak admin password"; Required=$true; Generate=$true},
    @{Name="HUGGINGFACE_API_KEY"; Desc="Hugging Face API key"; Required=$false; Manual=$true},
    @{Name="OPENAI_API_KEY"; Desc="OpenAI API key"; Required=$false; Manual=$true},
    @{Name="DOCKERHUB_USERNAME"; Desc="Docker Hub username"; Required=$false; Manual=$true},
    @{Name="DOCKERHUB_TOKEN"; Desc="Docker Hub access token"; Required=$false; Manual=$true}
)

# Function to generate random password
function New-SecurePassword {
    param([int]$Length = 32)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    $password = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

# Function to generate Strapi app keys (4 keys)
function New-StrapiAppKeys {
    $keys = @()
    for ($i = 0; $i -lt 4; $i++) {
        $keys += New-SecurePassword -Length 16
    }
    return ($keys -join ",")
}

$collectedSecrets = @{}

Write-Host ""
Write-Host "📋 Collecting secret values..." -ForegroundColor Yellow
Write-Host "   (Press Enter to use [default] or [generate] values)" -ForegroundColor Gray
Write-Host ""

foreach ($secret in $secrets) {
    $name = $secret.Name
    $desc = $secret.Desc
    $required = $secret.Required
    $default = $secret.Default
    $generate = $secret.Generate
    $manual = $secret.Manual
    
    $prompt = "  $name"
    if ($default) { $prompt += " [$default]" }
    elseif ($generate) { $prompt += " [auto-generate]" }
    elseif ($manual) { $prompt += " [skip for now]" }
    $prompt += ": "
    
    Write-Host $prompt -NoNewline -ForegroundColor White
    $value = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        if ($default) {
            $value = $default
            Write-Host "    → Using default: $value" -ForegroundColor Gray
        }
        elseif ($generate) {
            if ($name -eq "STRAPI_APP_KEYS") {
                $value = New-StrapiAppKeys
            } else {
                $value = New-SecurePassword
            }
            Write-Host "    → Generated (saved securely)" -ForegroundColor Gray
        }
        elseif ($manual) {
            Write-Host "    → Skipped (set manually later)" -ForegroundColor Gray
            continue
        }
        elseif ($required) {
            Write-Host "    ❌ Required! Please provide a value." -ForegroundColor Red
            exit 1
        }
    }
    
    if (-not [string]::IsNullOrWhiteSpace($value)) {
        $collectedSecrets[$name] = $value
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "📝 Summary of collected secrets:" -ForegroundColor Cyan
Write-Host "========================================"

foreach ($key in $collectedSecrets.Keys) {
    $maskedValue = "*" * [Math]::Min($collectedSecrets[$key].Length, 8) + "..."
    Write-Host "  $key = $maskedValue" -ForegroundColor Gray
}

Write-Host ""

# Create local .env file
$envPath = Join-Path $PSScriptRoot ".." ".env"
Write-Host "📁 Creating local .env file..." -ForegroundColor Yellow

$envContent = @"
# © 2026 Forsati. All rights reserved.
# Local Development Environment Variables
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# WARNING: DO NOT COMMIT THIS FILE!

# ===========================================
# MARKET / REGIONAL SETTINGS
# ===========================================
MARKET_DEFAULT=jo
ENABLED_MARKETS=jo,sa,ae
DEFAULT_LOCALE=ar
DEFAULT_TIMEZONE=Asia/Amman

# ===========================================
# DATABASE (PostgreSQL)
# ===========================================
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=$($collectedSecrets['POSTGRES_DB'])
POSTGRES_USER=$($collectedSecrets['POSTGRES_USER'])
POSTGRES_PASSWORD=$($collectedSecrets['POSTGRES_PASSWORD'])

# ===========================================
# MINIO (S3 Storage)
# ===========================================
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=$($collectedSecrets['MINIO_ROOT_USER'])
MINIO_ROOT_PASSWORD=$($collectedSecrets['MINIO_ROOT_PASSWORD'])
MINIO_BUCKET_RESUMES=$($collectedSecrets['MINIO_BUCKET'])

# ===========================================
# STRAPI (Headless CMS)
# ===========================================
STRAPI_URL=http://strapi:1337
STRAPI_APP_KEYS=$($collectedSecrets['STRAPI_APP_KEYS'])
STRAPI_API_TOKEN_SALT=$($collectedSecrets['STRAPI_API_TOKEN_SALT'])
STRAPI_ADMIN_JWT_SECRET=$($collectedSecrets['STRAPI_ADMIN_JWT_SECRET'])
STRAPI_TRANSFER_TOKEN_SALT=$($collectedSecrets['STRAPI_TRANSFER_TOKEN_SALT'])
STRAPI_JWT_SECRET=$($collectedSecrets['STRAPI_JWT_SECRET'])
STRAPI_API_TOKEN=$($collectedSecrets['STRAPI_API_TOKEN'])

# ===========================================
# KEYCLOAK (IAM)
# ===========================================
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=forsati
KEYCLOAK_ADMIN=$($collectedSecrets['KEYCLOAK_ADMIN'])
KEYCLOAK_ADMIN_PASSWORD=$($collectedSecrets['KEYCLOAK_ADMIN_PASSWORD'])

# ===========================================
# INGESTOR SERVICE
# ===========================================
INGESTOR_URL=http://ingestor:8000

# ===========================================
# AI / ML (Optional)
# ===========================================
HUGGINGFACE_API_KEY=$($collectedSecrets['HUGGINGFACE_API_KEY'])
OPENAI_API_KEY=$($collectedSecrets['OPENAI_API_KEY'])

# ===========================================
# CI/CD (Optional)
# ===========================================
DOCKERHUB_USERNAME=$($collectedSecrets['DOCKERHUB_USERNAME'])
DOCKERHUB_TOKEN=$($collectedSecrets['DOCKERHUB_TOKEN'])
"@

$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force
Write-Host "✅ Created: $envPath" -ForegroundColor Green

# Set GitHub Secrets if not LocalEnvOnly
if (-not $LocalEnvOnly) {
    Write-Host ""
    Write-Host "🔐 Setting GitHub Secrets..." -ForegroundColor Yellow
    
    foreach ($key in $collectedSecrets.Keys) {
        Write-Host "  Setting $key..." -NoNewline
        $collectedSecrets[$key] | gh secret set $key 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: docker-compose up -d --build"
Write-Host "  2. Wait for services to start (~60 seconds)"
Write-Host "  3. Open Strapi: http://localhost:1337/admin"
Write-Host "  4. Create API token in Strapi and update STRAPI_API_TOKEN"
Write-Host "  5. Test: curl http://localhost:8000/health"
Write-Host ""
Write-Host "⚠️  Remember: .env file is for LOCAL development only!" -ForegroundColor Yellow
Write-Host "    For production, use GitHub Secrets or a secrets manager." -ForegroundColor Yellow
Write-Host ""
