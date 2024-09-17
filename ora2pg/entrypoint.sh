#!/bin/sh
ora2pg --debug -c /config/ora2pg.conf
ora2pg --debug -c /config/ora2pg.conf --basedir /data

exit 0
exec "$@"