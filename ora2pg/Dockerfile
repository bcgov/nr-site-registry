FROM perl:slim

ARG ORA2PG_VERSION=24.3

# ugly fix for "update-alternatives" missing directories in slim image
RUN mkdir -p /usr/share/man/man1 &&\
    mkdir -p /usr/share/man/man7

RUN apt-get update && apt-get install -y -q --no-install-recommends \
    cpanminus \
    unzip \
    curl \
    ca-certificates \
    rpm \
    alien \
    libaio1 \
    # Install postgresql
    postgresql-client \
    # Install mysql
    libdbd-mysql \
    # install Perl Database Interface
    libdbi-perl \
    bzip2 \
    libpq-dev \
    gnupg2 \
    libdbd-pg-perl \
    # Install Python 3
    python3 \
    python3-pip

ARG ORAVERSION=21
ARG ORACLIENT_BASIC=https://download.oracle.com/otn_software/linux/instantclient/211000/oracle-instantclient-basic-21.1.0.0.0-1.x86_64.rpm
ARG ORACLIENT_DEVEL=https://download.oracle.com/otn_software/linux/instantclient/211000/oracle-instantclient-devel-21.1.0.0.0-1.x86_64.rpm
ARG ORACLIENT_SQLPLUS=https://download.oracle.com/otn_software/linux/instantclient/211000/oracle-instantclient-sqlplus-21.1.0.0.0-1.x86_64.rpm

# Install Oracle Client
RUN mkdir /usr/lib/oracle/$ORAVERSION/client64/network/admin -p \
    && curl -L -o /tmp/oracle-instantclient.rpm $ORACLIENT_BASIC \
    && (cd /tmp && alien -i ./oracle-instantclient.rpm && rm -f oracle-instantclient.rpm) \
    && curl -L -o /tmp/oracle-instantclient.rpm $ORACLIENT_DEVEL \
    && (cd /tmp && alien -i ./oracle-instantclient.rpm && rm -f oracle-instantclient.rpm) \
    && curl -L -o /tmp/oracle-instantclient.rpm $ORACLIENT_SQLPLUS \
    && (cd /tmp && alien -i ./oracle-instantclient.rpm && rm -f oracle-instantclient.rpm)

ENV ORACLE_HOME=/usr/lib/oracle/$ORAVERSION/client64
ENV TNS_ADMIN=/usr/lib/oracle/$ORAVERSION/client64/network/admin
ENV LD_LIBRARY_PATH=/usr/lib/oracle/$ORAVERSION/client64/lib 
ENV PATH=$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/oracle/$ORAVERSION/client64/bin

# Install DBI module with Postgres, Oracle and Compress::Zlib module
RUN cpan install Test::NoWarnings &&\
    cpan install DBI &&\
    cpan install DBD::Pg &&\
    cpan install Bundle::Compress::Zlib &&\
    cpanm install DBD::Oracle@1.82

# Install ora2pg
RUN curl -L -o /tmp/ora2pg.zip https://github.com/darold/ora2pg/archive/v$ORA2PG_VERSION.zip &&\
    (cd /tmp && unzip ora2pg.zip && rm -f ora2pg.zip) &&\
    mv /tmp/ora2pg* /tmp/ora2pg &&\
    (cd /tmp/ora2pg && perl Makefile.PL && make && make install)

# config directory
RUN mkdir /config
RUN cp /etc/ora2pg/ora2pg.conf.dist /etc/ora2pg/ora2pg.conf.backup
# cp /etc/ora2pg/ora2pg.conf.dist /config/ora2pg.conf
COPY ora2pg.conf /config
VOLUME /config

# output directory
RUN mkdir /data
VOLUME /data

COPY entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

# Install Python 3 dependencies and Python script support
RUN apt-get install -y python3 python3-pip

WORKDIR /

COPY modify_dml.py /modify_dml.py

ENTRYPOINT ["/usr/bin/entrypoint.sh"]
