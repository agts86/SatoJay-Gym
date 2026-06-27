#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="${E2E_DB_CONTAINER_NAME:-satojay-gym-e2e-db}"
DB_PORT="${E2E_DB_PORT:-55432}"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="satojay_gym"
E2E_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${DB_PORT}/${DB_NAME}?schema=public"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}

trap cleanup EXIT

cleanup

docker run --rm -d \
  --name "$CONTAINER_NAME" \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="$DB_NAME" \
  -p "${DB_PORT}:5432" \
  postgres:16-alpine >/dev/null

for _ in {1..60}; do
  if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
  echo "E2E database did not become ready in time." >&2
  exit 1
fi

export DATABASE_URL="$E2E_DATABASE_URL"
export DATABASE_URL_UNPOOLED="$E2E_DATABASE_URL"

pnpm prisma:deploy
pnpm prisma:seed
pnpm exec playwright test "$@"
