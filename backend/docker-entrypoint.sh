#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Refusing to start."
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "JWT_SECRET is not set. Refusing to start."
  exit 1
fi

echo "Applying Prisma schema to the database..."
npx prisma db push --skip-generate

echo "Starting AutoScrap API..."
exec node index.js
