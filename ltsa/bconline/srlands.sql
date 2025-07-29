set termout off;

rem -------------------------------------------------------------------
rem SRLANDS.SQL
rem
rem This sql*plus script file extracts the SR_LAND_HISTORIES information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * leading zeros for site id
rem 97.nov.07 emv  * Changed order by clause. 
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 330;
set embedded  on;
set feedback off;
set heading  off;

spool srlands.lis

column siteid           format a10;
column land_use         format a60;
column notestring       format a255;

select all substr(to_char(site_id,'0999999999'),2,10) siteid, 
           land_use, 
           replace(note,chr(10),' ')                  notestring
from       sr_land_histories
order by   site_id, when_created desc;

spool off;
set termout on;
