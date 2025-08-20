#!/bin/ksh

# Usage: KEYCLOAK_CLIENT_SECRET=your-secret ./lto_dump.sh [type]
# type: 1 or 2 (required)

# Configuration - all environment variables are required
API_URL="${API_URL}"
OUTPUT_FILE="ltodump.lis"

# Check if required environment variables are set
if [[ -z "$API_URL" ]]; then
    print "Error: API_URL environment variable is required"
    print ""
    print "Usage:"
    print "  API_URL=http://your-api-url:port \\"
    print "  KEYCLOAK_URL=https://your-keycloak-url/auth \\"
    print "  KEYCLOAK_REALM=your-realm \\"
    print "  KEYCLOAK_CLIENT_ID=your-client-id \\"
    print "  KEYCLOAK_CLIENT_SECRET=your-secret \\"
    print "  ./lto_dump.sh [type]"
    print ""
    print "Required environment variables:"
    print "  API_URL - Site registry API URL"
    print "  KEYCLOAK_URL - Keycloak server URL with /auth path"
    print "  KEYCLOAK_REALM - Keycloak realm name"
    print "  KEYCLOAK_CLIENT_ID - Keycloak client ID"
    print "  KEYCLOAK_CLIENT_SECRET - Keycloak client secret"
    print ""
    print "Parameters:"
    print "  type: 1 (PIDs < '025') or 2 (PIDs >= '025')"
    exit 1
fi

# Check if type parameter is provided
if [[ $# -eq 0 ]]; then
    print "Error: Type parameter is required"
    print "Usage: ./lto_dump.sh [type]"
    print " type: 1 (PIDs < '025') or 2 (PIDs >= '025')"
    exit 1
fi

TYPE=$1

# Validate type parameter
if [[ "$TYPE" != "1" ]] && [[ "$TYPE" != "2" ]]; then
    print "Error: Type parameter must be 1 or 2"
    print "  1: PIDs < '025'"
    print "  2: PIDs >= '025'"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR=$(dirname $0)

print "API URL: $API_URL"
print "Type: $TYPE"
print "Output file: $OUTPUT_FILE"

# Step 1: Get access token
print "\nGetting access token..."
ACCESS_TOKEN=$("$SCRIPT_DIR/get_keycloak_token.sh")

# Check if token retrieval was successful
if [[ $? -ne 0 ]] || [[ -z "$ACCESS_TOKEN" ]]; then
    print "Failed to get access token"
    exit 1
fi

print "\nCalling API endpoint..."

# Retry configuration
MAX_RETRIES=5
RETRY_COUNT=0
BASE_DELAY=1

# Function to make API request with retry logic
get_api_data_with_retry() {
    while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [[ $RETRY_COUNT -gt 1 ]]; then
            # Calculate exponential backoff delay
            case $RETRY_COUNT in
                2) DELAY=$((BASE_DELAY * 1)) ;;  # 1s
                3) DELAY=$((BASE_DELAY * 2)) ;;  # 2s
                4) DELAY=$((BASE_DELAY * 4)) ;;  # 4s
                5) DELAY=$((BASE_DELAY * 8)) ;;  # 8s
                *) DELAY=$((BASE_DELAY * 8)) ;;  # fallback to max delay
            esac
            print "Retry attempt $RETRY_COUNT/$MAX_RETRIES after ${DELAY}s delay..."
            sleep $DELAY
        else
            print "Making initial API request (attempt $RETRY_COUNT/$MAX_RETRIES)..."
        fi

        # Make API request
        API_RESPONSE=$(curl -s -X GET \
          "${API_URL}/ltsa/dump?type=${TYPE}" \
          -H "Authorization: Bearer ${ACCESS_TOKEN}" \
          -H "Content-Type: application/json" \
          --connect-timeout 10 \
          --max-time 60)

        # Check if curl command was successful
        CURL_EXIT_CODE=$?
        if [[ $CURL_EXIT_CODE -ne 0 ]]; then
            print "HTTP request failed with curl exit code: $CURL_EXIT_CODE"
            if [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; then
                print "Will retry..."
                continue
            else
                print "All retry attempts exhausted. Final failure."
                return 1
            fi
        fi

        # Check if we got a valid JSON response with status success
        STATUS=$(print "$API_RESPONSE" | jq -r '.status' 2>/dev/null)
        
        if [[ "$STATUS" == "success" ]]; then
            # Verify we have data array
            DATA_COUNT=$(print "$API_RESPONSE" | jq -r '.count' 2>/dev/null)
            if [[ "$DATA_COUNT" != "null" ]] && [[ -n "$DATA_COUNT" ]]; then
                print "Successfully retrieved $DATA_COUNT records on attempt $RETRY_COUNT"
                return 0
            else
                print "Invalid response: missing or null data count"
                print "Response: $API_RESPONSE"
                if [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; then
                    print "Will retry..."
                    continue
                else
                    print "All retry attempts exhausted. Final failure."
                    return 1
                fi
            fi
        else
            print "API returned error status: $STATUS"
            print "Response: $API_RESPONSE"
            if [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; then
                print "Will retry..."
                continue
            else
                print "All retry attempts exhausted. Final failure."
                return 1
            fi
        fi
    done
}

# Call the retry function
if ! get_api_data_with_retry; then
    print "Failed to get API data after $MAX_RETRIES attempts"
    exit 1
fi

print "API call successful"

# Extract the data array and save to file
print $API_RESPONSE | jq -r '.data[]' > $OUTPUT_FILE

# Check if file was created successfully
if [[ $? -eq 0 ]] && [[ -f "$OUTPUT_FILE" ]]; then
    print "Data saved to $OUTPUT_FILE"
    print "Records written: $(wc -l < $OUTPUT_FILE)"
else
    print "Failed to save data to file"
    exit 1
fi

# Display summary
print "\nSummary:"
print $API_RESPONSE | jq '{status, message, type, count, timestamp}'
