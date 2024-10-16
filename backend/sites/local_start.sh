#!/bin/bash
# create DB dependencies - database, schema
sh initDB.sh

# run type orm migrations
npm run typeorm:run-migrations

# start the API
npm run start:dev
