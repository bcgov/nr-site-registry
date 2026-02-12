#!/bin/bash

echo 'Sourcing environment variables...'
source ./.env

echo 'Installing frontend dependencies...'
npm i


echo 'Starting frontend...'
npm run start
