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
    if PGPASSWORD="$POSTGRES_DB_PASSWORD" psql "host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE user=$POSTGRES_DB_USERNAME" -c '\q'; then
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

# create schema - still need admin user for this
PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql "host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE user=$POSTGRES_ADMIN_USERNAME" -c "CREATE SCHEMA IF NOT EXISTS $POSTGRES_DB_SCHEMA AUTHORIZATION \"$POSTGRES_DB_USERNAME\""

echo "schema created"

# run type orm migrations
npm run typeorm:run-migrations

echo "migrations completed"

# Check for existence of SEED_DATA_PATH
if [ -n "$SEED_DATA_PATH" ]; then
    echo "Seed data set, attempting to load."
    PGPASSWORD="$POSTGRES_DB_PASSWORD" psql "host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE user=$POSTGRES_DB_USERNAME" -f "$SEED_DATA_PATH"
    echo "Seed data successfully loaded."
else
    echo "SEED_DATA_PATH is not set. Skipping seed data loading."
fi

exit 0
