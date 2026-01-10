# Quickstart Guide for AIDO Todo Application

## Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend development)
- uv package manager
- PostgreSQL-compatible database (Neon Serverless PostgreSQL recommended)

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   uv pip install fastapi sqlmodel python-multipart python-jose[cryptography] passlib[bcrypt] better-auth psycopg
   ```

4. **Set up environment variables:**
   ```bash
   # Create .env file with the following variables:
   DATABASE_URL="postgresql://username:password@localhost/dbname"
   SECRET_KEY="your-secret-key-here"
   EMAIL_SERVICE_API_KEY="your-email-service-api-key"
   ```

5. **Run database migrations:**
   ```bash
   # This will be implemented as part of the setup process
   ```

6. **Start the backend server:**
   ```bash
   uvicorn src.api.main:app --reload
   ```

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env.local file with the following variables:
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Sign in user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Tasks
- `GET /tasks` - Get current user's tasks
- `POST /tasks` - Create a new task
- `PUT /tasks/{task_id}` - Update a task
- `DELETE /tasks/{task_id}` - Delete a task

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/aido
SECRET_KEY=32-character-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EMAIL_SERVICE_PROVIDER=sendgrid  # or mailgun, smtp
EMAIL_SERVICE_API_KEY=your-api-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Development Workflow

1. **Start backend first** (on port 8000)
2. **Start frontend** (on port 3000)
3. **Access the application** at http://localhost:3000
4. **API documentation** available at http://localhost:8000/docs