set termout off;

rem -------------------------------------------------------------------
rem SRPRFQUE.SQL
rem
rem This sql*plus script file extracts the SR_PROFILE_QUESTIONS information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * leading zeros for all IDs and sequence number
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 500;
set embedded  on;
set feedback off;
set heading  off;

spool srprfque.lis

column questionid               format a10;
column sequenceno               format a10;
column catid                    format a10;
column parentid                 format a10;
column effectivedate            format a10;
column expirydate               format a10;
column descr                    format a400;

select all substr(to_char(question_id,'0999999999'),2,10) questionid,
           substr(to_char(sequence_no,'0999999999'),2,10) sequenceno,
           substr(to_char(cat_id,'0999999999'),2,10)      catid, 
           substr(to_char(parent_id,'0999999999'),2,10)   parentid,
           to_char(effective_date,'YYYY-MM-DD')           effectivedate,
           to_char(expiry_date,'YYYY-MM-DD')              expirydate,
           replace(description,chr(10),' ')               descr
from       sr_profile_questions
order by   question_id, sequence_no;

spool off;
set termout on;
