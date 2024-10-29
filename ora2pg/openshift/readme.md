This guide describes how to upload a SQL file to a PersistentVolume (PV) and make it accessible for multiple pods in read-only mode.

Purpose: We upload the starter yaml (from ora2pg). This makes it readable by all pods, and should work in PR deployments.

## Steps

1. Create a Temporary Pod:

```bash
Copy code
oc apply -f temp-pod.yaml
```

2. Upload the SQL File:

```bash
Copy code
oc cp /path/to/your/file.sql temp-pod:/mnt/sql/file.sql
```
3. Cleanup:

```bash
Copy code
oc delete pod temp-pod
```
Your SQL file is now available for read access by any pod that mounts the associated PersistentVolumeClaim (PVC).