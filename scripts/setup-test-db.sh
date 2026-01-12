#!/bin/bash

# Setup Test Database Script
# This script sets up a PostgreSQL database for integration testing

set -e

echo "🔧 Setting up test database..."

# Load test environment variables
export $(cat .env.test | grep -v '^#' | xargs)

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "❌ PostgreSQL is not running on localhost:5432"
  echo "💡 Start PostgreSQL with: pnpm docker:dev"
  exit 1
fi

echo "✅ PostgreSQL is running"

# Create test database if it doesn't exist
echo "📦 Creating test database..."
PGPASSWORD=postgres psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'ai-review-tool-test'" | grep -q 1 || \
PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE \"ai-review-tool-test\""

echo "🔄 Pushing schema to test database..."
pnpm db:test:push

echo "✅ Test database setup complete!"
echo "🧪 You can now run integration tests with: pnpm test:integration"
