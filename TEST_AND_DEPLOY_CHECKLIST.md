# Testing and Deployment Checklist

## Pre-Deployment Verification

### 1. Verify Local Development Works

```bash
# Step 1: Ensure you're in project root
cd /mnt/d/Hackathon\ 2\ FIve\ Phases

# Step 2: Build and run services
docker-compose up --build

# Expected output:
# - Backend logs show: "✅ Database initialized successfully"
# - Frontend logs show: "▲ Next.js 16.0.0"
# Both services should be "healthy"
```

### 2. Test Backend Health

```bash
# In a new terminal:
curl http://localhost:7860/health

# Expected response:
# {"status":"healthy","database":"connected","version":"2.0.0"}
```

### 3. Test Frontend Loads

```bash
# Open browser: http://localhost:3000
# Expected:
# - Page loads without errors
# - Console shows no CORS errors
# - Console shows no 404 errors
```

### 4. Test Full Workflow (Manual)

1. **Registration**
   - Click "Sign Up"
   - Enter test email: `test@example.com`
   - Enter password: `TestPass123`
   - Click "Sign Up"
   - Check browser console Network tab:
     - Request to: `http://localhost:7860/auth/register`
     - Response status: 201
     - Response contains: `access_token` field

2. **Login**
   - Enter same credentials
   - Click "Login"
   - Check Network tab:
     - Request to: `http://localhost:7860/auth/login`
     - Response status: 200

3. **Create Task**
   - Type task title: "Test Task"
   - Click "Create"
   - Check Network tab:
     - Request to: `http://localhost:7860/api/users/{user_id}/tasks`
     - Request method: POST
     - Response status: 201

4. **List Tasks**
   - Verify task appears on page
   - Check Network tab:
     - Request to: `http://localhost:7860/api/users/{user_id}/tasks`
     - Request method: GET
     - Response contains task data

5. **Update Task**
   - Edit the task
   - Change title and/or description
   - Click "Update"
   - Check Network tab:
     - Request to: `http://localhost:7860/api/users/{user_id}/tasks/{task_id}`
     - Request method: PUT
     - Response shows updated data

6. **Complete Task**
   - Click checkbox to mark complete
   - Check Network tab:
     - Request to: `http://localhost:7860/api/users/{user_id}/tasks/{task_id}/complete`
     - Request method: PATCH
     - Task shows as completed

7. **Delete Task**
   - Click delete button
   - Check Network tab:
     - Request to: `http://localhost:7860/api/users/{user_id}/tasks/{task_id}`
     - Request method: DELETE
     - Response status: 204
   - Task removed from list

### 5. Verify No Phase 1 Changes

```bash
# Check that Phase 1 files are unchanged
git diff src/
git diff tests/

# Expected: No changes (should be empty)
```

---

## Deployment

### Prerequisites

- ✅ Local tests pass
- ✅ All 4 fixes applied
- ✅ No Phase 1 files modified
- ✅ Git repo clean (no uncommitted changes except the fixes)

### Deploy to Production

```bash
# Step 1: Add all changes
git add .

# Step 2: Commit with descriptive message
git commit -m "fix: resolve frontend-backend connectivity issues

- Fixed API endpoint routing in frontend (src/lib/api.ts)
  All task endpoints now correctly use /api/users/{id}/tasks* routes

- Updated CORS configuration in backend (src/main.py)
  Allows requests from https://razaib-khan.github.io and HF Spaces domain

- Unified port configuration to 7860 (docker-compose.yml)
  Matches HF Spaces standard port and Dockerfile expectations

- Created frontend/.env.local for local development
  Provides correct API URL for docker-compose setup

Fixes #ISSUE_NUMBER (if you have an issue tracker)"

# Step 3: Push to main branch
git push origin main

# Expected:
# GitHub Actions triggers automatically
# - deploy-github-pages.yml workflow starts
# - deploy-huggingface.yml workflow starts
```

### Monitor Deployments

1. **GitHub Actions Dashboard**
   ```
   https://github.com/razaib-khan/Hackathon-2-Five-Phases/actions
   ```
   - Watch "Deploy Frontend to GitHub Pages" workflow
   - Watch "Deploy to Hugging Face Spaces" workflow
   - Both should show ✅ success within 2-3 minutes

2. **Frontend Deployment**
   - Build log should show: `NEXT_PUBLIC_API_URL=https://razaib123-aido-todo-api.hf.space`
   - Deployment log should show: "✅ Frontend deployed to GitHub Pages"
   - Artifact should be uploaded

3. **Backend Deployment**
   - Should show: "✅ Backend deployed to Hugging Face Spaces"
   - HF Spaces repo should receive push

---

## Production Testing

### Wait for Deployments to Complete

- GitHub Pages: ~2 minutes
- HF Spaces: ~3 minutes
- Total wait: ~5 minutes

### Test Frontend at GitHub Pages

```
Open: https://razaib-khan.github.io/Hackathon-2-Five-Phases
```

