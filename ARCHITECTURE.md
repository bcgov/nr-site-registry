# SITE Registry Rebuild Architecture

## Context

The SITE rebuild aims to provide a new interface for the Site Registry by
creating a new application that performs a two way sync between its data store
and the data store of the legacy SITE.

```mermaid
---
title: SITE Rebuild Context Diagram
---
flowchart TB
  accTitle: SITE Rebuild Context Diagram
  accDescr: An overview of the uses of the SITE System

  ExtUser(["External User<br /><br />Someone who wants to<br />purchase site registry<br />information"])

  subgraph "Government of BC"
    Site("Rebuilt SITE<br /><br />Docker-Compose Application")
    Esra("ESRA<br /><br />Legacy Web Application")
    Legacy("Legacy SITE<br /><br />Oracle Forms Application")
    IntUser(["Internal User<br /><br />A government worker who needs<br />access to site information"])
  end

  ExtUser <--"Uses"--> Site
  ExtUser <--"Used"--> Esra
  Esra <--"Queries"--> Legacy
  IntUser <--"Used"--> Legacy
  IntUser <--"Uses"--> Site
  Legacy --"Data Import"--> Site
```

```mermaid
---
title: SITE Rebuild Container Diagram
---
flowchart TB
  accTitle: SITE Rebuild Container Diagram
  accDescr: This diagram details the individual services that make up the SITE Rebuild.

  ExtUser(["External User<br /><br />Someone who wants to<br />purchase site registry<br />information"])

  subgraph "Government of BC"
    subgraph "SITE Rebuild"
      Site("SITE<br /><br />NestJS")
      FrontEnd("Front End<br /><br />REACT")
      SiteDb[("Database<br /><br />PostgreSQL")]
      Etl("ETL<br /><br />Unused two-way sync")
      Ora2Pg("ora2pg<br /><br />Database Importer")

      FrontEnd <--"Queries (GraphQL)"--> Site
      Site <--"Queries (SQL/TypeORM)"-->SiteDb
    end

    Esra("ESRA<br /><br />Legacy Web Application")
    Legacy("Legacy SITE<br /><br />Oracle Forms Application")
    IntUser(["Internal User<br /><br />A government worker who needs<br />access to site information"])
    
    Legacy --"One-time data import"--> Ora2Pg --> SiteDb

  end

  ExtUser <--"Uses (HTTPS)"--> FrontEnd
  ExtUser <--"Used"--> Esra
  Esra <--"Queries"--> Legacy
  IntUser <--"Used"--> Legacy
  IntUser <--"Uses (HTTPS)"--> FrontEnd
```

