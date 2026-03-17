#!/bin/sh
set -eu

if [ $# -lt 1 ]; then
  echo "Usage: DATABASE_URL=... sh scripts/import-db.sh ./backup.dump"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

DUMP_PATH="$1"

if [ ! -f "$DUMP_PATH" ]; then
  echo "Dump file not found: $DUMP_PATH"
  exit 1
fi

case "$DUMP_PATH" in
  *.sql)
    psql "$DATABASE_URL" < "$DUMP_PATH"
    ;;
  *.sql.gz)
    gzip -dc "$DUMP_PATH" | psql "$DATABASE_URL"
    ;;
  *.dump|*.backup)
    pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" "$DUMP_PATH"
    ;;
  *)
    echo "Unsupported dump format. Use .sql, .sql.gz, .dump, or .backup"
    exit 1
    ;;
esac