1. **Check Page Loads**
   - Page should load without blank screen
   - No console errors
   - No 404 errors

2. **Test Registration**
   - Fill out signup form
   - Check Network tab → find request to `https://razaib123-aido-todo-api.hf.space/auth/register`
   - Response status should be 201
   - Response should contain `access_token`

3. **Check CORS Headers**
   - In Network tab, click on `/auth/register` request
   - Go to Response Headers tab
   - Look for: `Access-Control-Allow-Origin: https://razaib-khan.github.io`
   - This confirms CORS is working correctly

4. **Test Login**
   - Login with same credentials
   - Should receive JWT token
   - Token stored in localStorage

5. **Test Task Operations**
   - Create task
   - List tasks (should appear immediately)
   - Update task (changes should persist)
   - Mark complete
   - Delete task

6. **Verify API Calls**
   - All requests should go to: `https://razaib123-aido-todo-api.hf.space`
   - No requests to localhost
   - All responses should have status 200-204 (no 404 errors)

---

## Troubleshooting

### If Frontend Doesn't Load

**Symptom**: Blank page or 404 at GitHub Pages

**Possible Causes**:
1. GitHub Pages build failed
2. Build didn't set correct API URL

**Fix**:
```bash
# Check GitHub Actions logs
# Go to: https://github.com/razaib-khan/Hackathon-2-Five-Phases/actions
# Click "Deploy Frontend to GitHub Pages"
# Check "Build static site" step for errors

# Common issues:
# - Node version incompatibility (use Node 20)
# - Build step failed (check dependencies)
```

### If CORS Error Appears

**Symptom**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Possible Causes**:
1. Backend CORS not updated
2. Wrong domain in allow_origins

**Fix**:
```bash
# Verify CORS in backend
curl -H "Origin: https://razaib-khan.github.io" \
  https://razaib123-aido-todo-api.hf.space/health -v

# Should see header:
# Access-Control-Allow-Origin: https://razaib-khan.github.io

# If not, backend wasn't deployed. Try:
git push --force origin main  # Force re-deploy
```

### If 404 Errors on Task Operations

**Symptom**:
```
API error: 404 on task creation
Network shows: POST /tasks → 404
```

**Possible Causes**:
1. Frontend not redeployed with fixes
2. Old cached version in browser

**Fix**:
```bash
# Hard refresh GitHub Pages
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Or clear browser cache and reload
# Check Network tab to verify requests go to /api/users/{id}/tasks
```

### If Backend Doesn't Start

**Symptom**:
```
Connection refused at razaib123-aido-todo-api.hf.space
```

**Possible Causes**:
1. HF Spaces deployment failed
2. Database connection error

**Fix**:
```bash
# Check HF Spaces logs
# 1. Go to: https://huggingface.co/spaces/Razaib123/aido-todo-api
# 2. Click "App" tab
# 3. Scroll to "Logs" section
# 4. Look for database connection errors

# Common issues:
# - DATABASE_URL not set in HF Spaces secrets
# - DATABASE_URL expired (Neon credential issue)
# - Neon database down

# To fix:
# 1. Go to HF Space settings
# 2. Set DATABASE_URL secret to valid Neon connection string
# 3. Restart space
```

---

## Success Criteria

All of these should be true:

- [ ] Local development works: `docker-compose up` → register → create task ✅
- [ ] GitHub Pages loads without errors ✅
- [ ] Frontend makes requests to correct API endpoints ✅
- [ ] CORS headers present: `Access-Control-Allow-Origin: https://razaib-khan.github.io` ✅
- [ ] Backend health check returns 200: `https://razaib123-aido-todo-api.hf.space/health` ✅
- [ ] Registration works on deployed frontend ✅
- [ ] Login works on deployed frontend ✅
- [ ] Task creation works (Network shows POST to `/api/users/{id}/tasks` → 201) ✅
- [ ] Task listing works (Network shows GET to `/api/users/{id}/tasks` → 200) ✅
- [ ] Task update works (Network shows PUT to `/api/users/{id}/tasks/{id}` → 200) ✅
- [ ] Task completion toggle works (Network shows PATCH to `/api/users/{id}/tasks/{id}/complete` → 200) ✅
- [ ] Task deletion works (Network shows DELETE to `/api/users/{id}/tasks/{id}` → 204) ✅
- [ ] No CORS errors in console ✅
- [ ] No 404 errors in Network tab ✅
- [ ] Phase 1 files unchanged ✅

---

## Support

If you encounter any issues:

1. **Check this document** for troubleshooting steps
2. **Review the detailed diagnosis documents**:
   - `CONNECTIVITY_FIX_REPORT.md`
   - `FRONTEND_BACKEND_DIAGNOSIS.md`
   - `ISSUES_AND_FIXES.txt`
3. **Inspect browser console** for specific error messages
4. **Check GitHub Actions** for deployment errors
5. **Verify backend logs** on HF Spaces

---

**Status**: ✅ Ready to deploy

**Next Step**: Run `git push origin main` to trigger deployments
