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

API_RESPONSE=$(curl -s -X GET \
  "${API_URL}/ltsa/dump?type=${TYPE}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json")

# Check if API request was successful
if [[ $? -ne 0 ]]; then
    print "Failed to make API request"
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
