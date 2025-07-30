set termout off;

rem -------------------------------------------------------------------
rem SRPINPID.SQL
rem
rem This sql*plus script file extracts the SR_PIN_PID information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length adjusted; 1st blank line dropped
rem 95.jan.05 ddjm * leading zeros for site id
rem 95.mar.06 ddjm * right justify, 0 filled for PIDs
rem 97.nov.06 EMV  * Check if send_to_sr flag is set to Y. 
rem 03.dec.17 ddjm * ensure column formatting used for PIDs
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 310;
set embedded  on;
set feedback off;
set heading  off;

spool srpinpid.lis

column siteid                   format a10;
column pin                      format a9;
column pidno                    format a9;
column crown_lands_file_no      format a7;
column legaldesc                format a255;
column datenoted                format a10;

select all substr(to_char(site_id,'0999999999'),2,10) siteid, 
           pin,
           lpad(pid,9,'0')		              pidno, 
           crown_lands_file_no,
           replace(legal_description,chr(10),' ')     legaldesc,
           to_char(date_noted,'YYYY-MM-DD')           datenoted
from       sr_pin_pid
where      send_to_sr = 'Y'
order by   site_id, pin, pid;

spool off;
set termout on;
