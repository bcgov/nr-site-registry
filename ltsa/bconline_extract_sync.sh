#!/usr/bin/bash                                                                                               # Copy bconline extract to share for business verification
# bconline_extract_sync.sh
# 2021-03-22 - Intial (SITE-181) - ANDRWONG

touch /apps_ux/logs/sis/bconline_extract_sync.log


if [ -d "/apps_data/shares/site" ]
then
  echo "Directory /apps_data/shares/site exists." > /apps_ux/logs/sis/bconline_extract_sync.log
  mkdir -p /apps_data/shares/site/extracts
  echo "Copying BCOnline extracts...." >> /apps_ux/logs/sis/bconline_extract_sync.log
  ls -l /apps_ux/sis/admin/bconline/*.lis >> /apps_ux/logs/sis/bconline_extract_sync.log
  cp -p /apps_ux/sis/admin/bconline/*.lis /apps_data/shares/site/extracts
  echo "Copying complete...." >> /apps_ux/logs/sis/bconline_extract_sync.log
else
  echo "Error: Directory /apps_data/shares/site does not exists." > /apps_ux/logs/sis/bconline_extract_sync.log
fi
