#!/bin/sh

ORA_HOST_FLAG=""
if [ -n "$ORA_HOST" ]; then
    echo "INFO: ORA_HOST_FLAG variable detected: '$ORA_HOST'"
    ORA_HOST_FLAG=" --source $ORA_HOST "
else
    echo "INFO: ORA_HOST_FLAG empty"
fi

ORA_USER_FLAG=""
if [ -n "$ORA_USER" ]; then
    echo "INFO: ORA_USER variable detected: '$ORA_USER'"
    ORA_USER_FLAG=" --user $ORA_USER "
else
    echo "INFO: ORA_USER_FLAG empty"
fi

ORA_PWD_FLAG=""
ORA_PWD_FLAG_MASKED=""
if [ -n "$ORA_PWD" ]; then
    echo "INFO: ORA_PWD variable detected: '*******'"
    ORA_PWD_FLAG=" --password $ORA_PWD "
    ORA_PWD_FLAG_MASKED=" --password ******* "
else
    echo "INFO: ORA_PWD_FLAG empty"
fi

if [ -z "$ORA_HOST_FLAG" ] || [ -z "$ORA_USER_FLAG" ] || [ -z "$ORA_PWD_FLAG" ]; then
    echo "INFO: ORA_HOST_FLAG empty"
    ora2pg --debug -c /config/ora2pg.conf --basedir /data
else
    echo "INFO: ORA_HOST_FLAG not empty"
    ora2pg --debug -c /config/ora2pg.conf --basedir /data ${ORA_HOST_FLAG} ${ORA_USER_FLAG}  ${ORA_PWD_FLAG}
fi

exit 0
exec "$@"