set termout off;

rem -------------------------------------------------------------------
rem SREVPART.SQL
rem
rem This sql*plus script file extracts the SR_EVENT_PARTICIPANTS information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * leading seros for event id
rem 97.feb.23 bsw  * changed column role to namerole
rem 97.nov.07 emv  * Changed order by clause. 
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 203;
set embedded  on;
set feedback off;
set heading  off;

spool srevpart.lis

column eventid          format a10;
column namestring       format a150;
column namerole         format a40;

select all substr(to_char(event_id,'0999999999'),2,10) eventid, 
           replace(name,chr(10),' ')                   namestring, 
           namerole
from       sr_event_participants
order by   event_id, epr_code desc;

spool off;
set termout on;
