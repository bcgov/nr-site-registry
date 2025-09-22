#!/usr/bin/ksh
# LTO_LOAD.SH
# This script file controls the lto pid information merges
#
# 95.apr.18 ddjm - script tested, declared 'production'
# 95.jun.15 ddjm - typo fixed
# 95.jun.15 ddjm - fixed for database instance information
# 98.Jan.12 evander - Changed path to reference ~sis instead of hard-coded.
# 01.mar.28 pfraser - Changed sqlloader to sqlldr for Oracle 8i6
# 26 May 2003 pFraser - changed the hard coded password
# 07.oct.29 ddmacdon - incluce explicit databse is login
# 2007nov05 ddmacdon - delivery as a patch
# 20130729  andrwong - update for new ltsa service
# 20140718  andrwong - update for new ltsa server and running script in dmz

. /apps_ux/sis/admin/lto/lto.properties

echo LTO_LOAD.SH START
date

export ORACLE_SID=ora11g
#. /sw_ux/oracle/admin/bin/oracle.profile
. /apps_ux/oraapp/bin/setenv.sh 1>/dev/null


cd ${export_path}

   echo get desc file from BCSC system
   ssh oraapp@#{dmz_server} 'cd #{test_prod_path}/lto_task/export && sftp -b #{test_prod_path}/admin/lto/lto_get_desc siteregistry@#{lto_sftp_site} 2> ftp_get.log'
   echo copy from satyr to export folder
   scp -pr oraapp@#{dmz_server}:#{test_prod_path}/lto_task/export/* .
   ssh oraapp@#{dmz_server} 'rm #{test_prod_path}/lto_task/export/PARCEL*'
      
   if fgrep 'not found' ftp_get.log ;
   then 
     echo 'No parcel file presence. Exiting...'
     exit 3 
   else
    echo loading data using new API-based process
    
    # Find the PARCEL_DESCRIPTION_RESPONSE file
    PARCEL_FILE=$(ls -1 PARCEL_DESCRIPTION_RESPONSE_*.TXT 2>/dev/null | head -1)
    
    if [ -z "$PARCEL_FILE" ]; then
      echo "Error: No PARCEL_DESCRIPTION_RESPONSE_*.TXT file found"
      exit 1
    fi
    
    echo "Found parcel file: $PARCEL_FILE"
    
    API_URL="${API_URL}" \
    KEYCLOAK_URL="${KEYCLOAK_URL}" \
    KEYCLOAK_REALM="${KEYCLOAK_REALM}" \
    KEYCLOAK_CLIENT_ID="${KEYCLOAK_CLIENT_ID}" \
    KEYCLOAK_CLIENT_SECRET="${KEYCLOAK_CLIENT_SECRET}" \
    ${admin_lto_path}/../lto_load_new.sh "$PARCEL_FILE"
   fi
   
date
echo LTO_LOAD.SH END
