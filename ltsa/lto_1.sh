#!/usr/bin/ksh
# LTO ftp script
#
# 97.may.09 dmacdonald - modifications to ensure that environment is
#                        correctly set up (when run from crontab)
# 97.may.28 dmacdonald - use $1 username/password if passed; otherwise
#                        use a default value
# 98.Jan.12 evander - Changed path to reference ~sis instead of hard-coded.
# 98.Mar 24 evander - Changed SID prd7 to epdprod1
# 07.oct.29 ddmacdon - include explicit databse in login
# 08.jun.19 ddmacdon - split into two jobs each with approx 1/2 the pids
# 08.jun.21 ddmacdon - fix errors as per Q/A directives
# 08.jun.25 ddmacdon - fix oracle home; other assorted changes
# 20130729  andrwong - update for new ltsa service
# 20140718  andrwong - update for new ltsa server outside spanbc and running script in dmz
#
#

. /apps_ux/sis/admin/lto/lto.properties
echo LTO_1.SH START
date

if [ ! -d ${import_path} ]
then 
  mkdir ${app_path}/lto_task
  mkdir ${app_path}/lto_task/import  
fi

if [ ! -d ${export_path} ]
then 
  mkdir ${app_path}/lto_task
  mkdir ${app_path}/lto_task/export
fi
    
export ORACLE_SID=ora11g
#. /sw_ux/oracle/admin/bin/oracle.profile
. /apps_ux/oraapp/bin/setenv.sh 1>/dev/null

# copy lto commands to dmz
scp -pr /apps_ux/sis/admin/lto oraapp@#{dmz_server}:#{test_prod_path}/admin

echo extract the data from the tables
cd ${import_path}

sqlplus $account_pwd @${admin_lto_path}/ltodump_1

datestamp=`date '+%y%m%d_%H'`
mv ltodump.lis ${import_path}/PARCEL_ID_LIST_${datestamp}.TXT

echo copy files over to scribe/satyr
scp ${import_path}/PARCEL_ID_LIST_${datestamp}.TXT oraapp@#{dmz_server}:#{test_prod_path}/lto_task/import
echo ftp the files over to BCSC
ssh oraapp@#{dmz_server} 'cd #{test_prod_path}/lto_task/import && sftp -v -b #{test_prod_path}/admin/lto/lto_ftp_cmds siteregistry@#{lto_sftp_site} > /fs/u02/apps_ux/logs/sis/lto_1_sftp.log 2>&1 && rm #{test_prod_path}/lto_task/import/PARCEL_ID_LIST*.TXT'

date
echo LTO_1.SH DONE