set termout off;

rem -------------------------------------------------------------------
rem SRSITPAR.SQL
rem
rem This sql*plus script file extracts the SR_SITE_PARTICIPANTS information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * leading zeros for id fields
rem 95.jan.05 ddjm * note and participant_type fields dropped
rem 97.nov.07 emv  * Changed order by clause. 
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 500;
set embedded  on;
set feedback off;
set heading  off;

spool srsitpar.lis

column siteid                   format a10;
column participantid            format a10;
column namestring               format a150;
column effectivedate            format a10;
column enddate                  format a10;
column notestring               format a255;
column parttype                 format a12;

select all substr(to_char(site_id,'0999999999'),2,10)        siteid,
           substr(to_char(participant_id,'0999999999'),2,10) participantid,
           replace(name,chr(10),' ')                         namestring,
           to_char(effective_date,'YYYY-MM-DD')              effectivedate,
           to_char(end_date,'YYYY-MM-DD')                    enddate,
           replace(note,chr(10),' ')                         notestring, 
           replace(participant_type,chr(10),' ')             parttype
from  sr_site_participants
order by site_id, effective_date desc;

spool off;
set termout on;
