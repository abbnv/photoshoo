#!/bin/sh
set -eu

if [ $# -lt 1 ]; then
  echo "Usage: DATABASE_URL=... sh scripts/export-db.sh ./backup.dump"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

OUTPUT_PATH="$1"

case "$OUTPUT_PATH" in
  *.sql)
    exec pg_dump "$DATABASE_URL" --no-owner --no-privileges --file="$OUTPUT_PATH"
    ;;
  *.dump|*.backup)
    exec pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$OUTPUT_PATH"
    ;;
  *)
    echo "Output file must end with .sql, .dump, or .backup"
    exit 1
    ;;
esac
