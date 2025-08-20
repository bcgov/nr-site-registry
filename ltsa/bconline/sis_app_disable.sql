REM -------------------------------------------------------------------
REM  sis_app_disable.sql
REM  This script updates the SITE application entry in the app_state
REM  table to inactive, making access to the on-line SITE application
REM  disabled.
REM -------------------------------------------------------------------

UPDATE app_state
  SET active = 'N'
  WHERE name = 'SIS';

COMMIT;
