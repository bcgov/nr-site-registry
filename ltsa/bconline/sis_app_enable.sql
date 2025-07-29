REM -------------------------------------------------------------------
REM  sis_app_enable.sql
REM  This script updates the SITE application entry in the app_state
REM  table back to active, making access to the on-line SITE application
REM  enabled again.
REM -------------------------------------------------------------------

UPDATE app_state
  SET active = 'Y'
  WHERE name = 'SIS';

COMMIT;

EXIT;
