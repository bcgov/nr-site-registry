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

# Retry configuration
MAX_RETRIES=5
RETRY_COUNT=0
BASE_DELAY=1

# Function to make token request with retry logic
get_token_with_retry() {
    while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [[ $RETRY_COUNT -gt 1 ]]; then
            # Calculate exponential backoff delay: 2^(attempt-1) * base_delay
            case $RETRY_COUNT in
                2) DELAY=$((BASE_DELAY * 1)) ;;  # 1s
                3) DELAY=$((BASE_DELAY * 2)) ;;  # 2s
                4) DELAY=$((BASE_DELAY * 4)) ;;  # 4s
                5) DELAY=$((BASE_DELAY * 8)) ;;  # 8s
                *) DELAY=$((BASE_DELAY * 8)) ;;  # fallback to max delay
            esac
            log "Retry attempt $RETRY_COUNT/$MAX_RETRIES after ${DELAY}s delay..."
            sleep $DELAY
        else
            log "Making initial token request (attempt $RETRY_COUNT/$MAX_RETRIES)..."
        fi

        # Get access token from Keycloak using client credentials flow
        TOKEN_RESPONSE=$(curl -s -X POST \
          "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
          -H "Content-Type: application/x-www-form-urlencoded" \
          -d "grant_type=client_credentials" \
          -d "client_id=${CLIENT_ID}" \
          -d "client_secret=${CLIENT_SECRET}" \
          --connect-timeout 10 \
          --max-time 30)

        # Check if curl command was successful
        CURL_EXIT_CODE=$?
        if [[ $CURL_EXIT_CODE -ne 0 ]]; then
            log "HTTP request failed with curl exit code: $CURL_EXIT_CODE"
            if [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; then
                log "Will retry..."
                continue
            else
                log "All retry attempts exhausted. Final failure."
                return 1
            fi
        fi

        # Check if we got a valid JSON response with access_token
        ACCESS_TOKEN=$(print "$TOKEN_RESPONSE" | jq -r '.access_token' 2>/dev/null)
        
        if [[ "$ACCESS_TOKEN" != "null" ]] && [[ -n "$ACCESS_TOKEN" ]]; then
            log "Successfully obtained access token on attempt $RETRY_COUNT"
            return 0
        else
            log "Invalid or missing access token in response"
            log "Response: $TOKEN_RESPONSE"
            if [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; then
                log "Will retry..."
                continue
            else
                log "All retry attempts exhausted. Final failure."
                return 1
            fi
        fi
    done
}

# Call the retry function
if ! get_token_with_retry; then
    log "Failed to get access token after $MAX_RETRIES attempts"
    exit 1
fi

log "Successfully obtained access token"
log "Token (first 20 chars): ${ACCESS_TOKEN:0:20}..."

# Output the token to stdout
print "$ACCESS_TOKEN" 