set termout off;

rem -------------------------------------------------------------------
rem LTODUMP_1.SQL
rem
rem This sql*plus script file lists out PIDs that do not have a valid
rem   legal description.
rem
rem Output is spooled to the file "ltodump.lis"
rem
rem 94.jul.04 ddjm * script created and tested
rem 95.feb.01 ddjm * format revised as per nancy carlton of DMR
rem 95.mar.17 ddjm * filenames change to 'LTODUMP'
rem 08.jun.19 ddmacdon - split into two jobs each with approx 1/2 the pids
rem -------------------------------------------------------------------

set pagesize 0;
set linesize 9;
set embedded on;
set feedback off;
set heading off;

spool ltodump.lis

select pidno
from ( select distinct lpad(pid,9) pidno
       from subdivisions
       where pid is not null
     )
where pidno < '025'     
order by pidno;

spool off;
set termout on;
exit;

