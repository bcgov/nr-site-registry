#!/bin/ksh

# Usage: ./lto_load_new.sh /real/path/PARCEL_DESCRIPTION_RESPONSE_*.TXT

SCRIPT_DIR=$(cd "$(dirname "$0")" 2>/dev/null && pwd) || exit 1
. "$SCRIPT_DIR/ltsa_common.sh" || exit 1

API_URL=${API_URL:-}
DATA_FILE_ARG=${1:-}
MAX_RETRIES=${LTSA_MAX_RETRIES:-5}
CURL_CONNECT_TIMEOUT=${LTSA_CONNECT_TIMEOUT:-10}
CURL_MAX_TIME=${LTSA_LOAD_MAX_TIME:-120}
TOKEN_COMMAND=${LTSA_TOKEN_COMMAND:-"$SCRIPT_DIR/get_keycloak_token.sh"}

if [ -z "$API_URL" ] || [ -z "$DATA_FILE_ARG" ]; then
    ltsa_log "Usage: API_URL=... KEYCLOAK_... $0 <data_file>"
    exit 1
fi
ltsa_require_command curl || exit 1
ltsa_require_command jq || exit 1

DATA_FILE=$(ltsa_resolve_file "$DATA_FILE_ARG" "$SCRIPT_DIR")
if [ $? -ne 0 ] || [ -z "$DATA_FILE" ] || [ ! -f "$DATA_FILE" ]; then
    ltsa_log "ERROR: data file not found: $DATA_FILE_ARG"
    exit 1
fi
if [ ! -r "$DATA_FILE" ]; then
    ltsa_log "ERROR: data file is not readable: $DATA_FILE"
    exit 1
fi

ACCESS_TOKEN=$("$TOKEN_COMMAND")
token_status=$?
if [ "$token_status" -ne 0 ] || [ -z "$ACCESS_TOKEN" ]; then
    ltsa_log "ERROR: failed to obtain access token"
    exit 1
fi

body_file="${TMPDIR:-/tmp}/ltsa_load.$$.body"
trap 'rm -f "$body_file"' 0 1 2 3 15

attempt=1
request_ok=no
while [ "$attempt" -le "$MAX_RETRIES" ]; do
    delay=$(ltsa_retry_delay "$attempt")
    [ "$delay" -eq 0 ] || sleep "$delay"
    : > "$body_file" || exit 1

    http_status=$(curl -sS -o "$body_file" -w '%{http_code}' -X POST \
        "${API_URL}/ltsa/load" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Accept: application/json" \
        -F "file=@${DATA_FILE}" \
        --connect-timeout "$CURL_CONNECT_TIMEOUT" \
        --max-time "$CURL_MAX_TIME")
    curl_status=$?

    if [ "$curl_status" -ne 0 ] && ltsa_is_retryable_curl "$curl_status"; then
        ltsa_log "Load network failure (curl $curl_status, attempt $attempt/$MAX_RETRIES)"
        retry=yes
    elif [ "$curl_status" -ne 0 ]; then
        ltsa_log "ERROR: load failed with non-retryable curl exit $curl_status"
        exit 1
    elif ltsa_is_retryable_http "$http_status"; then
        ltsa_log "Load received retryable HTTP $http_status (attempt $attempt/$MAX_RETRIES)"
        retry=yes
    elif [ "$http_status" -lt 200 ] 2>/dev/null || [ "$http_status" -ge 300 ] 2>/dev/null; then
        ltsa_log "ERROR: load failed with non-retryable HTTP $http_status"
        exit 1
    else
        request_ok=yes
        break
    fi

    if [ "$retry" = yes ] && [ "$attempt" -lt "$MAX_RETRIES" ]; then
        attempt=$((attempt + 1))
        continue
    fi
    break
done

if [ "$request_ok" != yes ]; then
    ltsa_log "ERROR: load request exhausted $MAX_RETRIES attempts"
    exit 1
fi

api_status=$(jq -er '.status | select(type == "string")' "$body_file" 2>/dev/null)
if [ $? -ne 0 ]; then
    ltsa_log "ERROR: load response is not valid status JSON"
    exit 1
fi
case "$api_status" in
    success|warning) ;;
    *)
        api_message=$(jq -r '.message // "application rejected file"' "$body_file" 2>/dev/null)
        ltsa_log "ERROR: $api_message"
        exit 1
        ;;
esac

api_message=$(jq -r '.message // "file accepted"' "$body_file" 2>/dev/null)
api_count=$(jq -r '
    (.recordsLoaded // .count // .recordsProcessed // .processed // 0)
    | if type == "number" then . else 0 end
' "$body_file" 2>/dev/null)
case "$api_count" in
    ''|*[!0-9]*) api_count=0 ;;
esac
ltsa_emit_result "$api_status" load "$DATA_FILE" "$api_message" "$api_count"
exit 0
