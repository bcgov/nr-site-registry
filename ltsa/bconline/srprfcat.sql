set termout off;

rem -------------------------------------------------------------------
rem SRPRFCAT.SQL
rem
rem This sql*plus script file extracts the SR_PROFILE_CATEGORIES information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * leading zeros for category id & sequence no
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 550;
set embedded  on;
set feedback off;
set heading  off;

spool srprfcat.lis

column catid                    format a10;
column sequenceno               format a10;
column effectivedate            format a10;
column expirydate               format a10;
column question_type            format a1;
column descr                    format a200;
column category_precursor	format a300;

select all substr(to_char(cat_id,'0999999999'),2,10)       catid, 
           substr(to_char(sequence_no,'0999999999'),2,10)  sequenceno,
           to_char(effective_date,'YYYY-MM-DD')            effectivedate,
           to_char(expiry_date,'YYYY-MM-DD')               expirydate,
           question_type, 
           replace(description,chr(10),' ')                descr,
           category_precursor
from       sr_profile_categories
order by   cat_id, sequence_no;

spool off;
set termout on;
