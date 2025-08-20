#!/usr/bin/ksh 
# BCOnline script
#
# 97.Oct.07 evander - modifications to ensure that environment is
#                        correctly set up (when run from crontab)
#			 use $1 username/password if passed; otherwise
#                        use a default value
# 98.Jan.12 evander - Changed path to reference ~sis instead of hard-coded.
# 98.Oct.16 jstorey - Added script termination functionality on error in
#                     srdump.sql and email notification.
# 99.Sep.07 pfraser - updated email address for  Corey Bell, support manager
# 07.oct.29 ddmacdon - inculde explicit database in login string
# 2007nov05 ddmacdon - include as a delivery; update email addresses
# 2013Jun27 gewebste - OFM 11gR1 upgrade - changed ORACLE_SID to ora11g

#. $HOME/.profile

echo BCONLINE.SH  START 
date

# use account/password if passed as a parameter; otherwise use a default
# remember to change the 'default' values to an account/password suitable
#   for the active database

account_pwd=${1:-sis/#{site_database_password}@#{sis_database_name}} # ensure this is correct

export ORACLE_SID=ora11g
. /sw_ux/oracle/admin/bin/oracle.profile

ORACLE_SID=#{sis_database_name};    export ORACLE_SID # ensure this is right

echo extract the data from the tables
cd /fs/u02/apps_ux/sis/admin/bconline			# ensure this is correct 
sqlplus $account_pwd @srdump

# Check if an error occured during processing of srdump.sql
if test $? -ne 0; then
  sqlplus $account_pwd @sis_app_enable.sql
  echo " "
  echo 'ERROR: An error occured in extract script, srdump.sql!'
  echo '       Processing Terminated!'
  mail #{email_recipients} < error_msg.txt
  exit
fi

echo Enabling SITE Application, data extraction has complete.
sqlplus $account_pwd @sis_app_enable.sql

echo ftp the files over to BCSC
#{ftp_enable}ftp -n -v < sr_ftp_cmds			# uncomment if production. 

date
echo BCONLINE.SH DONE

