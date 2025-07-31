set termout off;

rem -------------------------------------------------------------------
rem SRAECSRS.SQL
rem
rem This sql*plus script file extracts the SR_AEC_SOURCES information
rem for export to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jul.19 ddjm * functionality dropped till AEC redesign finished
rem -------------------------------------------------------------------

set pagesize 999;
set linesize 9999;
set embedded on;
set feedback off;
set heading off;
spool sraecsrc.lis

column aec_id           format 9999999999;
column src              format a40;

rem --- select all aec_id, replace(source,chr(10),' ') src
rem ---    from sr_aec_sources
rem ---    order by aec_id;

select ' ' from dual;

spool off;
set termout on;
