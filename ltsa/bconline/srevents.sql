set termout off;

rem -------------------------------------------------------------------
rem SREVENTS.SQL
rem
rem This sql*plus script file extracts the SR_EVENTS information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length changed; 1st blank line dropped
rem 95.jan.05 ddjm * leading zeros for site & event IDs
rem 97.feb.26 bsw  * removed comletion_date from select
rem 97.nov.07 emv  * changed order by clause. 
rem 01.mar.28 pf   * commented out arraysize line to work with Oracle 8i6
rem 03.jun.23 ddjm * emergency fix for event_type field size
rem -------------------------------------------------------------------

set pagesize    0;
set linesize 3900;
set embedded   on;
set feedback  off;
set heading   off;

REM 01.mar.28 
rem set arraysize   1;

spool srevents.lis

column siteid           format a10;
column eventid          format a10;
column event_type       format a120;
column event_class	format a80;
column eventdate        format a10;
column approval_date	format a10;
column ministry_contact	format a150;
column note		format a500;
column required_action	format a2000;

select all substr(to_char(site_id,'0999999999'),2,10)  siteid, 
           substr(to_char(event_id,'0999999999'),2,10) eventid,
           event_type,
           event_class, 
           to_char(event_date,'YYYY-MM-DD')            eventdate,
           to_char(approval_date,'YYYY-MM-DD')         approval_date,
           ministry_contact,
           replace(note,chr(10),' ')                   note,
           replace(required_action,chr(10),' ')        required_action
   from    sr_events
   order   by site_id, event_date desc;

spool off;
set termout on;
