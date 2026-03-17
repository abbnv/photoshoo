#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Waiting for database and applying Prisma schema..."
  until npx prisma db push --skip-generate; do
    echo "Database is not ready yet, retrying in 3 seconds..."
    sleep 3
  done
fi

mkdir -p "${STORAGE_ROOT:-/app/storage-data}"

exec "$@"
