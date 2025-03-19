#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Variables
TEMP_POD="temp-pod"
PVC_FILE="pvc.yaml"
POD_FILE="temp-pod.yaml"
SQL_FILE="data_migration.sql"
# Contstraints files only exist in prod, not everywhere.
ENABLE_CONSTRAINT_FILE="enable_constraint.sql"
DISABLE_CONSTRAINT_FILE="disable_constraint.sql"

# Apply PVC
oc apply -f "$PVC_FILE"

# Deploy temporary pod
oc apply -f "$POD_FILE"

# Wait for pod to be ready
echo "Waiting for pod to be ready..."
oc wait --for=condition=Ready pod/$TEMP_POD --timeout=60s

# Copy main SQL file
if [[ -f "$SQL_FILE" ]]; then
    oc cp "$SQL_FILE" "$TEMP_POD:/mnt/sql/$SQL_FILE"
    echo "Uploaded $SQL_FILE"
else
    echo "Error: $SQL_FILE not found!"
    exit 1
fi

# Copy optional constraint files (only in production)
if [[ "$ENV" == "prod" ]]; then
    if [[ -f "$ENABLE_CONSTRAINT_FILE" ]]; then
        oc cp "$ENABLE_CONSTRAINT_FILE" "$TEMP_POD:/mnt/sql/$ENABLE_CONSTRAINT_FILE"
        echo "Uploaded $ENABLE_CONSTRAINT_FILE"
    fi

    if [[ -f "$DISABLE_CONSTRAINT_FILE" ]]; then
        oc cp "$DISABLE_CONSTRAINT_FILE" "$TEMP_POD:/mnt/sql/$DISABLE_CONSTRAINT_FILE"
        echo "Uploaded $DISABLE_CONSTRAINT_FILE"
    fi
fi

# Cleanup pod
echo "Cleaning up..."
oc delete pod "$TEMP_POD" --wait=true

echo "Done! SQL files are now available."
