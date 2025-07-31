set termout off;

rem -------------------------------------------------------------------
rem SRAECS.SQL
rem
rem This sql*plus script file extracts the SR_AEC information for export
rem to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jul.19 ddjm * functionality dropped till AEC redesign finished
rem -------------------------------------------------------------------

set pagesize 999;
set linesize 9999;
set embedded on;
set feedback off;
set heading off;
spool sraecs.lis

column site_id          format 9999999999;
column aec_id           format 9999999999;
column loc              format a255;

rem --- select all site_id, aec_id, replace(location,chr(10),' ') loc
rem ---    from sr_aecs
rem ---    order by site_id, aec_id;

select ' ' from dual;

spool off;
set termout on;
