#!/bin/sh

ORA_HOST_FLAG=""
echo "INFO: ORA_HOST_FLAG variable detected: '$ORA_HOST'"
    ORA_HOST_FLAG=" --source $ORA_HOST "

ORA_USER_FLAG=""
echo "INFO: ORA_USER variable detected: '$ORA_USER'"
    ORA_USER_FLAG=" --user $ORA_USER "

ORA_PWD_FLAG=""
ORA_PWD_FLAG_MASKED=""
echo "INFO: ORA_PWD variable detected: '*******'"
    ORA_PWD_FLAG=" --password $ORA_PWD "
    ORA_PWD_FLAG_MASKED=" --password ******* "

ora2pg --debug -c /config/ora2pg.conf --basedir /data ${ORA_HOST_FLAG} ${ORA_USER_FLAG}  ${ORA_PWD_FLAG}

exit 0
exec "$@"