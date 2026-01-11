# GitHub Actions CI/CD Configuration

This directory contains the GitHub Actions workflows for deploying the Todo application.

## Workflows

### Frontend Deployment
- **File**: `workflows/deploy-frontend.yml`
- **Trigger**: Push to main/master branch or manually triggered
- **Target**: GitHub Pages
- **Purpose**: Builds and deploys the Next.js frontend to GitHub Pages

### Backend Deployment
- **File**: `workflows/deploy-backend-hf.yml`
- **Trigger**: Push to main/master branch or manually triggered
- **Target**: Hugging Face Spaces
- **Purpose**: Deploys the FastAPI backend to Hugging Face Spaces

## Required Secrets

### For Frontend Deployment
- `NEXT_PUBLIC_API_URL` - The backend API URL (optional, defaults to localhost:8000)

### For Backend Deployment
- `HF_ACCESS_TOKEN` - Hugging Face access token with write permissions
- `HF_SPACE_REPO_ID` - Hugging Face Space repository ID (format: `username/space-name`)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `AUTH_SECRET` - Authentication secret

### Optional Variables
- `BASE_PATH` - Base path for GitHub Pages deployment (if hosted under a subdirectory)

## Environment Setup

### Setting up GitHub Secrets

1. Go to your repository Settings
2. Navigate to Secrets and variables > Actions
3. Add the required secrets mentioned above

### Setting up GitHub Pages

1. Go to your repository Settings
2. Navigate to Pages
3. Select Source as "GitHub Actions"

## Deployment Process

1. Code is pushed to the main/master branch
2. GitHub Actions triggers the appropriate workflow
3. Frontend workflow builds the Next.js app and deploys to GitHub Pages
4. Backend workflow packages and deploys to Hugging Face Spaces
5. Both deployments happen independently and can be monitored separately

## Troubleshooting

### Frontend Deployment Issues
- Ensure `NEXT_PUBLIC_API_URL` is correctly set in repository secrets
- Check that the build command in package.json matches the workflow
- Verify that the output directory is set to `out` in next.config.js

### Backend Deployment Issues
- Confirm that the Hugging Face access token has sufficient permissions
- Verify that the space repository ID is in the correct format
- Check that all required environment variables are set in the workflow