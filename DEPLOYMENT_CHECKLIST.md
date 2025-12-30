# Deployment Checklist

Complete checklist for deploying AIDO Todo application to HuggingFace Spaces and Vercel.

## Pre-Deployment Prerequisites

- [ ] GitHub account with access to repository
- [ ] Docker installed locally (for testing)
- [ ] Git CLI configured with credentials
- [ ] Backend `.env` file created with Neon database credentials
- [ ] All code committed and pushed to GitHub

## Local Testing (Before Remote Deployment)

- [ ] Clone repository locally
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Fill in `DATABASE_URL` (from Neon console)
- [ ] Fill in `JWT_SECRET` (generate with: `python -c "import secrets; print(secrets.token_hex(32))"`)
- [ ] Run `docker-compose build` (verify images build)
- [ ] Run `docker-compose up -d` (verify services start)
- [ ] Test `curl http://localhost:8000/health` (verify backend)
- [ ] Test `http://localhost:3000` in browser (verify frontend)
- [ ] Stop services: `docker-compose down`

## GitHub Repository Setup

- [ ] Repository URL: https://github.com/Razaib-khan/Hackathon-2-Five-Phases
- [ ] Main branch has latest code merged (PR #3 merged)
- [ ] Phase-2 branch pushed to remote
- [ ] All GitHub Actions workflow files present:
  - [ ] `.github/workflows/backend-ci.yml`
  - [ ] `.github/workflows/frontend-ci.yml`
  - [ ] `.github/workflows/deploy-huggingface.yml`
- [ ] No secrets committed (.env file excluded via .gitignore)
- [ ] Repository settings allow GitHub Actions (Settings > Actions)

## HuggingFace Spaces Setup (Backend)

### Account & Token Setup
- [ ] HuggingFace account created (https://huggingface.co)
- [ ] User token generated (https://huggingface.co/settings/tokens)
- [ ] Saved token securely (for GitHub secret)
- [ ] Know your HuggingFace username

### Space Creation
- [ ] Navigate to https://huggingface.co/spaces
- [ ] Click "Create new Space"
- [ ] Space name: `aido-todo-api`
- [ ] Select SDK: `Docker`
- [ ] Visibility: `Public` (or `Private` if preferred)
- [ ] Space created and accessible

### Environment Variables in Space
In Space Settings > Environment variables, add:

```
DATABASE_URL = postgresql+psycopg://user:password@host/database?sslmode=require
JWT_SECRET = (generate: python -c "import secrets; print(secrets.token_hex(32))")
API_HOST = 0.0.0.0
API_PORT = 8000
FRONTEND_URL = https://your-vercel-url.vercel.app
ENVIRONMENT = production
```

- [ ] DATABASE_URL set correctly (from Neon console)
- [ ] JWT_SECRET set (must be 32+ characters)
- [ ] API_HOST set to 0.0.0.0
- [ ] API_PORT set to 8000
- [ ] FRONTEND_URL set to your Vercel URL (set after Vercel deployment)
- [ ] ENVIRONMENT set to production

### GitHub Secret for HuggingFace
In GitHub Settings > Secrets and variables > Actions:
- [ ] Secret created: `HUGGINGFACE_TOKEN` = your token value
- [ ] Secret created: `HUGGINGFACE_USERNAME` = your username

## Vercel (Frontend) Setup

### Account & Project Setup
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub repository imported into Vercel
- [ ] Project created in Vercel dashboard

### Project Configuration
In Vercel Project Settings:
- [ ] Framework Preset: Next.js
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm ci`
- [ ] Environment: Set from `.env.vercel.example`

### Environment Variables in Vercel
In Project Settings > Environment Variables:
- [ ] `NEXT_PUBLIC_API_URL` = `https://huggingface.co/spaces/USERNAME/aido-todo-api` (after HF space is running)
- [ ] Variable added to: Production, Preview, Development environments
- [ ] Re-deploy after adding variables (Vercel auto-rebuilds)

### GitHub Secrets for Vercel
In GitHub Settings > Secrets and variables > Actions:
- [ ] Secret created: `VERCEL_TOKEN` (from https://vercel.com/account/tokens)
- [ ] Secret created: `VERCEL_ORG_ID` (from Vercel dashboard)
- [ ] Secret created: `VERCEL_PROJECT_ID` (from Vercel dashboard)

## GitHub Actions Workflow Secrets

In GitHub Settings > Secrets and variables > Actions, verify all secrets:

- [ ] `VERCEL_TOKEN` - Vercel authentication token
- [ ] `VERCEL_ORG_ID` - Vercel organization/team ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID
- [ ] `HUGGINGFACE_TOKEN` - HuggingFace user token
- [ ] `HUGGINGFACE_USERNAME` - HuggingFace username

Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions

## CI/CD Pipeline Verification

### Backend CI/CD (`backend-ci.yml`)
- [ ] Trigger test: Push code change to backend/
- [ ] Monitor: GitHub Actions tab shows workflow running
- [ ] Wait for completion (~5-10 minutes)
- [ ] Verify: All jobs passed (lint, test, build, security)
- [ ] Check: Docker image pushed to GHCR

### Frontend CI/CD (`frontend-ci.yml`)
- [ ] Trigger test: Push code change to frontend/
- [ ] Monitor: GitHub Actions tab shows workflow running
- [ ] Wait for completion (~5-10 minutes)
- [ ] Verify: All jobs passed (lint, test, build, security, deploy)
- [ ] Check: Vercel deployment triggered automatically

### HuggingFace Deployment (`deploy-huggingface.yml`)
- [ ] Trigger test: Push code change to backend/ on main branch
- [ ] Monitor: GitHub Actions tab shows workflow running
- [ ] Check: Workflow pushes to HuggingFace Spaces repo
- [ ] Verify: HuggingFace Space rebuilds (check Space build logs)
- [ ] Wait: 2-3 minutes for space to finish building

## Deployment Verification

### Backend - HuggingFace Spaces
- [ ] Space URL: https://huggingface.co/spaces/USERNAME/aido-todo-api
- [ ] Test health endpoint: `/health` returns `{"status":"healthy","database":"connected"}`
- [ ] API docs accessible: `/docs`
- [ ] Database connectivity verified in logs
- [ ] Can connect frontend to this API URL

### Frontend - Vercel
- [ ] Application URL: https://project-name.vercel.app
- [ ] Page loads and displays UI
- [ ] Navigation works
- [ ] Can access APIs if authenticated
- [ ] Environment variables loaded (check in console or via request)

### End-to-End Testing
- [ ] Frontend loads successfully
- [ ] Frontend can reach backend API
- [ ] Health check returns connected status
- [ ] Login/signup endpoints accessible
- [ ] Tasks can be created/read/updated/deleted
- [ ] JWT tokens working correctly
- [ ] Database operations working

## Post-Deployment

### Monitoring & Maintenance
- [ ] Set up monitoring alerts for HuggingFace Space
- [ ] Monitor Vercel deployment logs
- [ ] Check GitHub Actions for failed builds
- [ ] Review security scan results regularly
- [ ] Set up log aggregation if needed

### Documentation Updates
- [ ] Update README with deployment URLs
- [ ] Document any custom configurations
- [ ] Create runbook for common issues
- [ ] Document database backup procedures
- [ ] Create incident response procedures

### Team Communication
- [ ] Share deployment URLs with team
- [ ] Document how to access API docs
- [ ] Share environment variable requirements
- [ ] Document how to update deployments
- [ ] Create rollback procedures

### Security Review
- [ ] Verify no secrets in logs
- [ ] Check CORS configuration
- [ ] Review database access controls
- [ ] Test JWT token validation
- [ ] Verify SSL/HTTPS on all endpoints
- [ ] Check rate limiting if implemented

## Troubleshooting Guide

### HuggingFace Space Won't Start
- [ ] Check Space build logs (Settings > Logs)
- [ ] Verify Dockerfile exists in backend/
- [ ] Verify all required dependencies in requirements.txt
- [ ] Check environment variables are set correctly
- [ ] Verify DATABASE_URL format: `postgresql+psycopg://...`

### Vercel Deployment Fails
- [ ] Check Vercel deployment logs in dashboard
- [ ] Run locally: `npm run build` in frontend directory
- [ ] Check TypeScript errors: `npm run type-check`
- [ ] Verify all environment variables set in Vercel
- [ ] Check GitHub Actions did not fail before deployment

### GitHub Actions Workflows Not Triggering
- [ ] Check branch is main or phase-2
- [ ] Verify code changes are in correct path (backend/ or frontend/)
- [ ] Check repository settings allow Actions
- [ ] Verify workflow files exist in `.github/workflows/`
- [ ] Check GitHub Actions tab for any error messages

### Frontend Can't Reach Backend
- [ ] Verify NEXT_PUBLIC_API_URL is set in Vercel
- [ ] Check HuggingFace Space is running and healthy
- [ ] Test backend directly: curl $API_URL/health
- [ ] Check browser console for CORS errors
- [ ] Verify frontend is rebuilt after env var change

### Database Connection Fails
- [ ] Verify DATABASE_URL format is correct
- [ ] Check DATABASE_URL is set in HuggingFace Space
- [ ] Verify Neon database is running
- [ ] Test connection string locally
- [ ] Check Neon IP whitelist allows HuggingFace IPs

## Rollback Procedures

### Revert to Previous Version
```bash
# Find previous commit
git log --oneline

# Revert to commit
git revert COMMIT_HASH

# Push to trigger redeployment
git push origin main
```

### Revert Environment Variables
- HuggingFace: Settings > Environment variables > Edit value
- Vercel: Settings > Environment Variables > Edit and redeploy

### Restore Database from Backup
- Contact Neon support for restore
- Or restore from backup if taken manually

## Success Criteria

### Deployment Complete When:
- [ ] HuggingFace Space is running and healthy
- [ ] Vercel frontend is deployed successfully
- [ ] GitHub Actions workflows all pass
- [ ] End-to-end tests pass (frontend ↔ backend ↔ database)
- [ ] Team can access application
- [ ] Documentation is updated
- [ ] All security checks pass

## Final Handoff Checklist

- [ ] Documentation complete and shared
- [ ] Team trained on deployment process
- [ ] Runbooks created for common issues
- [ ] Monitoring/alerts configured
- [ ] Backup procedures documented
- [ ] Incident response plan created
- [ ] Security review completed
- [ ] Performance baseline established
- [ ] Cost optimization reviewed
- [ ] Compliance requirements met

## Quick Links

- **GitHub Repository**: https://github.com/Razaib-khan/Hackathon-2-Five-Phases
- **HuggingFace Spaces**: https://huggingface.co/spaces
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/Razaib-khan/Hackathon-2-Five-Phases/actions
- **Neon Console**: https://console.neon.tech
- **DEPLOYMENT.md**: Complete deployment guide
- **DOCKER_COMMANDS.md**: Docker quick reference

## Notes

```
[Space for additional notes during deployment]


```
