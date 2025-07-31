set termout off;

rem -------------------------------------------------------------------
rem SRSITES.SQL
rem
rem This sql*plus script file extracts the SITES information for export
rem to the SR BCOnline system.
rem
rem 95.jan.03 ddjm * script created and tested
rem 95.jan.05 ddjm * record length changed; 1st blank line dropped
rem 95.jan.05 ddjm * site id zero filled; zeros for null lat/long
rem 97.feb.26 bsw  * droped address_3 and address_4 from select
rem 97.May.29 emv  * Added join to PENDNOT and PENDPRT, so that all sites 
rem 			that meetthe Notification Criteria are sent with status
rem			PENDNOT or PENDPRT instead of status PENDING.
rem 97.sep.15 emv  * renamed 2 new views. 
rem 97.oct.4  emv  * Replaced third union with a select from sr_sites, rather
rem                 than selecting all records from sr_sites which are not in 
rem                 either one of PENDNOT/PENDPRT. 
rem -------------------------------------------------------------------

set pagesize   0;
set linesize 878;
set embedded  on;
set feedback off;
set heading  off;

spool srsites.lis

column siteid                   format a10;
column region                   format a40;
column status                   format a120;
column common_name              format a40;
column address_1                format a50;
column address_2                format a50;
column city                     format a30;
column prov_state               format a2;
column postal_code              format a10;
column lat                      format a9;
column latdeg                   format a3;
column latmin                   format a3;
column latsec                   format a3;
column lon                      format a9;
column londeg                   format a3;
column lonmin                   format a3;
column lonsec                   format a3;
column victoria_file_no         format a40;
column regional_file_no         format a40;
column classification           format a40;
column gendescr                 format a255;
column regdate                  format a10;
column moddate                  format a10;
column tombdate			format a10;

select all substr(to_char(site_id,'0999999999'),2,10)                  siteid, 
           region, 
           status, 
           common_name,
           address_1, 
           address_2, 
           city, 
           prov_state,                                                 postal_code,
           substr(to_char(nvl(latitude,0.)*1000000.,'099999999'),2,9)  lat,
           substr(to_char(nvl(latitude_degrees,0.),'099'),2,3)         latdeg,
           substr(to_char(nvl(latitude_minutes,0.),'099'),2,3)         latmin,
           substr(to_char(nvl(latitude_seconds,0.)*10,'099'),2,3)      latsec,
           substr(to_char(nvl(longitude,0.)*1000000.,'099999999'),2,9) lon,
           substr(to_char(nvl(longitude_degrees,0.),'099'),2,3)        londeg,
           substr(to_char(nvl(longitude_minutes,0.),'099'),2,3)        lonmin,
           substr(to_char(nvl(longitude_seconds,0.)*10,'099'),2,3)     lonsec,
           victoria_file_no, 
           regional_file_no,                                           classification,
           replace(general_description,chr(10),' ')                    gendescr,
           to_char(registrar_date,'YYYY-MM-DD')                        regdate,
           to_char(modified_date,'YYYY-MM-DD')                         moddate,
           to_char(tombstone_date,'YYYY-MM-DD')                        tombdate
from       sis.view_site_pendnot
union 
select all substr(to_char(site_id,'0999999999'),2,10)                  siteid, 
           region, 
           status, 
           common_name,
           address_1, 
           address_2, 
           city, 
           prov_state,                                                 postal_code,
           substr(to_char(nvl(latitude,0.)*1000000.,'099999999'),2,9)  lat,
           substr(to_char(nvl(latitude_degrees,0.),'099'),2,3)         latdeg,
           substr(to_char(nvl(latitude_minutes,0.),'099'),2,3)         latmin,
           substr(to_char(nvl(latitude_seconds,0.)*10,'099'),2,3)      latsec,
           substr(to_char(nvl(longitude,0.)*1000000.,'099999999'),2,9) lon,
           substr(to_char(nvl(longitude_degrees,0.),'099'),2,3)        londeg,
           substr(to_char(nvl(longitude_minutes,0.),'099'),2,3)        lonmin,
           substr(to_char(nvl(longitude_seconds,0.)*10,'099'),2,3)     lonsec,
           victoria_file_no, 
           regional_file_no,                                           classification,
           replace(general_description,chr(10),' ')                    gendescr,
           to_char(registrar_date,'YYYY-MM-DD')                        regdate,
           to_char(modified_date,'YYYY-MM-DD')                         moddate,
           to_char(tombstone_date,'YYYY-MM-DD')                        tombdate
from       sis.view_site_pendprt
union
select all substr(to_char(site_id,'0999999999'),2,10)                  siteid, 
           region, 
           status, 
           common_name,
           address_1, 
           address_2, 
           city, 
           prov_state,                                                 postal_code,
           substr(to_char(nvl(latitude,0.)*1000000.,'099999999'),2,9)  lat,
           substr(to_char(nvl(latitude_degrees,0.),'099'),2,3)         latdeg,
           substr(to_char(nvl(latitude_minutes,0.),'099'),2,3)         latmin,
           substr(to_char(nvl(latitude_seconds,0.)*10,'099'),2,3)      latsec,
           substr(to_char(nvl(longitude,0.)*1000000.,'099999999'),2,9) lon,
           substr(to_char(nvl(longitude_degrees,0.),'099'),2,3)        londeg,
           substr(to_char(nvl(longitude_minutes,0.),'099'),2,3)        lonmin,
           substr(to_char(nvl(longitude_seconds,0.)*10,'099'),2,3)     lonsec,
           victoria_file_no, 
           regional_file_no,                                           classification,
           replace(general_description,chr(10),' ')                    gendescr,
           to_char(registrar_date,'YYYY-MM-DD')                        regdate,
           to_char(modified_date,'YYYY-MM-DD')                         moddate,
           to_char(tombstone_date,'YYYY-MM-DD')                        tombdate
from       sr_sites
where      status = 'PENDING'
           or
           (status <> 'PENDING'
            and site_rwm_flag <> 99
            and reg_flag <> 99)
order by   1;

spool off;
set termout on;
