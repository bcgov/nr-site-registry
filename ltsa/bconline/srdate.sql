set termout off;

rem -------------------------------------------------------------------
rem SRDATE.SQL
rem
rem This sql*plus script file extracts the current date (download date)
rem information for export to the SR BCOnline system.
rem
rem 95.jan.05 ddjm * script created and tested
rem 95.jan.05 ddjm * record length changed; 1st blank line dropped
rem -------------------------------------------------------------------

set pagesize   0;
set linesize  80;
set embedded  on;
set feedback off;
set heading  off;

spool srdate.lis

column downloaddate format a10;

select to_char(sysdate,'YYYY-MM-DD') downloaddate from dual;

spool off;
set termout on;
