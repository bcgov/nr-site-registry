set termout off;

rem -------------------------------------------------------------------
rem SRPRFANS.SQL
rem
rem This sql*plus script file extracts the SR_PROFILE_ANSWERS information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blanbk line dropped
rem 95.jan.05 ddjm * leading zeros for id fields
rem 97.feb.26 bsw  * removed the date_recieved column.
rem 97.mar.03 dgg  * added date_completed column.
rem -------------------------------------------------------------------

set pagesize   0;
set linesize  37;
set embedded  on;
set feedback off;
set heading  off;

spool srprfans.lis

column siteid                   format a10;
column questionid               format a10;
column date_completed		format a10;
column answer                   format a3;

select all substr(to_char(site_id,'0999999999'),2,10)     siteid, 
           substr(to_char(question_id,'0999999999'),2,10) questionid,
           to_char(date_completed,'YYYY-MM-DD')           dateCompleted,
           answer
from       sr_profile_answers
order by   site_id, question_id;

spool off;
set termout on;
