#!/bin/bash

set -e
set -x
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# create user if it doesn't exist
echo "select * from pg_user where usename = 'openloans';" \
  | sudo -u postgres psql template1 | grep -q openloans || {
  sudo -u postgres psql template1 <<EOF
create user openloans with encrypted password 'openloans_test_password';
EOF
}

# create a .pgpass file if not present
[ -e ~/.pgpass ] || {
  touch ~/.pgpass
  chmod 600 ~/.pgpass
}

# add entry to pgpass for test user to make it easy to use psql, etc.
grep -q openloans ~/.pgpass || {
    cat >> ~/.pgpass <<EOF
localhost:*:openloans:openloans:openloans_test_password
EOF
}

# create db if it doesn't exist
sudo -u postgres psql -l | grep -q openloans || {
  sudo -u postgres createdb -O openloans openloans
}

# add schema
psql -h localhost -U openloans openloans < $DIR/../data/schema.sql
