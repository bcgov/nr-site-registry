set termout off;

rem -------------------------------------------------------------------
rem SRPROFIL.SQL
rem
rem This sql*plus script file extracts the SR_SITE_PROFILES
rem information for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 96.jan.31 ddjm * comments field added
rem 96.feb.01 ddjm * additional date fields added
rem 96.feb.14 ddjm * additional fields added
rem 96.mar.05 ddjm * remove blank line at start of file...
rem 96.apr.03 ddjm * field name changes
rem 97.sep.26 EMV  * replaced datecompleted with Managers Received Date. 
rem 98.oct.02 TV   * put DESCENDING clauses into ORDER BY
rem -------------------------------------------------------------------

set pagesize    0;
set linesize 2200;
set embedded   on;
set feedback  off;
set heading   off;

spool srprofil.lis

column siteid                   format a10;
column datecompleted            format a10;
column ownerid                  format a10;
column contactid                format a10;
column completorid              format a10;
column dateReceived             format a10;
column dateLocalAuthority       format a10;
column dateRegistrar            format a10;
column dateDecision             format a10;
column dateEntered              format a10;
column decisionText             format a80;
column commentString            format a2000;
column plannedActivityComment   format a2000;
column siteDisclosureComment    format a2000;
column govDocumentsComment      format a2000;
column localAuthEmail      		format a50;

select all substr(to_char(site_id,'0999999999'),2,10)             siteid, 
           to_char(date_received,'YYYY-MM-DD')                    dateReceived,
           substr(to_char(owner_partic_id,'0999999999'),2,10)     ownerid, 
           substr(to_char(contact_partic_id,'0999999999'),2,10)   contactid, 
           substr(to_char(completor_partic_id,'0999999999'),2,10) completorid,
           to_char(date_completed,'YYYY-MM-DD')                   datecompleted,
           to_char(date_local_authority,'YYYY-MM-DD')             dateLocalAuthority,
           to_char(date_registrar,'YYYY-MM-DD')                   dateRegistrar,
           to_char(date_decision,'YYYY-MM-DD')                    dateDecision,
           to_char(date_entered,'YYYY-MM-DD')                     dateEntered,
           decision_text                                          decisionText,
           replace(comments,chr(10),' ')                          commentString,
		   replace(planned_activity_comment,chr(10),' ')          plannedActivityComment,
		   replace(site_disclosure_comment,chr(10),' ')           siteDisclosureComment,
		   replace(gov_documents_comment,chr(10),' ')             govDocumentsComment,
		   local_auth_email                          			  localAuthEmail
   from sr_site_profiles
   order by site_id, date_completed DESC;

spool off;
set termout on;
