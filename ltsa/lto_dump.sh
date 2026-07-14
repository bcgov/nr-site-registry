#!/bin/ksh

# Usage: OUTPUT_FILE=/absolute/path/file ./lto_dump.sh 1|2

SCRIPT_DIR=$(cd "$(dirname "$0")" 2>/dev/null && pwd) || exit 1
. "$SCRIPT_DIR/ltsa_common.sh" || exit 1

API_URL=${API_URL:-}
TYPE=${1:-}
OUTPUT_FILE=${OUTPUT_FILE:-"$PWD/ltodump.lis"}
MAX_RETRIES=${LTSA_MAX_RETRIES:-5}
CURL_CONNECT_TIMEOUT=${LTSA_CONNECT_TIMEOUT:-10}
CURL_MAX_TIME=${LTSA_DUMP_MAX_TIME:-60}
TOKEN_COMMAND=${LTSA_TOKEN_COMMAND:-"$SCRIPT_DIR/get_keycloak_token.sh"}

if [ -z "$API_URL" ] || { [ "$TYPE" != 1 ] && [ "$TYPE" != 2 ]; }; then
    ltsa_log "Usage: API_URL=... KEYCLOAK_... OUTPUT_FILE=... $0 1|2"
    exit 1
fi
ltsa_require_command curl || exit 1
ltsa_require_command jq || exit 1

output_dir=$(dirname "$OUTPUT_FILE") || exit 1
output_base=$(basename "$OUTPUT_FILE") || exit 1
if [ ! -d "$output_dir" ]; then
    ltsa_log "ERROR: output directory does not exist: $output_dir"
    exit 1
fi
output_dir=$(cd "$output_dir" 2>/dev/null && pwd) || exit 1
OUTPUT_FILE="$output_dir/$output_base"

body_file="$output_dir/.${output_base}.$$.response"
temp_output="$output_dir/.${output_base}.$$.tmp"
trap 'rm -f "$body_file" "$temp_output"' 0 1 2 3 15

ACCESS_TOKEN=$("$TOKEN_COMMAND")
token_status=$?
if [ "$token_status" -ne 0 ] || [ -z "$ACCESS_TOKEN" ]; then
    ltsa_log "ERROR: failed to obtain access token"
    exit 1
fi

attempt=1
request_ok=no
while [ "$attempt" -le "$MAX_RETRIES" ]; do
    delay=$(ltsa_retry_delay "$attempt")
    [ "$delay" -eq 0 ] || sleep "$delay"
    : > "$body_file" || exit 1

    http_status=$(curl -sS -o "$body_file" -w '%{http_code}' -X GET \
        "${API_URL}/ltsa/dump?type=${TYPE}" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Accept: application/json" \
        --connect-timeout "$CURL_CONNECT_TIMEOUT" \
        --max-time "$CURL_MAX_TIME")
    curl_status=$?

    if [ "$curl_status" -ne 0 ] && ltsa_is_retryable_curl "$curl_status"; then
        ltsa_log "Dump network failure (curl $curl_status, attempt $attempt/$MAX_RETRIES)"
        retry=yes
    elif [ "$curl_status" -ne 0 ]; then
        ltsa_log "ERROR: dump failed with non-retryable curl exit $curl_status"
        exit 1
    elif ltsa_is_retryable_http "$http_status"; then
        ltsa_log "Dump received retryable HTTP $http_status (attempt $attempt/$MAX_RETRIES)"
        retry=yes
    elif [ "$http_status" -lt 200 ] 2>/dev/null || [ "$http_status" -ge 300 ] 2>/dev/null; then
        ltsa_log "ERROR: dump failed with non-retryable HTTP $http_status"
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
    ltsa_log "ERROR: dump request exhausted $MAX_RETRIES attempts"
    exit 1
fi

api_status=$(jq -er '.status | select(type == "string")' "$body_file" 2>/dev/null)
if [ $? -ne 0 ] || [ "$api_status" != success ]; then
    ltsa_log "ERROR: dump response status was not success"
    exit 1
fi
api_count=$(jq -er '.count | select(type == "number" and . >= 0)' "$body_file" 2>/dev/null)
if [ $? -ne 0 ]; then
    ltsa_log "ERROR: dump response has no valid count"
    exit 1
fi
if ! jq -er '
    .data
    | type == "array"
      and all(.[]; type == "string" and test("^[0-9]{9}$"))
' "$body_file" >/dev/null 2>&1; then
    ltsa_log "ERROR: dump response data must contain only nine-digit PID strings"
    exit 1
fi
if ! jq -r '.data[]' "$body_file" > "$temp_output"; then
    ltsa_log "ERROR: could not extract dump data"
    exit 1
fi
written_count=$(wc -l < "$temp_output" | tr -d ' ')
if [ "$written_count" != "$api_count" ]; then
    ltsa_log "ERROR: dump count mismatch (API $api_count, file $written_count)"
    exit 1
fi
if ! mv "$temp_output" "$OUTPUT_FILE"; then
    ltsa_log "ERROR: could not atomically publish $OUTPUT_FILE"
    exit 1
fi

ltsa_emit_result success dump "$OUTPUT_FILE" "dump published" "$written_count"
exit 0
