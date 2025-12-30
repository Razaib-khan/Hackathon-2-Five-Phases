# AIDO Todo Application - Deployment Guide

Complete deployment guide for the AIDO Todo application with Docker, GitHub Actions, HuggingFace Spaces, and Vercel.

## Table of Contents

1. [Local Development with Docker](#local-development-with-docker)
2. [GitHub Actions CI/CD](#github-actions-cicd)
3. [Backend Deployment - HuggingFace Spaces](#backend-deployment---huggingface-spaces)
4. [Frontend Deployment - Vercel](#frontend-deployment---vercel)
5. [Environment Configuration](#environment-configuration)
6. [Troubleshooting](#troubleshooting)

## Local Development with Docker

### Prerequisites

- Docker Desktop (includes Docker Engine and Docker Compose)
- Git
- (Optional) PostgreSQL client tools for database inspection

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Razaib-khan/Hackathon-2-Five-Phases.git
   cd "Hackathon 2 FIve Phases"
   ```

2. **Create environment files**

   For backend:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Neon database URL and JWT secret
   ```

   For frontend (optional in development):
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   # Edit frontend/.env.local with your API URL (usually http://localhost:8000)
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on `localhost:5432`
   - FastAPI backend on `localhost:8000`
   - Next.js frontend on `localhost:3000`

4. **Verify services are running**
   ```bash
   # Check service health
   docker-compose ps

   # View logs
   docker-compose logs -f backend
   docker-compose logs -f frontend

   # Test health endpoint
   curl http://localhost:8000/health
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - Database: `localhost:5432` (using postgres://postgres:postgres@localhost:5432/aido_dev)

### Docker Compose Services

#### PostgreSQL Database
- **Image**: `postgres:16-alpine`
- **Port**: 5432
- **Credentials**: See docker-compose.yml environment variables
- **Volume**: `aido-db-volume` (persistent storage)
- **Startup**: Auto-creates database and extensions on first run

#### FastAPI Backend
- **Build**: Multi-stage Dockerfile from `backend/Dockerfile`
- **Port**: 8000
- **Reload**: Enabled for development (hot reload on file changes)
- **Health Check**: Queries database with `SELECT 1`
- **Volume**: Source code mounted for live reload

#### Next.js Frontend
- **Build**: Multi-stage Dockerfile from `frontend/Dockerfile`
- **Port**: 3000
- **Reload**: Dev mode with hot reload
- **API URL**: http://localhost:8000 (configurable via NEXT_PUBLIC_API_URL)

### Development Workflow

1. **Making changes**
   - Backend: Changes to `backend/src/` trigger uvicorn reload
   - Frontend: Changes to `frontend/src/` trigger Next.js HMR

2. **Running database migrations**
   ```bash
   # Connect to database
   docker exec -it aido-db psql -U postgres -d aido_dev

   # Or run migrations via backend
   docker exec -it aido-backend python -m backend.src.db.init
   ```

3. **Stopping services**
   ```bash
   docker-compose down
   ```

4. **Full reset (including database)**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

## GitHub Actions CI/CD

### Workflows Overview

#### 1. Backend CI/CD (`backend-ci.yml`)

Runs on push to `main` or `phase-2` branches when `backend/**` files change.

**Jobs**:
- **Lint**: Black, isort, Flake8, mypy
- **Test**: pytest with coverage
- **Build**: Docker image build and push to GHCR
- **Security Scan**: Trivy vulnerability scanning

**Artifacts**:
- Docker image: `ghcr.io/Razaib-khan/Hackathon-2-Five-Phases/backend:latest`

#### 2. Frontend CI/CD (`frontend-ci.yml`)

Runs on push to `main` or `phase-2` branches when `frontend/**` files change.

**Jobs**:
- **Lint**: ESLint, TypeScript type check
- **Test**: Jest tests (if configured)
- **Build**: Next.js build, Docker image build and push to GHCR
- **Security Scan**: Trivy vulnerability scanning
- **Deploy**: Automatic Vercel deployment on main branch

**Artifacts**:
- Docker image: `ghcr.io/Razaib-khan/Hackathon-2-Five-Phases/frontend:latest`

#### 3. HuggingFace Deployment (`deploy-huggingface.yml`)

Runs on push to `main` branch when `backend/**` files change.

**Jobs**:
- Git push to HuggingFace Spaces repository
- Space rebuild and automatic restart

### Required Secrets

Set these in GitHub Settings > Secrets and variables > Actions:

**For Docker Registry**:
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

**For Vercel Deployment**:
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

**For HuggingFace Spaces**:
- `HUGGINGFACE_TOKEN`: HuggingFace user token
- `HUGGINGFACE_USERNAME`: HuggingFace username

### Setup Instructions

1. **Create GitHub Secrets**
   ```bash
   gh secret set VERCEL_TOKEN --body "$(cat ~/.vercel/token)"
   gh secret set VERCEL_ORG_ID --body "your-org-id"
   gh secret set VERCEL_PROJECT_ID --body "your-project-id"
   gh secret set HUGGINGFACE_TOKEN --body "hf_xxxxx"
   gh secret set HUGGINGFACE_USERNAME --body "your-username"
   ```

2. **Docker Registry Access**
   - Workflows use `GITHUB_TOKEN` automatically
   - Ensure GitHub Actions has permission to push to GHCR

3. **Monitor Workflows**
   - GitHub Actions tab shows all workflow runs
   - Failed jobs show detailed logs
   - Security scan results appear in Security > Code scanning

## Backend Deployment - HuggingFace Spaces

### Prerequisites

1. **HuggingFace Account**: Create at https://huggingface.co
2. **User Token**: Generate at https://huggingface.co/settings/tokens
3. **GitHub Secrets**: Set `HUGGINGFACE_TOKEN` and `HUGGINGFACE_USERNAME`

### Setup Steps

1. **Create HuggingFace Space**
   ```bash
   # Via HuggingFace CLI
   huggingface-cli repo create --type space --space-sdk docker aido-todo-api
   ```

   OR manually on https://huggingface.co/spaces (select Docker SDK)

2. **Configure Environment Variables**
   - In HuggingFace Space Settings > Variables
   - Add:
     - `DATABASE_URL`: Your Neon PostgreSQL connection string
     - `JWT_SECRET`: Secure random string (min 32 chars)
     - `FRONTEND_URL`: Your Vercel frontend URL
     - `ENVIRONMENT`: `production`

3. **Initial Deployment**
   - After GitHub Actions workflow completes, HuggingFace automatically builds and starts the space
   - Monitor progress in HuggingFace Space's build logs

4. **Accessing the API**
   ```bash
   # Health check
   curl https://huggingface.co/spaces/YOUR_USERNAME/aido-todo-api/health

   # API docs
   https://huggingface.co/spaces/YOUR_USERNAME/aido-todo-api/docs
   ```

### Space Configuration

The HuggingFace Space is configured via:
- `Dockerfile` in `backend/`
- `backend/requirements.txt` for Python dependencies
- Environment variables set in Space Settings

### Updates

Updates to `main` branch automatically trigger space rebuilds via GitHub Actions.

## Frontend Deployment - Vercel

### Prerequisites

1. **Vercel Account**: Create at https://vercel.com
2. **Project**: Create via Vercel dashboard or CLI
3. **GitHub Secrets**: Set `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Setup Steps

1. **Create Vercel Project**
   ```bash
   # Via Vercel CLI
   vercel --prod
   ```

   OR manually on https://vercel.com/new (select Next.js)

2. **Configure Environment Variables**
   In Vercel Project Settings > Environment Variables, add:

   ```
   # Production
   NEXT_PUBLIC_API_URL=https://huggingface.co/spaces/YOUR_USERNAME/aido-todo-api

   # Preview
   NEXT_PUBLIC_API_URL_PREVIEW=https://huggingface.co/spaces/YOUR_USERNAME/aido-todo-api
   ```

3. **Connect GitHub Repository**
   - In Vercel Project Settings > Git Integration
   - Select branch: `main`
   - Configure build settings:
     - Framework: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm ci`

4. **Automatic Deployments**
   - Pushes to `main` branch automatically deploy
   - GitHub Actions workflow (`frontend-ci.yml`) also triggers Vercel deployment

5. **Accessing the Application**
   ```
   https://your-vercel-project-name.vercel.app
   ```

### Custom Domain (Optional)

1. Add domain in Vercel Project Settings > Domains
2. Update DNS records per Vercel instructions
3. SSL certificate auto-provisioned by Vercel

## Environment Configuration

### Backend Environment Variables

**Required**:
- `DATABASE_URL`: PostgreSQL connection string (Neon format: `postgresql+psycopg://...`)
- `JWT_SECRET`: Secret for JWT signing (minimum 32 characters)

**Optional**:
- `API_HOST`: Server host (default: `0.0.0.0`)
- `API_PORT`: Server port (default: `8000`)
- `FRONTEND_URL`: Frontend URL for CORS (default: `http://localhost:3000`)
- `ENVIRONMENT`: `development`, `staging`, or `production`

### Frontend Environment Variables

**Public Variables** (prefixed with `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_API_URL`: Backend API URL

Example `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Example Vercel production:
```
NEXT_PUBLIC_API_URL=https://huggingface.co/spaces/YOUR_USERNAME/aido-todo-api
```

### Security Best Practices

1. **Never commit `.env` files** - use `.env.example` as template
2. **Rotate secrets regularly** - especially JWT_SECRET
3. **Use strong JWT secrets** - minimum 32 random characters
4. **Enable HTTPS** - all deployments use HTTPS except localhost
5. **CORS Configuration** - restrict to known frontend domains
6. **Database Backups** - Neon provides automated backups
7. **Monitor deployments** - check GitHub Actions and Vercel logs for errors

## Troubleshooting

### Docker Compose Issues

**Problem**: Services won't start
```bash
# Check logs
docker-compose logs

# Verify Docker is running
docker ps

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

**Problem**: Database connection errors
```bash
# Verify DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL

# Test connection manually
docker exec -it aido-db psql -U postgres -d aido_dev
```

**Problem**: Port conflicts
```bash
# Find process using port
lsof -i :8000
lsof -i :3000

# Use different ports in docker-compose.yml
# Or kill existing processes
kill -9 <PID>
```

### GitHub Actions Issues

**Problem**: Docker push failures
- Verify `GITHUB_TOKEN` permissions (should auto-work)
- Check repository settings > Actions permissions
- Ensure GHCR token has push scope

**Problem**: Workflow not triggering
- Verify branch protection rules don't block workflows
- Check path filters in workflow YAML
- Confirm commit is to correct branch (`main` or `phase-2`)

**Problem**: Test failures
- Review job logs in Actions tab
- Run locally with same database URL
- Check for environment variable issues

### HuggingFace Spaces Issues

**Problem**: Space won't build
- Check build logs in Space settings
- Verify `Dockerfile` exists in `backend/`
- Ensure all dependencies in `requirements.txt`
- Verify environment variables are set

**Problem**: Application crashes on startup
- Check Space logs: Settings > Logs
- Verify `DATABASE_URL` format (must be `postgresql+psycopg://...`)
- Ensure database exists and is accessible
- Check port configuration (Space expects 8000)

**Problem**: API endpoints return 404
- Verify backend is running: check Space logs
- Test health endpoint: `/health`
- Check FRONTEND_URL CORS configuration

### Vercel Deployment Issues

**Problem**: Build fails
- Check Vercel deployment logs in dashboard
- Verify `build` command runs successfully locally: `npm run build`
- Check TypeScript errors: `npm run type-check`
- Verify all environment variables are set

**Problem**: API calls fail from frontend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS headers in backend
- Test API directly: `curl $NEXT_PUBLIC_API_URL/health`
- Check browser console for network errors

**Problem**: Env variables not available
- Ensure variables are prefixed `NEXT_PUBLIC_` for client-side access
- Rebuild after setting variables (Vercel auto-rebuilds)
- Check Vercel dashboard > Settings > Environment Variables

### Common Solutions

```bash
# Clear Docker cache and rebuild
docker system prune -a
docker-compose build --no-cache

# Reset database (destructive)
docker-compose down -v
docker-compose up -d

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend

# Check all logs
docker-compose logs -f

# SSH into running container
docker exec -it aido-backend /bin/bash
docker exec -it aido-frontend /bin/sh
```

## Support

- **GitHub Issues**: Report bugs and feature requests
- **GitHub Discussions**: Ask questions and share ideas
- **Documentation**: See specs/ directory for detailed architecture
- **HuggingFace Community**: https://huggingface.co/community
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Next.js Docs**: https://nextjs.org/docs
