#!/bin/bash

echo 'Sourcing environment variables...'
source ./.env

echo 'Installing frontend dependencies...'
npm i

echo 'Running database migrations...'

echo 'Starting frontend...'
npm run start
