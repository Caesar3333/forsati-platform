#!/bin/bash
# © 2026 Forsati. All rights reserved.
# GitHub Secrets Setup Script for Forsati Platform
# This script helps you set all required secrets via gh CLI
# Run: chmod +x scripts/setup_github_secrets.sh && ./scripts/setup_github_secrets.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

LOCAL_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --local-only)
            LOCAL_ONLY=true
            shift
            ;;
        --help|-h)
            echo "Forsati Platform - GitHub Secrets Setup Script"
            echo "==============================================="
            echo ""
            echo "Usage:"
            echo "  ./setup_github_secrets.sh              # Set GitHub Secrets interactively"
            echo "  ./setup_github_secrets.sh --local-only # Only create local .env file"
            echo ""
            echo "Prerequisites:"
            echo "  - GitHub CLI (gh) installed and authenticated"
            echo "  - Run: gh auth login"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

echo "========================================"
echo -e "${CYAN}🔐 Forsati Platform - Secrets Setup${NC}"
echo "========================================"
echo ""

# Check gh CLI
if [ "$LOCAL_ONLY" = false ]; then
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI (gh) not found. Install from: https://cli.github.com${NC}"
        echo -e "${YELLOW}   Or use --local-only to create local .env file only${NC}"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}❌ Not logged in to GitHub CLI. Run: gh auth login${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
fi

# Function to generate random password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d '/+=' | head -c $length
}

# Function to generate Strapi app keys
generate_strapi_keys() {
    local k1=$(generate_password 16)
    local k2=$(generate_password 16)
    local k3=$(generate_password 16)
    local k4=$(generate_password 16)
    echo "$k1,$k2,$k3,$k4"
}

# Collect secrets
declare -A secrets

echo ""
echo -e "${YELLOW}📋 Collecting secret values...${NC}"
echo -e "${GRAY}   (Press Enter to use [default] or [generate] values)${NC}"
echo ""

# PostgreSQL
read -p "  POSTGRES_USER [forsati]: " val
secrets[POSTGRES_USER]="${val:-forsati}"

read -p "  POSTGRES_DB [forsati_db]: " val
secrets[POSTGRES_DB]="${val:-forsati_db}"

read -p "  POSTGRES_PASSWORD [auto-generate]: " val
secrets[POSTGRES_PASSWORD]="${val:-$(generate_password)}"
echo -e "${GRAY}    → $([ -z "$val" ] && echo "Generated" || echo "Set")${NC}"

# MinIO
read -p "  MINIO_ROOT_USER [minioadmin]: " val
secrets[MINIO_ROOT_USER]="${val:-minioadmin}"

read -p "  MINIO_ROOT_PASSWORD [auto-generate]: " val
secrets[MINIO_ROOT_PASSWORD]="${val:-$(generate_password)}"
echo -e "${GRAY}    → $([ -z "$val" ] && echo "Generated" || echo "Set")${NC}"

read -p "  MINIO_BUCKET [forsati-resumes]: " val
secrets[MINIO_BUCKET]="${val:-forsati-resumes}"

# Strapi
read -p "  STRAPI_APP_KEYS [auto-generate]: " val
secrets[STRAPI_APP_KEYS]="${val:-$(generate_strapi_keys)}"
echo -e "${GRAY}    → $([ -z "$val" ] && echo "Generated" || echo "Set")${NC}"

read -p "  STRAPI_API_TOKEN_SALT [auto-generate]: " val
secrets[STRAPI_API_TOKEN_SALT]="${val:-$(generate_password)}"
echo -e "${GRAY}    → $([ -z "$val" ] && echo "Generated" || echo "Set")${NC}"

read -p "  STRAPI_ADMIN_JWT_SECRET [auto-generate]: " val
secrets[STRAPI_ADMIN_JWT_SECRET]="${val:-$(generate_password)}"
echo -e "${GRAY}    → $([ -z "$val" ] && echo "Generated" || echo "Set")${NC}"

read -p "  STRAPI_TRANSFER_TOKEN_SALT [auto-generate]: " val
secrets[STRAPI_TRANSFER_TOKEN_SALT]="${val:-$(generate_password)}"
echo -e "${GRAY}    → $([ -z "$val" ] && echo "Generated" || echo "Set")${NC}"

read -p "  STRAPI_JWT_SECRET [auto-generate]: " val
secrets[STRAPI_JWT_SECRET]="${val:-$(generate_password)}"
echo -e "${GRAY}    → $([ -z "$val" ] && echo "Generated" || echo "Set")${NC}"

