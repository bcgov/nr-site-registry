This guide describes how to upload a SQL file to a PersistentVolume (PV) and make it accessible for multiple pods in read-only mode.

Purpose: We upload the starter yaml (from ora2pg). This makes it readable by all pods, and should work in PR deployments.

## Steps (NEW) using SQL

```bash


ENV=prod ./upload_sql.sh

```

## Steps

1. Create a Temporary Pod:

```bash
# Create pvc
oc apply -f pvc.yaml

# Upload pod - only so we have something to connect to to upload the sql to.
oc apply -f temp-pod.yaml
```

2. Upload the SQL File:

```bash
# oc cp /path/to/your/file.sql temp-pod:/mnt/sql/file.sql
oc cp ./data_migration.sql temp-pod:/mnt/sql/data_migration.sql

```
3. Cleanup:

```bash
oc delete pod temp-pod
```

Your SQL file is now available for read access by any pod that mounts the associated PersistentVolumeClaim (PVC).


4. Ensure migrations are updated

initDB.sh shou


### Debugging Notes

Error, after over 30k lines of `INSERT 0 1`

INSERT 0 1
psql:/mnt/sql/data_migration.sql:37791: server closed the connection unexpectedly
This probably means the server terminated abnormally
before or while processing the request.
psql:/mnt/sql/data_migration.sql:37791: error: connection to server was lost
Seed data successfully loaded.

^ for above, the pvc only has 10mb left. Likely out of memory. Increasing space.