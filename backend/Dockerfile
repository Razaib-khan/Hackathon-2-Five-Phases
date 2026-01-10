# Multi-stage build for FastAPI backend
# Stage 1: Build dependencies
FROM python:3.11-slim AS deps
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster dependency installation
RUN pip install --upgrade pip && pip install uv

# Copy pyproject.toml and poetry.lock if they exist
COPY pyproject.toml ./

# Install dependencies using uv
RUN pip install --user --no-cache-dir -e .

# Stage 2: Production runtime
FROM python:3.11-slim AS runner
WORKDIR /app

# Create non-root user for security
RUN groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser appuser

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder stage
COPY --from=deps /root/.local /root/.local

# Set environment variables
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Run database migrations before starting the app
RUN python -c "from alembic.config import Config; from alembic import command; config = Config('alembic.ini'); command.upgrade(config, 'head')" || echo "Migration failed or not needed"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5)" || exit 1

# Start the application with uvicorn
CMD ["uvicorn", "src.api.main:create_app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--factory"]