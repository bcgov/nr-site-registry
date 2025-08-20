echo SaturdayTestSpool.sh

PATH=/usr/local/bin:$PATH;      export PATH
ORACLE_SID=epdprod1;            export ORACLE_SID       # ensure this is right
ORAENV_ASK=NO;                  export ORAENV_ASK
. oraenv

# use account/password if passed as a parameter; otherwise use a default
# remember to change the 'default' values to an account/password suitable
#   for the active database


echo extract the data from the tables
cd $HOME/admin/bconline
sqlplus sis/PASSWORD@epdprod1 @satdump

