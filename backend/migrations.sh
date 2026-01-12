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

echo "Migrations completed successfully."


# check if psql is present in container  or not
if ! command -v psql &> /dev/null
then
    echo "psql could not be found"
    exit 1
fi

# Check if bcgw user exists and grant permissions if it does
# note: the BCGW user is created in the .dbdeployer.yaml file using the crunchy Postgres operator, so it should already exist.
echo "Checking if bcgw user exists..."
if PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -tAc "SELECT 1 FROM pg_roles WHERE rolname='bcgw'" | grep -q 1; then
    echo "bcgw user exists. Granting permissions..."
    PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" <<EOF
    GRANT USAGE ON SCHEMA sites TO bcgw;
    GRANT SELECT ON ALL TABLES IN SCHEMA sites TO bcgw;
EOF
    echo "Permissions granted to bcgw user."
else
    echo "bcgw user does not exist. Skipping permission grants."
fi

# check if seed is enabled or not SEED_ENABLED should be true
if [ "$SEED_ENABLED" != "true" ]; then
    echo "Seed data is not enabled. Skipping seed data load."
else
    echo "SEED DATA PATH :: $SEED_DATA_PATH"
    # check if seed data path is set or not
    if [ -z "$SEED_DATA_PATH" ]; then
        echo "SEED_DATA_PATH is not set. Skipping seed data load."
    else
        # check if sites table has any rows
        if [ "$(PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -t -c "SELECT count(*) FROM sites.sites;")" -gt 0 ]; then
            echo "Seed data already loaded. Skipping seed data load."
        else
            echo "Seed data set, seed is enabled, and db is blank. Will disable constraints."
            # Disable constraints before seeding, if file exists
            if [ -f "/mnt/sql/disable_constraints.sql" ]; then
                echo "Disabling constraints..."
                PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -f "/mnt/sql/disable_constraints.sql"
            fi

            echo "Seed data set, attempting to load (this might take a while)..."
            PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -q -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -f "$SEED_DATA_PATH" > /dev/null
            echo "Seed data successfully loaded."

            # Enable constraints after seeding, if file exists
            if [ -f "/mnt/sql/enable_constraints.sql" ]; then
                echo "Enabling constraints..."
                PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql -h "$POSTGRESQL_HOST" -d "$POSTGRES_DATABASE" -U "$POSTGRES_ADMIN_USERNAME" -f "/mnt/sql/enable_constraints.sql"
            fi
        fi
    fi
fi

npm run seed:generic-seeder

echo "Migration process complete with seed data loaded if applicable."
exit 0