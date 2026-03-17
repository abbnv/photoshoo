#!/bin/sh
set -eu

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-app}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
POSTGRES_DB="${POSTGRES_DB:-ai_photoshoot}"

if [ -n "$POSTGRES_PASSWORD" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
fi

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Waiting for database and applying Prisma schema..."
  until npx prisma db push --skip-generate; do
    echo "Database is not ready yet, retrying in 3 seconds..."
    sleep 3
  done
fi

mkdir -p "${STORAGE_ROOT:-/app/storage-data}"

exec "$@"
