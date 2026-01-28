#!/bin/bash
# © 2026 Forsati. All rights reserved.
# Bootstrap script for Forsati Platform
# This script checks prerequisites and initializes the development environment

set -e

echo "========================================"
echo "🚀 Forsati Platform Bootstrap"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed: $($1 --version 2>&1 | head -n 1)"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-5}
    
    if curl -fsS --connect-timeout $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is healthy at $url"
        return 0
    else
        echo -e "${RED}✗${NC} $name is not reachable at $url"
        return 1
    fi
}

echo "📋 Checking Prerequisites..."
echo "----------------------------"

PREREQ_PASS=true

check_command git || PREREQ_PASS=false
check_command docker || PREREQ_PASS=false
check_command docker-compose || check_command "docker compose" || PREREQ_PASS=false
check_command node || PREREQ_PASS=false
check_command npm || PREREQ_PASS=false
check_command python3 || check_command python || PREREQ_PASS=false

echo ""

if [ "$PREREQ_PASS" = false ]; then
    echo -e "${RED}❌ Prerequisites check failed. Please install missing tools.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites are installed${NC}"
echo ""

# Check for .env file
echo "📋 Checking Environment Configuration..."
echo "----------------------------------------"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}⚠${NC} .env file not found. Creating from .env.example..."
        cp .env.example .env
        echo -e "${YELLOW}⚠${NC} Please edit .env file and fill in your secret values"
        echo "   Required variables:"
        echo "   - POSTGRES_PASSWORD"
        echo "   - MINIO_ROOT_USER, MINIO_ROOT_PASSWORD"
        echo "   - KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD"
        echo "   - STRAPI_APP_KEYS, STRAPI_API_TOKEN_SALT, STRAPI_ADMIN_JWT_SECRET, etc."
    else
        echo -e "${RED}✗${NC} Neither .env nor .env.example found!"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} .env file exists"
fi

echo ""

# Initialize submodules
echo "📋 Initializing Git Submodules..."
echo "----------------------------------"
git submodule update --init --recursive || echo -e "${YELLOW}⚠${NC} Some submodules may have issues"

echo ""

# Check if Docker is running
echo "📋 Checking Docker..."
echo "---------------------"
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker daemon is running"
else
    echo -e "${RED}✗${NC} Docker daemon is not running. Please start Docker."
    exit 1
fi

echo ""

# Start services
echo "📋 Starting Services..."
echo "-----------------------"
echo "Running: docker-compose up -d"

if docker-compose up -d 2>&1; then
    echo -e "${GREEN}✓${NC} Docker Compose started successfully"
else
    echo -e "${RED}✗${NC} Docker Compose failed to start"
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready (60 seconds)..."
sleep 60

echo ""
echo "📋 Checking Service Health..."
echo "-----------------------------"

HEALTH_PASS=true

# Check each service
check_service "PostgreSQL" "localhost:5432" || HEALTH_PASS=false
check_service "MinIO Console" "http://localhost:9001" || HEALTH_PASS=false
check_service "Keycloak" "http://localhost:8080" || HEALTH_PASS=false
check_service "Strapi" "http://localhost:1337" || HEALTH_PASS=false
check_service "Ingestor" "http://localhost:8000/docs" || HEALTH_PASS=false

echo ""
echo "========================================"
if [ "$HEALTH_PASS" = true ]; then
    echo -e "${GREEN}✅ BOOTSTRAP PASS${NC}"
    echo ""
    echo "🔗 Service URLs:"
    echo "   Strapi Admin:    http://localhost:1337/admin"
    echo "   MinIO Console:   http://localhost:9001"
    echo "   Keycloak Admin:  http://localhost:8080/admin"
    echo "   Ingestor Docs:   http://localhost:8000/docs"
else
    echo -e "${RED}❌ BOOTSTRAP FAIL${NC}"
    echo ""
    echo "Some services are not healthy. Please check:"
    echo "1. Docker logs: docker-compose logs -f"
    echo "2. Ensure .env has all required values"
    echo "3. Check if ports are available"
fi
echo "========================================"
