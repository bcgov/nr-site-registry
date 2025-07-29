set termout off;

rem -------------------------------------------------------------------
rem SRASSOCS.SQL
rem
rem This sql*plus script file extracts the SR_ASSOCIATIONS information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * leading zeros for site id field(s)
rem 97.feb.26 bsw  * renamed the associated_site_id column in select
rem                * to site_id_associate_with.
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 289;
set space      1;
set embedded  on;
set feedback off;
set heading  off;

spool srassocs.lis

column siteid                   format a10;
column associatedsiteid         format a10;
column effectdate               format a10;
column notestring               format a255;

select all substr(to_char(site_id,'0999999999'),2,10)                 siteid,
           substr(to_char(site_id_associated_with,'0999999999'),2,10) associatedsiteid,
           to_char(effective_date,'YYYY-MM-DD')                       effectdate,
           replace(note,chr(10),' ')                                  notestring
from       sr_associations
order by   site_id, associatedsiteid;

spool off;
set termout on;
