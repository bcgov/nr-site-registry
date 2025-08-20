## Overview
The `merge_lto_descirptions` procedure updates subdivision records and their associated site relationships based on new LTO data, but **only processes records that have changed** since the last run.

## Key Components

### 1. **Change Detection Logic**
```sql
cursor get_lto_record is
  select pid, pid_status_cd, legal_description,
    child_pid, child_pid_status_cd, child_legal_description
    from lto_download
  minus
  select pid, pid_status_cd, legal_description,
    child_pid, child_pid_status_cd, child_legal_description
    from lto_prev_download;
```
- Uses `MINUS` operator to find only **new or changed** records
- Compares current download with previous download to avoid reprocessing unchanged data

### 2. **Parent PID Processing**
For each changed record:
- **Updates existing subdivisions** with new PID, status, and legal description
- **Sets `valid_pid`** based on status: `'Y'` for valid statuses, `null` for `'X'` or `'E'`
- **Updates audit fields**: `who_updated = 'LTO-LOAD'`, `when_updated = sysdate`

### 3. **Child PID Processing** (Only if parent status is valid AND child PID exists)
The procedure handles **parent-child relationships** between PIDs:

#### If Child Exists:
- Updates the existing child subdivision record with new information

#### If Child Doesn't Exist:
- **Clones the parent record** to create a new child subdivision
- Copies parent fields: `pin`, `bcaa_folio_number`, `crown_lands_file_no`
- Uses child-specific data: `child_pid`, `child_legal_description`, `child_pid_status_cd`
- Generates new ID using `seq_subdiv.nextval`

### 4. **Site Subdivision Relationships**
For each parent subdivision that has associated sites:
- **Finds all sites** linked to the parent subdivision
- **Creates new site-subdivision links** for the child subdivision if they don't exist
- **Preserves site associations** when PIDs are subdivided

### 5. **Business Rules**

#### Status Code Logic:
- `'X'` = Invalid/Cancelled → `valid_pid = null`
- `'E'` = Expired/Error → `valid_pid = null`  
- Any other status → `valid_pid = 'Y'`

#### Processing Conditions:
- Only processes child PIDs if parent status is **not** `'X'` or `'E'`
- Only processes if `child_pid` is not null

#### Audit Trail:
- All new/updated records marked with `who_created/updated = 'LTO-LOAD'`
- Timestamps set to current date (`sysdate`)

## Real-World Scenario
This handles **land subdivision** scenarios:
1. **Original PID** `123456789` gets subdivided into multiple new PIDs
2. **Parent PID** maintains the original information
3. **Child PIDs** inherit parent characteristics but have their own legal descriptions
4. **Site associations** need to be maintained for both parent and child PIDs
5. **Only changed records** are processed to avoid unnecessary work

## Data Flow
1. **Input**: New LTO data in `lto_download`
2. **Comparison**: Against previous data in `lto_prev_download`
3. **Processing**: Update parent → Process child → Update site relationships
4. **Output**: Updated `subdivisions` and `site_subdivisions` tables

This is essentially a differential data synchronization system that maintains land registry subdivision relationships while preserving site associations and audit trails.
