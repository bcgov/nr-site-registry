#!/bin/bash

#Make sure you change line endings to LF
# In openShift, the .env file is not used. Instead, the environment variables are set in the deployment configuration.
# the command used in openshift and local are different so we initialize migration command here.
if [ ! "$POSTGRESQL_HOST" ];
then
   echo 'Sourcing from .env'
   . ./.env
else
    echo 'Environment variables set...'
fi

# check if postgres is up and running, if not retry 10 times with exponential backoff, if it fails echo failure and exit
for i in {1..10}; do
    echo "Checking if Postgres is up and running..."
    if PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -c '\q'; then
        break
    fi
    echo "Postgres is not up yet. Retrying in $((2 * i)) seconds..."
    sleep $((2 * i))
    if [ "$i" -eq 10 ]; then
        echo "Postgres is not up yet. Exiting..."
        exit 1
    fi
done

echo "Postgres is up and running, proceeding..."

# create schema
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -c "CREATE SCHEMA IF NOT EXISTS $POSTGRES_DB_SCHEMA AUTHORIZATION \"$POSTGRES_DB_USERNAME\""

echo "schema created"

# run type orm migrations
npm run typeorm:run-migrations

echo "Migrations completed."

# Disable constraints before seeding, if file exists
if [ -f "/mnt/sql/disable_constraint.sql" ]; then
    echo "Disabling constraints..."
    PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -f "/mnt/sql/disable_constraint.sql"
fi

# Check for existence of SEED_DATA_PATH
if [ -n "$SEED_DATA_PATH" ]; then
    echo "Seed data set, attempting to load."
    PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -f "$SEED_DATA_PATH"
    echo "Seed data successfully loaded."
else
    echo "SEED_DATA_PATH is not set. Skipping seed data loading."
fi

# Enable constraints after seeding, if file exists
if [ -f "/mnt/sql/enable_constraint.sql" ]; then
    echo "Enabling constraints..."
    PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -f "/mnt/sql/enable_constraint.sql"
fi

echo "Migration process complete."
exit 0
