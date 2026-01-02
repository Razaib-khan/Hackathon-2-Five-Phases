# HF Spaces Troubleshooting - Complete Guide

**Last Updated:** 2026-01-02 16:15 UTC+5
**Status:** Code deployed ✅ | Space in error ⚠️
**Space URL:** https://huggingface.co/spaces/Razaib123/aido-todo-api

## Current Status

✅ **Files Deployed to HF Spaces:**
- `Dockerfile` at root (required for Docker spaces)
- `README.md` with proper metadata (`sdk: docker`, `app_port: 7860`)
- `requirements.txt` at root
- `backend/src/` directory with all Python code
- GitHub Actions deployment workflow successful (latest: 16:08:28)

⚠️ **Issue:** Space shows "Your space is in error" when accessed

## Root Cause Analysis

The space is configured correctly as a Docker space (verified via HF API), but the container is failing to start. Most likely causes:

1. **Missing Environment Secrets** - DATABASE_URL not configured
2. **Docker Build Failure** - Build errors in HF Spaces build logs
3. **Runtime Crash** - Container starts but crashes immediately

## Step-by-Step Fix

### Step 1: Verify Environment Secrets (CRITICAL)

1. Go to: https://huggingface.co/spaces/Razaib123/aido-todo-api/settings
2. Click **"Variables and secrets"** in left sidebar
3. Verify these **3 secrets** exist:

   ```
   DATABASE_URL = postgresql+psycopg://neondb_owner:npg_5Riqa8fyDMxu@ep-wild-hill-adgzjfcw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

   JWT_SECRET = AIlWnuqvlVOLbK1DAFU9WOmDdTmskg1XFUHWWBPEoaI

   FRONTEND_URL = https://razaib-khan.github.io
   ```

4. **If any are missing:** Click "Add a new secret" and add them
5. **Check for typos:** Make sure no extra spaces before/after values
6. **Save changes**

### Step 2: Check Build Logs

1. On the space page, look for **"Logs"** tab (usually at bottom or in sidebar)
2. You should see Docker build output like:
   ```
   Building Dockerfile...
   Step 1/XX : FROM python:3.11-slim
   ```
3. **Look for errors** - any lines with "ERROR", "FAILED", or "fatal:"
4. **Copy error messages** and check against common issues below

### Step 3: Force Rebuild

1. Click the **space name** dropdown at top-left
2. Select **"Factory reboot"** or **"Restart the Space"**
3. Wait **2-3 minutes** for rebuild
4. Watch the status indicator change from "Building" → "Running"

### Step 4: Test Health Endpoint

Once status shows "Running":
```bash
curl https://razaib123-aido-todo-api.hf.space/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "2.0.0"
}
```

**If you get error responses:**
- "Your space is in error" = Container crashed, check logs
- 503 Service Unavailable = App started but database connection failed
- 404 Not Found = Routing issue (shouldn't happen)

## Common Errors and Fixes

### Error: "ModuleNotFoundError: No module named 'sqlmodel'"
**Cause:** requirements.txt not found or not installed
**Fix:** Verify `requirements.txt` exists at root and rebuild

### Error: "database connection failed"
**Cause:** DATABASE_URL not set or incorrect
**Fix:** Double-check the DATABASE_URL secret matches exactly

### Error: "Port 7860 is already in use"
**Cause:** Space configuration issue
**Fix:** Verify `app_port: 7860` in README.md metadata

### Error: "COPY failed: no source files were specified"
**Cause:** Dockerfile can't find `backend/src` directory
**Fix:** Verify files were pushed (check git status)

## Verification Checklist

After fixes, verify:

- [ ] Space status shows "Running" (not "Building" or "Error")
- [ ] Health endpoint returns 200 OK with JSON response
- [ ] Database status is "connected" (not "error")
- [ ] Logs show "✅ Database initialized successfully"
- [ ] No error messages in build logs

## If Still Not Working

### Option 1: Check Build Logs Manually
1. SSH into HF Spaces (if available) or check detailed logs
2. Look for Python traceback or Docker errors
3. Share error messages for debugging

### Option 2: Recreate Space
1. Delete current space at: https://huggingface.co/spaces/Razaib123/aido-todo-api/settings
2. Create new space with exact name: `aido-todo-api`
3. Select **"Docker"** as SDK
4. Link to your GitHub repo (or use git push method)
5. Add environment secrets immediately
6. Wait for first build

### Option 3: Local Docker Test
Test if Dockerfile builds locally:
```bash
cd /mnt/d/Hackathon\ 2\ FIve\ Phases
docker build -t aido-test .
docker run -p 7860:7860 \
  -e DATABASE_URL="postgresql+psycopg://..." \
  -e JWT_SECRET="..." \
  -e FRONTEND_URL="https://razaib-khan.github.io" \
  aido-test
```

If local build works, issue is HF Spaces-specific.

## Next Steps After Success

Once health check passes:

1. **Test Frontend Integration:**
   - Go to: https://razaib-khan.github.io/Hackathon-2-Five-Phases/
   - Open DevTools (F12) → Network tab
   - Try register/login
   - Check requests go to HF Spaces backend
   - Verify no CORS errors

2. **Full Workflow Test:**
   - Register new user
   - Login
   - Create task
   - List tasks
   - Update task
   - Delete task
   - All should return 2xx status codes

3. **Create Success Documentation:**
   - Update DEPLOYMENT_STATUS.md
   - Note any HF Spaces configuration gotchas
   - Document environment secrets setup

## Support Resources

- **HF Spaces Docs:** https://huggingface.co/docs/hub/spaces-overview
- **Docker Spaces Guide:** https://huggingface.co/docs/hub/spaces-sdks-docker
- **Neon Database Console:** https://console.neon.tech/
- **GitHub Repo Issues:** https://github.com/Razaib-khan/Hackathon-2-Five-Phases/issues

---

**Key Insight:** HF Spaces Docker builds require:
1. `Dockerfile` at root ✅
2. `README.md` with `sdk: docker` and `app_port` ✅
3. All dependencies in `requirements.txt` ✅
4. Environment secrets configured in Space settings ⚠️ (verify this!)
