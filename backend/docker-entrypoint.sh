#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
python -c "from alembic.config import Config; from alembic import command; config = Config('alembic.ini'); command.upgrade(config, 'head')" || echo "Migration failed or not needed"

# Check if we're in development mode (by checking for a development-specific environment variable)
if [ "$ENVIRONMENT" = "development" ] || [ "$NODE_ENV" = "development" ]; then
    echo "Starting in development mode..."
    # For development, we might want to use --reload for hot reloading
    exec uvicorn src.api.main:create_app --host 0.0.0.0 --port 8000 --reload --factory
else
    echo "Starting in production mode..."
    # For production, use multiple workers
    exec uvicorn src.api.main:create_app --host 0.0.0.0 --port 8000 --workers 2 --factory
fi