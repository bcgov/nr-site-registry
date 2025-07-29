set termout off;

rem -------------------------------------------------------------------
rem SRDOCPAR.SQL
rem
rem This sql*plus script file extracts the SR_SITE_DOC_PARTICPANTS
rem information for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * doc id file needs leading zeros
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 205;
set embedded  on;
set feedback off;
set heading  off;

spool srdocpar.lis

column docid            format a10;
column namestring       format a150;
column role             format a40;

select all substr(to_char(doc_id,'0999999999'),2,10) docid, 
           replace(name,chr(10),' ')                 namestring, 
           role
from       sr_site_doc_participants
order by   doc_id, name;

spool off;
set termout on;
