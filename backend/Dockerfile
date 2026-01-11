FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install uvicorn for serving the app
RUN pip install "uvicorn[standard]==0.24.0"

# Copy the rest of the application
COPY . .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "python -c \"from alembic.config import Config; from alembic import command; config = Config('alembic.ini'); command.upgrade(config, 'head')\" && uvicorn src.main:app --host 0.0.0.0 --port 8000"]