read -p "  STRAPI_API_TOKEN [skip - create in Strapi UI]: " val
[ -n "$val" ] && secrets[STRAPI_API_TOKEN]="$val"

# Keycloak
read -p "  KEYCLOAK_ADMIN [admin]: " val
secrets[KEYCLOAK_ADMIN]="${val:-admin}"

read -p "  KEYCLOAK_ADMIN_PASSWORD [auto-generate]: " val
secrets[KEYCLOAK_ADMIN_PASSWORD]="${val:-$(generate_password)}"
echo -e "${GRAY}    → $([ -z "$val" ] && echo "Generated" || echo "Set")${NC}"

# Optional
read -p "  HUGGINGFACE_API_KEY [skip]: " val
[ -n "$val" ] && secrets[HUGGINGFACE_API_KEY]="$val"

read -p "  OPENAI_API_KEY [skip]: " val
[ -n "$val" ] && secrets[OPENAI_API_KEY]="$val"

echo ""
echo "========================================"
echo -e "${CYAN}📝 Summary of collected secrets:${NC}"
echo "========================================"

for key in "${!secrets[@]}"; do
    masked=$(echo "${secrets[$key]}" | head -c 8)
    echo -e "  ${GRAY}$key = ${masked}...${NC}"
done

echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_PATH="$SCRIPT_DIR/../.env"

# Create local .env file
echo -e "${YELLOW}📁 Creating local .env file...${NC}"

cat > "$ENV_PATH" << EOF
# © 2026 Forsati. All rights reserved.
# Local Development Environment Variables
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
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
POSTGRES_DB=${secrets[POSTGRES_DB]}
POSTGRES_USER=${secrets[POSTGRES_USER]}
POSTGRES_PASSWORD=${secrets[POSTGRES_PASSWORD]}

# ===========================================
# MINIO (S3 Storage)
# ===========================================
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=${secrets[MINIO_ROOT_USER]}
MINIO_ROOT_PASSWORD=${secrets[MINIO_ROOT_PASSWORD]}
MINIO_BUCKET_RESUMES=${secrets[MINIO_BUCKET]}

# ===========================================
# STRAPI (Headless CMS)
# ===========================================
STRAPI_URL=http://strapi:1337
STRAPI_APP_KEYS=${secrets[STRAPI_APP_KEYS]}
STRAPI_API_TOKEN_SALT=${secrets[STRAPI_API_TOKEN_SALT]}
STRAPI_ADMIN_JWT_SECRET=${secrets[STRAPI_ADMIN_JWT_SECRET]}
STRAPI_TRANSFER_TOKEN_SALT=${secrets[STRAPI_TRANSFER_TOKEN_SALT]}
STRAPI_JWT_SECRET=${secrets[STRAPI_JWT_SECRET]}
STRAPI_API_TOKEN=${secrets[STRAPI_API_TOKEN]:-}

# ===========================================
# KEYCLOAK (IAM)
# ===========================================
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=forsati
KEYCLOAK_ADMIN=${secrets[KEYCLOAK_ADMIN]}
KEYCLOAK_ADMIN_PASSWORD=${secrets[KEYCLOAK_ADMIN_PASSWORD]}

# ===========================================
# INGESTOR SERVICE
# ===========================================
INGESTOR_URL=http://ingestor:8000

# ===========================================
# AI / ML (Optional)
# ===========================================
HUGGINGFACE_API_KEY=${secrets[HUGGINGFACE_API_KEY]:-}
OPENAI_API_KEY=${secrets[OPENAI_API_KEY]:-}
EOF

echo -e "${GREEN}✅ Created: $ENV_PATH${NC}"

# Set GitHub Secrets if not local only
if [ "$LOCAL_ONLY" = false ]; then
    echo ""
    echo -e "${YELLOW}🔐 Setting GitHub Secrets...${NC}"
    
    for key in "${!secrets[@]}"; do
        echo -n "  Setting $key..."
        echo -n "${secrets[$key]}" | gh secret set "$key" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e " ${GREEN}✅${NC}"
        else
            echo -e " ${RED}❌${NC}"
        fi
    done
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "========================================"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Run: docker-compose up -d --build"
echo "  2. Wait for services to start (~60 seconds)"
echo "  3. Open Strapi: http://localhost:1337/admin"
echo "  4. Create API token in Strapi and update STRAPI_API_TOKEN"
echo "  5. Test: curl http://localhost:8000/health"
echo ""
echo -e "${YELLOW}⚠️  Remember: .env file is for LOCAL development only!${NC}"
echo -e "${YELLOW}    For production, use GitHub Secrets or a secrets manager.${NC}"
echo ""
