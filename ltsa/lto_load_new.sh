#!/bin/ksh

# Usage: ./lto_load_new.sh [data_file]
# data_file: path to the .txt file to upload (optional, defaults to load_test_data.txt)

# Configuration - all environment variables are required
API_URL="${API_URL}"
DEFAULT_DATA_FILE="load_test_data.txt"
# DEFAULT_DATA_FILE="load_test_data_subset.txt"

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
    print "  ./lto_load_new.sh [data_file]"
    print ""
    print "Required environment variables:"
    print "  API_URL - Site registry API URL"
    print "  KEYCLOAK_URL - Keycloak server URL with /auth path"
    print "  KEYCLOAK_REALM - Keycloak realm name"
    print "  KEYCLOAK_CLIENT_ID - Keycloak client ID"
    print "  KEYCLOAK_CLIENT_SECRET - Keycloak client secret"
    print ""
    print "Parameters:"
    print "  data_file: path to the .txt file to upload (optional, defaults to load_test_data.txt)"
    exit 1
fi

# Check if data file parameter is provided, otherwise use default
if [[ $# -eq 0 ]]; then
    DATA_FILE="$DEFAULT_DATA_FILE"
else
    DATA_FILE="$1"
fi

# Get the directory where this script is located
SCRIPT_DIR=$(dirname "$0")

# Check if data file exists
if [[ ! -f "$SCRIPT_DIR/$DATA_FILE" ]]; then
    print "Error: Data file '$DATA_FILE' not found in $SCRIPT_DIR"
    print "Available data files in $SCRIPT_DIR:"
    ls -la "$SCRIPT_DIR"/*.txt 2>/dev/null || print "  No .txt files found"
    exit 1
fi

print "API URL: $API_URL"
print "Data file: $DATA_FILE"

# Step 1: Get access token
print "\nGetting access token..."
ACCESS_TOKEN=$("$SCRIPT_DIR/get_keycloak_token.sh")

# Check if token retrieval was successful
if [[ $? -ne 0 ]] || [[ -z "$ACCESS_TOKEN" ]]; then
    print "Failed to get access token"
    exit 1
fi

print "\nUploading file to API endpoint..."

# Upload the file using curl
API_RESPONSE=$(curl -s -X POST \
  "${API_URL}/ltsa/load" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -F "file=@${SCRIPT_DIR}/${DATA_FILE}")

# Check if API request was successful
if [[ $? -ne 0 ]]; then
    print "Failed to make API request"
    exit 1
fi

print "API call successful"

# Display the response
print "\nAPI Response:"
print "$API_RESPONSE"

print "\nTrying to parse JSON..."
if print "$API_RESPONSE" | jq '.' > /dev/null 2>&1; then
    print "JSON is valid, formatting:"
    print "$API_RESPONSE" | jq '.'
    
    # Check if the response indicates success
    STATUS=$(print "$API_RESPONSE" | jq -r '.status')
    if [[ "$STATUS" == "success" ]]; then
        print "\nFile successfully processed!"
        print "Check the backend console for the file content output."
    else
        print "\nAPI returned an error status"
        exit 1
    fi
else
    print "JSON parsing failed. Raw response above."
    print "This might indicate an API error or malformed JSON."
    exit 1
fi
