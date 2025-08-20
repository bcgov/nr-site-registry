#!/bin/ksh

# Reusable script to get Keycloak access token
# Usage: ACCESS_TOKEN=$(./get_keycloak_token.sh)
# Or: source ./get_keycloak_token.sh

# Configuration - Read from environment variables or use defaults
KEYCLOAK_URL="${KEYCLOAK_URL:-https://epd-keycloak-dev.apps.silver.devops.gov.bc.ca/auth}"
REALM="${KEYCLOAK_REALM:-forms-flow-ai}"
CLIENT_ID="${KEYCLOAK_CLIENT_ID:-site-service}"
CLIENT_SECRET="${KEYCLOAK_CLIENT_SECRET}"

# Function to log to stderr
log() {
    print "$1" >&2
}

# Check if required environment variables are set
if [[ -z "$CLIENT_SECRET" ]]; then
    log "Error: KEYCLOAK_CLIENT_SECRET environment variable is required"
    log "Usage: KEYCLOAK_CLIENT_SECRET=your-secret ./get_keycloak_token.sh"
    log "Optional environment variables:"
    log "  KEYCLOAK_URL (default: https://epd-keycloak-dev.apps.silver.devops.gov.bc.ca/auth)"
    log "  KEYCLOAK_REALM (default: forms-flow-ai)"
    log "  KEYCLOAK_CLIENT_ID (default: site-service)"
    exit 1
fi

log "Requesting access token from Keycloak..."
log "Keycloak URL: $KEYCLOAK_URL"
log "Realm: $REALM"
log "Client ID: $CLIENT_ID"

# Get access token from Keycloak using client credentials flow
TOKEN_RESPONSE=$(curl -s -X POST \
  "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}")

# Check if token request was successful
if [[ $? -ne 0 ]]; then
    log "Failed to make token request"
    exit 1
fi

# Extract access token from response
ACCESS_TOKEN=$(print $TOKEN_RESPONSE | jq -r '.access_token')

if [[ "$ACCESS_TOKEN" == "null" ]] || [[ -z "$ACCESS_TOKEN" ]]; then
    log "Failed to get access token"
    log "Response: $TOKEN_RESPONSE"
    exit 1
fi

log "Successfully obtained access token"
log "Token (first 20 chars): ${ACCESS_TOKEN:0:20}..."

# Output the token to stdout
print "$ACCESS_TOKEN" 