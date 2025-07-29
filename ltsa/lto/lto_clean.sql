REM lto_clean.sql  - Clean up the lto-download tables in prep for the 
REM			next batch. 
REM
REM   Created by: ? on ? 
REM   Modified by: 
REM   	EMV, Pangaea Systems March 21/98: 
REM 		changed from delete to truncate. 
REM 		Added documentation  
REM		Added file renaming
REM

truncate table lto_prev_download;
commit;

REM  Switch the names of lto_download and lto_prev_download around, so that
REM  lto_download is empty, ready for the load, and lto_prev_download contains
REM  the last download's data.  Done to avoid having to regrant. 

rename lto_download to temp_lto_download;
rename lto_prev_download to lto_download;
rename temp_lto_download to lto_prev_download; 

commit; 

exit;
