# Quickstart Guide: AIDO Missing Features

**Feature**: 001-specify-missing-features
**Date**: 2026-01-07
**Status**: Draft

## Overview

This quickstart guide provides instructions for setting up, running, and testing the missing features of the AIDO project: Web API layer, dashboard access control, and task creation functionality.

## Prerequisites

- Python 3.11+
- Node.js 18+ (for existing Next.js frontend)
- PostgreSQL-compatible database (Neon Serverless PostgreSQL recommended)
- Poetry (for Python dependency management) or pip
- Git

## Setup Instructions

### 1. Clone and Navigate to Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Backend Setup

#### Python Environment
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install poetry
poetry install
```

#### Environment Configuration
Create a `.env` file in the backend directory with the following:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/aido_db"

# JWT Configuration
SECRET_KEY="your-super-secret-key-here"  # Use a strong secret key
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Neon Configuration
NEON_DATABASE_URL="your-neon-database-url"

# MCP Server Configuration
HF_API_KEY="your-huggingface-api-key"  # If using Hugging Face features
```

### 3. Database Setup

#### Run Migrations
```bash
# Navigate to backend directory
cd backend

# Run database migrations
poetry run python -m src.main db upgrade
```

#### Create Initial Data (Optional)
```bash
# Create default roles and permissions
poetry run python -m src.main init-db
```

### 4. Frontend Setup (Existing)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Configure environment
cp .env.example .env.local
# Edit .env.local with appropriate values
```

## Running the Application

### Backend (API Server)

```bash
cd backend
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation will be available at:
- `http://localhost:8000/docs` (Swagger UI)
- `http://localhost:8000/redoc` (ReDoc)

### Frontend (Next.js App)

```bash
cd frontend
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

## Key Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### User Management
- `GET /users/me` - Get current user info
- `GET /users/{id}` - Get specific user
- `PUT /users/me` - Update current user
- `GET /users/` - List users (admin only)

### Task Management
- `GET /tasks/` - List tasks (with filtering)
- `POST /tasks/` - Create a new task (title and priority required)
- `GET /tasks/{id}` - Get specific task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Project Management
- `GET /projects/` - List projects
- `POST /projects/` - Create a new project
- `GET /projects/{id}` - Get specific project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Dashboard Endpoints
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/tasks` - Dashboard task overview
- `GET /dashboard/projects` - Dashboard project overview

## Testing the Features

### 1. Web API Layer (Priority 1)

#### Authentication Flow
```bash
# Register a new user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "securepassword123"}'

# Login to get JWT tokens
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "securepassword123"}'
```

#### Task Creation (Priority 2)
```bash
# Create a task (requires authentication)
TOKEN="your-jwt-token-from-login"
curl -X POST http://localhost:8000/tasks/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Sample Task", "priority": "high"}'
```

### 2. Dashboard Access Control (Priority 3)

#### Role-Based Access
```bash
# Try to access dashboard with insufficient permissions
curl -X GET http://localhost:8000/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

## Configuration Options

### Environment Variables

#### Backend Configuration
- `ENVIRONMENT`: Set to "development", "staging", or "production"
- `LOG_LEVEL`: Logging level (default: "INFO")
- `DATABASE_POOL_SIZE`: Database connection pool size (default: 20)
- `MAX_WORKERS`: Number of worker processes (default: 1)

#### Frontend Configuration
- `NEXT_PUBLIC_API_URL`: Base URL for API calls
- `NEXT_PUBLIC_APP_NAME`: Name of the application

## MCP Server Integration

The application integrates with the following MCP servers:

1. **Hugging Face MCP Server**: For AI/ML capabilities
2. **Neon MCP Server**: For database operations
3. **Context7 MCP Server**: For documentation and code examples

Configuration is handled through environment variables and the application will automatically connect to these services when available.

## Development Commands

### Backend
```bash
# Run tests
poetry run pytest

# Run with auto-reload
poetry run uvicorn src.main:app --reload

# Format code
poetry run black src/
poetry run isort src/

# Lint code
poetry run flake8 src/
poetry run mypy src/
```

### Frontend
```bash
# Run tests
npm run test
# or
yarn test

# Build for production
npm run build
# or
yarn build

# Format code
npm run format
# or
yarn format
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify DATABASE_URL is correct
   - Ensure database server is running
   - Check firewall settings

2. **Authentication Fails**:
   - Verify SECRET_KEY is set correctly
   - Check that tokens are not expired
   - Ensure proper headers are sent with requests

3. **MCP Server Connection Issues**:
   - Verify API keys are correct
   - Check network connectivity
   - Ensure MCP servers are properly configured

### Getting Help

- Check the API documentation at `/docs`
- Review the logs for error details
- Consult the specification document for expected behavior
- Run `poetry run python -m src.main --help` for CLI options

## Next Steps

1. Implement the frontend components to connect with the new API
2. Add additional validation and error handling
3. Set up monitoring and observability
4. Configure CI/CD pipelines
5. Deploy to staging environment for testing