# Quickstart Guide: AIDO - Advanced Interactive Dashboard Organizer

## Prerequisites

- Python 3.11+
- Node.js 18+
- Neon Serverless PostgreSQL
- Git

## Backend Setup

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment and install dependencies:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database:**
```bash
# Make sure PostgreSQL is running
alembic upgrade head
```

5. **Run the backend server:**
```bash
uvicorn src.main:app --reload --port 8000
```

## Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. **Run the development server:**
```bash
npm run dev
```

## Key Environment Variables

### Backend (.env)
- `DATABASE_URL`: Neon PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (use a strong random key)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration (default: 7)
- `EMAIL_HOST`: Email service host
- `EMAIL_PORT`: Email service port
- `EMAIL_USERNAME`: Email service username
- `EMAIL_PASSWORD`: Email service password
- `VERIFICATION_CODE_EXPIRY_MINUTES`: Verification code expiry time (default: 10)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

## API Documentation

Once the backend is running, API documentation is available at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Database Migrations

Run database migrations with alembic:
```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade migrations
alembic downgrade -1
```

## Running Tests

### Backend Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/unit/test_auth.py
```

### Frontend Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Development Workflow

1. **Start both services:**
   - Backend: `uvicorn src.main:app --reload --port 8000`
   - Frontend: `npm run dev`

2. **API endpoints follow this pattern:**
   - Authentication: `/api/v1/auth/*`
   - Users: `/api/v1/users/*`
   - Tasks: `/api/v1/tasks/*`
   - Admin: `/api/v1/admin/*`

3. **Frontend pages are organized by feature:**
   - Authentication: `/src/app/auth/*`
   - Dashboard: `/src/app/dashboard`
   - Tasks: `/src/app/tasks`
   - Profile: `/src/app/profile`
   - Admin: `/src/app/admin`

## Deployment

### Backend
1. Set production environment variables
2. Run migrations: `alembic upgrade head`
3. Start with a production ASGI server: `uvicorn src.main:app --host 0.0.0.0 --port 8000`

### Frontend
1. Build for production: `npm run build`
2. Serve the `out` directory with a static file server

## Troubleshooting

**Issue:** Database connection errors
**Solution:** Verify Neon PostgreSQL is running and DATABASE_URL is correct

**Issue:** Email verification not working
**Solution:** Ensure email service configuration is correct in both backend and email service provider

**Issue:** Better Auth not working
**Solution:** Verify Better Auth configuration and session management settings