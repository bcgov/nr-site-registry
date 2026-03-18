#!/bin/bash
set -euo pipefail

echo 'Sourcing environment variables...'
source ./.env

echo 'creating database...'
# Connect to the default "postgres" database to check/create the target database
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=postgres" -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DATABASE';" | grep -q 1 || \
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=postgres" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$POSTGRES_DATABASE\" OWNER $POSTGRES_ADMIN_USERNAME;"

echo 'creating required extensions...'
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -v ON_ERROR_STOP=1 -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;' 
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -v ON_ERROR_STOP=1 -c 'CREATE EXTENSION IF NOT EXISTS postgis;' 

echo 'creating database user...'
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_roles WHERE rolname = '$POSTGRES_DB_USERNAME';" | grep -q 1 || \
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -v ON_ERROR_STOP=1 -c "CREATE ROLE $POSTGRES_DB_USERNAME WITH LOGIN    NOSUPERUSER    NOCREATEDB    NOCREATEROLE    NOINHERIT    NOREPLICATION    CONNECTION LIMIT -1 PASSWORD '$POSTGRES_DB_PASSWORD';"

echo 'creating database schema...'
psql "user=$POSTGRES_ADMIN_USERNAME password=$POSTGRES_ADMIN_PASSWORD host=$POSTGRESQL_HOST port=$POSTGRESQL_PORT dbname=$POSTGRES_DATABASE" -v ON_ERROR_STOP=1 -c "CREATE SCHEMA IF NOT EXISTS $POSTGRES_DB_SCHEMA AUTHORIZATION \"$POSTGRES_DB_USERNAME\""

echo 'Database initialization completed.'

echo 'Installing backend dependencies...'
npm i

echo 'Running database migrations...'
npm run typeorm:run-migrations

echo 'Starting backend in development mode...'
npm run start:debug
