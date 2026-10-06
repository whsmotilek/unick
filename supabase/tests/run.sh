#!/usr/bin/env bash
# Прогон миграций и RLS-тестов на локальном Postgres (нужен psql и запущенный сервер).
# Использование: PGHOST=/tmp PGPORT=54329 PGUSER=postgres ./supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="unick_test_$$"
psql -q -c "create database $DB"
trap 'psql -q -c "drop database if exists $DB" >/dev/null' EXIT
psql -d "$DB" -v ON_ERROR_STOP=1 -q -f tests/stub_supabase.sql $(printf -- '-f %s ' migrations/*.sql) -f tests/rls_test.sql 2>&1 \
  | grep -E 'ok  |FAIL|ERROR|ОШИБКА|PASSED'
