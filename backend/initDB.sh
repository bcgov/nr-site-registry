#!/bin/bash

#Make sure you change line endings to LF

if [ ! "$POSTGRESQL_HOST" ];
then
   echo 'Sourcing from .env'
   . ./.env
else
    echo 'Environment variables set...'
fi

# create database
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT" -c "CREATE DATABASE $POSTGRES_DATABASE OWNER $POSTGRES_ADMIN_USERNAME;"

# create extension
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;'

#create postgis extension
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -c 'CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA public;'

echo 'pwd'
echo "$POSTGRES_DB_PASSWORD";

# create schema user
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -c "CREATE ROLE $POSTGRES_DB_USERNAME WITH LOGIN    NOSUPERUSER    NOCREATEDB    NOCREATEROLE    NOINHERIT    NOREPLICATION    CONNECTION LIMIT -1 PASSWORD '$POSTGRES_DB_PASSWORD';"

# create schema
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -c "CREATE SCHEMA IF NOT EXISTS $POSTGRES_DB_SCHEMA AUTHORIZATION $POSTGRES_DB_USERNAME"

echo "init db complete"

# # Set NPM_CONFIG_CACHE environment variable
# export NPM_CONFIG_CACHE=/home/node/.npm

# # Ensure ownership of .npm folder
# mkdir -p /home/node/.npm \
#     && chown -R node:node /home/node/.npm

# # NPM Permission Fix
# mkdir -p /.npm
# chown -R  1015500000:0 /.npm

# run type orm migrations
npm run typeorm:run-migrations

echo "migrations completed"

# Check for existence of SEED_DATA_PATH
# In OpenShift, $SEED_DATA_PATH should point to a PVC that contains storage
# See ora2pg/openshift/readme.md in this repo for setup of that.
if [ -n "$SEED_DATA_PATH" ]; then
    # TODO TODO: DO NOT ACCEPT WITHOUT
    # Need a safety to only run seed file if db is empty or something? Experiment with restarting it, try adding records, etc.
    # TODO:  Move this to separate initContainer, just left here to verify it works as we're close.

    # Run the seed data SQL file
    echo "Seed data set, attempting to load."
    PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -f "$SEED_DATA_PATH"
    # psql: error: connection to server at "nr-site-registry-143-bitnami-pg" (10.98.70.107), port 5432 failed: fe_sendauth: no password supplied
    echo "Seed data successfully loaded."
else
    echo "SEED_DATA_PATH is not set. Skipping seed data loading."
fi

exit 0
