whenever oserror exit oscode
whenever sqlerror exit sql.sqlcode

set termout off;

rem -------------------------------------------------------------------
rem SRDUMP.SQL
rem
rem This sql*plus script file calls all of the SR Data Extraction
rem scripts, in preparation of a data download to the SR system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * download date added
rem 95.jan.05 ddjm * AECs, AECSRCs, and SITEPROFILE dropped (for now)
rem 96.jan.18 ddjm * format revisions
rem 96.jan.31 ddjm * include site profile header
rem 96.feb.01 ddjm * include site profiles land use histories info
rem 97.oct.05 emv  * Include a timestamp between each section.
rem 98.oct.02 js   * Included SITE application disable and enable during extraction
rem -------------------------------------------------------------------

set termout on;

set arraysize 5;

prompt Starting SR Extraction...

prompt Disabling SITE Application for duration of BCOnline Extraction
start sis_app_disable.sql

prompt DOWNLOAD DATE...
start srdate
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt SITES...
start srsites
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt EVENTS...
start srevents
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt EVENT PARTICIPANTS...
start srevpart
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt PINs AND PIDs...
start srpinpid
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt SITE PARTICIPANTS...
start srsitpar
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt SITE PARTICIPANT ROLES...
start srparrol
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt SITE DOCUMENTS...
start srsitdoc
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt SITE DOCUMENT PARTICIPANTS...
start srdocpar
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt LAND HISTORIES...
start srlands
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt ASSOCIATIONS...
start srassocs
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt SITE PROFILES...
start srprofil
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt PROFILE ANSWERS...
start srprfans
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt PROFILE LAND USES...
start srprfuse
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt PROFILE CATEGORIES...
start srprfcat
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt PROFILE QUESTIONS...
start srprfque
select to_char(sysdate,'HH:MI:SS') from dual; 

prompt DONE!!!

exit;
