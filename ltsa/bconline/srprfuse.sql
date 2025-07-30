set termout off;

rem -------------------------------------------------------------------
rem SRPRFUSE.SQL
rem
rem This sql*plus script file extracts the SR_PROFILE_LAND_HISTORIES 
rem information for export to the SR BCOnline system.
rem
rem 96.feb.01 ddjm * script created from land histories script
rem 96.apr.03 ddjm * date_received --> date_completed
rem 97.nov.07 emv  * Changed order by clause. 
rem -------------------------------------------------------------------

set pagesize   0;
set linesize  95;
set embedded  on;
set feedback off;
set heading  off;

spool srprfuse.lis

column siteid           	format a10;
column dateCompleted     	format a10;
column land_use_cd              format a6;
column land_use_description	format a60

select all substr(to_char(site_id,'0999999999'),2,10) siteid,
           to_char(date_completed,'YYYY-MM-DD')       dateCompleted, 
           land_use_cd,
 	   land_use_description
from       sr_profile_land_histories
order by   site_id, date_completed, land_use_cd;

spool off;
set termout on;
