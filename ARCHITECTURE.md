# SITE Registry Rebuild Architecture

## Context

The SITE rebuild aims to provide a new interface for the Site Registry by
creating a new application that performs a two way sync between its data store
and the data store of the legacy SITE.

```mermaid
C4Context
  accTitle: SITE Rebuild Context Diagram
  accDescr: An overview of how the rebuilt SITE relates to the user and the legacy SITE.

  Person_Ext(user, "SITE User", "A person who wants to purchase Site data")
  Enterprise_Boundary(b0, "Government of BC") {
    System(legacy, "Legacy SITE", "Oracle Forms")
    System(rebuild, "Rebuilt SITE", "Docker Application")
    BiRel(legacy, rebuild, "Bidirection Database Sync", "Debezium")
  }

  BiRel(user, legacy, "Uses", "???")
  BiRel(user, rebuild, "Uses", "HTTPS")
```

```mermaid
C4Container
  accTitle: SITE Rebuild Container Diagram
  accDescr: This diagram details the individual services that make up the SITE Rebuild.

  Person_Ext(user, "SITE User", "A person(?) who wants to purchase(?) Site data")
  Enterprise_Boundary(b0, "Government of BC") {
    System_Boundary(b1, "Legacy SITE") {
      Container_Ext(oforms, "Oracle Forms")
      ContainerDb_Ext(odb, "Oracle DB")
      BiRel(oforms, odb, "queries", "SQL")
    }
    System_Boundary(b2, "Rebuilt SITE") {
      Container(site, "SITE", "NestJS")
      Container(frontend, "frontend", "REACT")
      ContainerDb(sitedb, "SITE Database", "PostgreSQL")
      Container(etl, "ETL", "Debezium")
      BiRel(frontend, site, "Queries", "GraphQL")
      BiRel(site, sitedb, "Queries", "TypeORM/SQL")
    }
    BiRel(etl, sitedb, "Monitors", "debezium")
    BiRel(etl, odb, "two way sync", "debezium")
  }
  BiRel(user, oforms, "Uses", "???")
  BiRel(user, frontend, "Uses", "HTTPS")
```
