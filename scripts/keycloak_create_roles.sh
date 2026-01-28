#!/bin/bash
# © 2026 Forsati. All rights reserved.
# Keycloak Roles Creation Script
# Creates/updates roles in Keycloak using Admin API

set -e

# Required environment variables (DO NOT hardcode values)
# KEYCLOAK_URL - Keycloak server URL
# KEYCLOAK_ADMIN - Admin username
# KEYCLOAK_ADMIN_PASSWORD - Admin password
# KEYCLOAK_REALM - Target realm name

echo "========================================"
echo "🔐 Keycloak Roles Setup"
echo "========================================"

# Check required variables
if [ -z "$KEYCLOAK_URL" ] || [ -z "$KEYCLOAK_ADMIN" ] || [ -z "$KEYCLOAK_ADMIN_PASSWORD" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "   Required: KEYCLOAK_URL, KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD"
    exit 1
fi

REALM=${KEYCLOAK_REALM:-forsati}
ROLES_FILE="$(dirname "$0")/../roles/keycloak-roles.json"

echo "📍 Keycloak URL: $KEYCLOAK_URL"
echo "📍 Realm: $REALM"
echo "📍 Roles file: $ROLES_FILE"

# Get admin token
echo ""
echo "🔑 Getting admin token..."
TOKEN_RESPONSE=$(curl -s -X POST \
    "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$KEYCLOAK_ADMIN" \
    -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
    -d "grant_type=password" \
    -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get admin token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "✓ Got admin token"

# Check if realm exists, create if not
echo ""
echo "🏰 Checking realm '$REALM'..."
REALM_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
    "$KEYCLOAK_URL/admin/realms/$REALM" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [ "$REALM_CHECK" == "404" ]; then
    echo "📝 Creating realm '$REALM'..."
    curl -s -X POST \
        "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"realm\": \"$REALM\", \"enabled\": true}"
    echo "✓ Realm created"
else
    echo "✓ Realm exists"
fi

# Create roles from JSON file
echo ""
echo "👥 Creating/updating roles..."

if [ ! -f "$ROLES_FILE" ]; then
    echo "❌ Roles file not found: $ROLES_FILE"
    exit 1
fi

# Read roles from JSON
ROLES=$(cat "$ROLES_FILE" | jq -c '.roles[]')

echo "$ROLES" | while read -r role; do
    ROLE_NAME=$(echo $role | jq -r '.name')
    ROLE_DESC_EN=$(echo $role | jq -r '.description.en')
    
    echo "  📋 Processing role: $ROLE_NAME"
    
    # Check if role exists
    ROLE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
        "$KEYCLOAK_URL/admin/realms/$REALM/roles/$ROLE_NAME" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if [ "$ROLE_CHECK" == "404" ]; then
        # Create role
        curl -s -X POST \
            "$KEYCLOAK_URL/admin/realms/$REALM/roles" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"name\": \"$ROLE_NAME\", \"description\": \"$ROLE_DESC_EN\"}"
        echo "    ✓ Created"
    else
        # Update role
        curl -s -X PUT \
            "$KEYCLOAK_URL/admin/realms/$REALM/roles/$ROLE_NAME" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"name\": \"$ROLE_NAME\", \"description\": \"$ROLE_DESC_EN\"}"
        echo "    ✓ Updated"
    fi
done

echo ""
echo "========================================"
echo "✅ Keycloak roles setup complete"
echo "========================================"
