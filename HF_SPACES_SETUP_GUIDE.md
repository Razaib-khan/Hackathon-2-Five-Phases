# Hugging Face Spaces Backend Setup Guide

## Quick Setup (5 minutes)

The backend code has been deployed to HF Spaces, but it needs environment secrets configured to run. Follow these steps:

### Step 1: Go to HF Spaces Settings
1. Open: https://huggingface.co/spaces/Razaib123/aido-todo-api
2. Click "Settings" (top navigation)
3. Navigate to "Secrets" in the left sidebar

### Step 2: Add Required Secrets

You'll need to add 3 secrets. Click "Add secret" for each:

#### Secret 1: DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** `postgresql+psycopg://neondb_owner:npg_5Riqa8fyDMxu@ep-wild-hill-adgzjfcw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **Description:** Neon PostgreSQL connection string for database

#### Secret 2: JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** `AIlWnuqvlVOLbK1DAFU9WOmDdTmskg1XFUHWWBPEoaI`
- **Description:** JWT token signing secret

#### Secret 3: FRONTEND_URL
- **Key:** `FRONTEND_URL`
- **Value:** `https://razaib-khan.github.io`
- **Description:** GitHub Pages frontend URL (for CORS)

### Step 3: Save and Restart
1. Click "Save" after adding each secret
2. Wait 10-15 seconds for the space to restart automatically
3. You should see the status change from "error" to "running"

### Step 4: Verify Health
Once running, test the health endpoint:

```bash
curl https://razaib123-aido-todo-api.hf.space/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "2.0.0"
}
```

If you get this response, the backend is working! ✅

## Troubleshooting

### Problem: Space still shows "error" after adding secrets
- **Solution:** Click the space name at top-left and select "Restart the Space"
- Wait 15-30 seconds for container to start
- Refresh the page

### Problem: Health check returns "database": "error"
- **Solution:** Verify DATABASE_URL is correct
- Check Neon console: https://console.neon.tech/
- The connection string format must be: `postgresql+psycopg://...` (with `psycopg`, not `postgresql`)
- Verify the database exists and is accessible

### Problem: CORS errors in frontend console
- **Solution:** Verify FRONTEND_URL is set to `https://razaib-khan.github.io`
- Check backend/src/main.py CORS configuration matches
- Hard refresh browser (Ctrl+F5)

## Backend Architecture

The HF Spaces backend provides these endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- Returns JWT token in response

### Tasks (user-specific)
- `GET /api/users/{userId}/tasks` - List all tasks
- `POST /api/users/{userId}/tasks` - Create task
- `GET /api/users/{userId}/tasks/{taskId}` - Get single task
- `PUT /api/users/{userId}/tasks/{taskId}` - Update task
- `PATCH /api/users/{userId}/tasks/{taskId}/complete` - Toggle complete
- `DELETE /api/users/{userId}/tasks/{taskId}` - Delete task

### Health
- `GET /health` - Health check (no auth required)

All endpoints require JWT token in `Authorization: Bearer <token>` header (except /auth/* and /health).

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql+psycopg://...` |
| `JWT_SECRET` | JWT signing key | 32+ character secret |
| `FRONTEND_URL` | Frontend origin (CORS) | `https://razaib-khan.github.io` |
| `API_HOST` | Server bind address | `0.0.0.0` |
| `API_PORT` | Server port | `7860` |

## Port Information

- **HF Spaces Standard Port:** 7860
- **Local Development Port:** 7860 (in docker-compose.yml)
- **Old Port (deprecated):** 8000 (updated to 7860 in all configs)

## Deployment URLs

- **Frontend:** https://razaib-khan.github.io/Hackathon-2-Five-Phases/
- **Backend:** https://razaib123-aido-todo-api.hf.space
- **Backend Health:** https://razaib123-aido-todo-api.hf.space/health
- **API Base:** https://razaib123-aido-todo-api.hf.space/api

## After Setup Complete

Once the backend is running:

1. Go to frontend: https://razaib-khan.github.io/Hackathon-2-Five-Phases/
2. Register a new account
3. Create a task
4. Open DevTools (F12) → Network tab
5. You should see requests to `/api/users/{userId}/tasks`
6. All responses should be 200/201/204 (success)
7. No CORS errors should appear

## Questions?

Refer to:
- Backend code: `/backend/src/main.py`
- API routes: `/backend/src/api/`
- Configuration issues: Check `DEPLOYMENT_STATUS.md`
