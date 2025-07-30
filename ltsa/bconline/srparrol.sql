set termout off;

rem -------------------------------------------------------------------
rem SRPARROL.SQL
rem
rem This sql*plus script file extracts the SR_SITE_PARTICPANT_ROLES
rem information for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * leading zeros for participant id
rem -------------------------------------------------------------------

set pagesize   0;
set linesize  52;
set embedded  on;
set feedback off;
set heading  off;

spool srparrol.lis

column participantid    format a10;
column rolestring       format a40;

select all substr(to_char(participant_id,'0999999999'),2,10) participantid,
           replace(role,chr(10),' ')                         rolestring
from       sr_site_participant_roles
order by   participant_id;

spool off;
set termout on;
