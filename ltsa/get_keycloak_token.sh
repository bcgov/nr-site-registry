#!/bin/ksh

# Reusable script to get Keycloak access token
# Usage: ACCESS_TOKEN=$(./get_keycloak_token.sh)
# Or: source ./get_keycloak_token.sh

# Configuration - Read from environment variables (all required)
KEYCLOAK_URL="${KEYCLOAK_URL}"
REALM="${KEYCLOAK_REALM}"
CLIENT_ID="${KEYCLOAK_CLIENT_ID}"
CLIENT_SECRET="${KEYCLOAK_CLIENT_SECRET}"

# Function to log to stderr
log() {
    print "$1" >&2
}

# Check if all required environment variables are set
MISSING_VARS=""
if [[ -z "$KEYCLOAK_URL" ]]; then
    MISSING_VARS="$MISSING_VARS KEYCLOAK_URL"
fi
if [[ -z "$REALM" ]]; then
    MISSING_VARS="$MISSING_VARS KEYCLOAK_REALM"
fi
if [[ -z "$CLIENT_ID" ]]; then
    MISSING_VARS="$MISSING_VARS KEYCLOAK_CLIENT_ID"
fi
if [[ -z "$CLIENT_SECRET" ]]; then
    MISSING_VARS="$MISSING_VARS KEYCLOAK_CLIENT_SECRET"
fi

if [[ -n "$MISSING_VARS" ]]; then
    log "Error: The following required environment variables are missing:$MISSING_VARS"
    log ""
    log "Usage:"
    log "  KEYCLOAK_URL=https://your-keycloak-url/auth \\"
    log "  KEYCLOAK_REALM=your-realm \\"
    log "  KEYCLOAK_CLIENT_ID=your-client-id \\"
    log "  KEYCLOAK_CLIENT_SECRET=your-secret \\"
    log "  ./get_keycloak_token.sh"
    log ""
    log "Required environment variables:"
    log "  KEYCLOAK_URL - Keycloak server URL with /auth path"
    log "  KEYCLOAK_REALM - Keycloak realm name"
    log "  KEYCLOAK_CLIENT_ID - Keycloak client ID"
    log "  KEYCLOAK_CLIENT_SECRET - Keycloak client secret"
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