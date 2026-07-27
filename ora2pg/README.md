# ora2pg Docker 
Container image for migrating data from oracle to postgresql database.

## Introduction

This container can be used to migrate from Oracle to PostgreSQL utilizing the tool ora2pg.

Documentation: https://ora2pg.darold.net/documentation.html

## How to build

Update the oracle connection string by modifying the values for ORACLE_DSN, ORACLE_USER and ORACLE_PWD in the "ora2pg.conf" file and execute the below command

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

```
docker compose up -d --build

```

### Bootstrapping the Database

First we need to apply the `site_postgres_cluster.yaml` configuration to bring
up the database. We use the Crunchy Postgres Operator for our database,
configured with high availability, automated backups and so forth.

[Crunchy Postgres Operator Documentation](https://access.crunchydata.com/documentation/postgres-operator/latest/overview)

Some interesting things to note:

- The Postgres Crunchy Operator exposes a prometheus port. This could be useful
  for building a metrics dashboard.

- We use custom images to deploy up to date databases. You can find more
  information about the images that are compatible with our OpenShift
  environment in the
  [BCGov Crunchy Postgres Repo README](https://github.com/bcgov/crunchy-postgres?tab=readme-ov-file#current-compatible-images).

- We need to specify a network policy to allow traffic into the PostgresCluster.
  The is presumably because we have a deny-by-default policy globally and this
  allows traffic to occur between all the moving parts of the postgres cluster.

- We do not have an Ingress for external services like BCGW to connect to our
  database because Kubernetes Ingresses are protocol aware and only apply to
  HTTP(S) traffic. PostgreSQL is raw TCP so an ingress is not needed, it is
  provided by the NetworkPolicy.

_Before running any `oc` commands, make sure you are using the correct namespace
with `oc project`_

Before we can deploy the database we must first deploy its configuration. There
isn't much to configure here. `site_postgres_cluster_config_map.yaml` defines
the initial SQL code to run when the database is initially brought up. Right now
all it does is install the UUID extension, which lets the database generate
UUIDs

1. Apply all the necessary configuration from
   `<environment>/site_registry/database/`.

   1. Apply ConfigMap
   2. Apply NetworkPolicy
   3. Apply Secret
   4. Fill out the secret values (TODO: come up with a way to share these)
   5. Apply the PostgresCluster

   example:

   ```sh
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_config_map.yaml
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_network_policy.yaml
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_secret.yaml
   # Go fill out the secrets.
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster.yaml
   ```

   The crunchy cluster usually takes 10+ minutes to initialize. You may see some
   initial backup jobs failing. This happens sometimes. It's fine as long as it
   performs a successful run eventually.

2. Prepare a PVC with the required seed data files.

   _if the PVC already exists you can skip this step unless you need to update
   the seed data._

   Apply the `site_postgres_cluster_init_pvc.yaml` file, and copy the `ora2pg`
   files to it: `disable_constraints.sql`, `enable_constraints.sql`,
   `rwmFlagLogic.sql` and `data_migration.sql`. See `ora2pg/README.md` for
   instructions on how to generate `data_migration.sql`

   In order to do this you will need to mount the PVC to a pod. I usually do
   something like this:

   ```sh
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_init_pvc.yaml
   # It can take the PVC several minutes to provision.
   oc run pvc-inspect \
       --image=alpine:3.20 \
       --restart=Never \
       --overrides='{
           "apiVersion":"v1",
           "spec":{
           "containers":[
               {
                   "name":"pvc-inspect",
                   "image":"alpine:3.20",
                   "command":["sh","-c","sleep 3600"],
                   "volumeMounts":[{"name":"sql","mountPath":"/mnt/sql","readOnly":false}]
               }
           ],
           "volumes":[{"name":"sql","persistentVolumeClaim":{"claimName":"site-postgres-cluster-db-init"}}]
           }
       }'

   oc -n c6a6e5-dev wait --for=condition=Ready pod/pvc-inspect --timeout=300s
   ```

   You can then copy files with a command like this:

   ```sh
   oc cp ./data_migration.sql pvc-inspect:/mnt/sql/data_migration.sql
   oc cp ./ora2pg/db_script/rwmFlagLogic.sql pvc-inspect:/mnt/sql/rwmFlagLogic.sql
   ```

   Sometimes for large files this copy command will flake out. If that happens,
   this is a trick I've used to work around the issue using posix pipes:

   ```sh
   cat ./data_migration.sql | oc exec -i "pvc-inspect" -- sh -c "cat > /mnt/sql/data_migration.sql"
   ```

   **If you do this you MUST validate that the transfer actually worked.**

   ```sh
   sha256sum ./data_migration.sql
   oc exec "pvc-inspect" -- sha256sum /mnt/sql/data_migration.sql
   ```

   These two values must be _exactly_ the same.

   When done, you can clean up the temporary pod with:

   ```sh
   oc delete pod pvc-inspect
   ```

3. Run the database initialization job.

   ```sh
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_db_init_job.yaml
   ```

   Once applied the job should immediately run. If you check the pod's logs for
   the run you should see it complete. It takes quite a while since it's copying
   a lot of data (In my last run it generated about 1.5M log lines).

4. Install the BCGW network permissions.

   Now add the necessary service, network policy, and transport server claim
   definitions for the BCGW integration:

   ```sh
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_bcgw_service.yaml
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_bcgw_network_policy.yaml
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_bcgw_transport_server_claim.yaml
   ```

5. Install the pgBackrest Log Rotator.

   Long story short: there's a bug in the crunchy postgres operator where the
   pgbackrest logs will grow unbounded because their log rotation configuration
   was broken a while ago. The GitHub issue has been open for a long time, and I
   don't see this issue getting resolved any time soon. This cronjob will
   nightly reach into the PVC and rotate the logs.

   ```sh
   oc apply -f ./openshift/site_registry/dev/database/site_postgres_cluster_log_rotator_cronjob.yaml
   ```

