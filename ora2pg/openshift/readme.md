This guide describes how to upload a SQL file to a PersistentVolume (PV) and make it accessible for multiple pods in read-only mode.

Purpose: We upload the starter yaml (from ora2pg). This makes it readable by all pods, and should work in PR deployments.

TODO: Once this is done and working, must make sure that the `initDb.sh` is modified to check for existence of file at `/mnt/sql/file.sql`, and if so, it reads it.

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
oc cp /path/to/your/file.sql temp-pod:/mnt/sql/file.sql
```
3. Cleanup:

```bash
oc delete pod temp-pod
```
Your SQL file is now available for read access by any pod that mounts the associated PersistentVolumeClaim (PVC).