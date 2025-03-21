This guide describes how to upload a SQL file to a PersistentVolume (PV) and make it accessible for multiple pods in read-only mode.

Purpose: We upload the starter yaml (from ora2pg). This makes it readable by all pods, and should work in PR deployments.

## Steps (NEW, using script)

```bash

## Prod only, pass in ENV var, so it uploads constraints too
ENV=prod ./upload_sql.sh

## If it fails, make sure to delete temp pod
oc delete temp-pod.

```

## Steps (Old, manual way)

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

initDB.sh / migrations.sh

