# ora2pg Docker 
Container image for migrating from oracle to postgresql database.

## Introduction

This container can be used to migrate from Oracle to PostgreSQL utilizing the tool ora2pg.

Documentation: https://ora2pg.darold.net/documentation.html

## How to build
```
Update the oracle connection string in the "ora2pg.conf" file

```
```
docker build . -t ora2pg

```

## How to run

### Usage:

The container accepts 2 mounted folders

* "/config" (read only) --> mount your folder containing the "ora2pg.conf" file here (example configuration: [ora2pg.conf](https://raw.githubusercontent.com/Guy-Incognito/ora2pg/master/config/ora2pg.conf)
* "/data" --> mount the folder where all output should be written to here

Run the container with:

```
docker run ora2pg 

```

or with a docker-compose:

docker compose up -d --build
