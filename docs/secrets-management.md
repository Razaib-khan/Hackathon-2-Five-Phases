# AIDO Application - Secrets and Environment Variables Guide

## Overview
This document outlines the secrets and environment variables required for the AIDO application deployment.

## Required Secrets for GitHub Actions

### Hugging Face Secrets
- `HUGGINGFACE_TOKEN`: Personal access token for Hugging Face with write permissions
- `HUGGINGFACE_USERNAME`: Your Hugging Face username for the deployment space

### Optional Secrets
- `NEXT_PUBLIC_API_URL`: API URL for frontend to connect to backend (defaults to `https://razaib123-aido-todo-api.hf.space`)
- `GITHUB_TOKEN`: Auto-provided by GitHub Actions (for pushing to container registry)

## Backend Environment Variables

### Required for Production
- `DATABASE_URL`: PostgreSQL database connection string
- `JWT_SECRET`: Secret key for JWT token signing (minimum 32 characters)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
- `NEON_DATABASE_URL`: Neon database connection URL (if using Neon)

### Optional Configuration
- `DEBUG`: Enable debug mode (default: false)
- `LOG_LEVEL`: Logging level (default: INFO)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration in minutes (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration in days (default: 7)

## Frontend Environment Variables

### Required for Production
- `NEXT_PUBLIC_API_URL`: Base URL for API calls (e.g., `https://razaib123-aido-todo-api.hf.space`)

### Optional Configuration
- `NEXT_PUBLIC_APP_NAME`: Display name for the application
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Enable analytics (true/false)

## Setting Up Secrets in GitHub

1. Navigate to your repository on GitHub
2. Go to Settings > Secrets and variables > Actions
3. Click "New repository secret" and add the following:

### For Hugging Face Deployment:
```
HUGGINGFACE_TOKEN = [your_huggingface_token]
HUGGINGFACE_USERNAME = [your_username]
```

### For Optional Configuration:
```
NEXT_PUBLIC_API_URL = https://razaib123-aido-todo-api.hf.space
```

## Setting Up Secrets in Hugging Face Spaces

When deploying to Hugging Face Spaces, you can set secrets in the Space settings:

1. Go to your Space repository on Hugging Face
2. Navigate to Files and versions
3. Click on "Settings" tab
4. Go to "Secrets" section
5. Add the following secrets:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS`
   - Any other backend-specific environment variables

## Security Best Practices

1. Never commit secrets to the repository
2. Use strong, randomly generated secrets (especially JWT_SECRET with minimum 32 characters)
3. Rotate secrets regularly
4. Use different secrets for different environments
5. Limit access to secrets to necessary personnel only
6. Use environment-specific configuration files that are gitignored

## Docker Configuration

The Dockerfile is configured to accept environment variables at runtime:

```dockerfile
# Environment variables are loaded at runtime
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1
```

## Example .env Files

### Backend .env.example
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/aido_todo
NEON_DATABASE_URL=your_neon_db_url_here

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Debug
DEBUG=true
LOG_LEVEL=INFO
```

### Frontend .env.local.example
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AIDO Todo App
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Troubleshooting

### Common Issues:
1. **Deployment fails with authentication error**: Check that `HUGGINGFACE_TOKEN` has correct permissions
2. **Database connection fails**: Verify `DATABASE_URL` is correctly formatted and accessible
3. **CORS errors**: Ensure `ALLOWED_ORIGINS` includes your frontend URL
4. **JWT errors**: Confirm `JWT_SECRET` is at least 32 characters and consistent across deployments

### Verification Steps:
1. Test API endpoints manually after deployment
2. Check application logs for any configuration errors
3. Verify all required secrets are properly set in both GitHub and Hugging Face