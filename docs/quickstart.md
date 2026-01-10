# AIDO Todo Application - Quick Start Guide

## Overview
This guide will help you quickly set up and run the AIDO Todo Application on your local development environment.

## Prerequisites
- Python 3.11 or higher
- Node.js 18.x or higher
- PostgreSQL 12 or higher
- Git

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd aido-todo-app
```

### 2. Backend Setup

#### Navigate to the backend directory
```bash
cd backend
```

#### Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install dependencies
```bash
pip install -e .
```

#### Set up environment variables
Create a `.env` file in the backend directory:
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=aido_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_postgres_password
SECRET_KEY=your_super_secret_key_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@aidoapp.com
BASE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### Run database migrations
```bash
alembic upgrade head
```

#### Start the backend server
```bash
uvicorn backend.src.api.main:create_app --factory --reload
```

### 3. Frontend Setup

#### Navigate to the frontend directory
```bash
cd frontend  # from the project root
```

#### Install dependencies
```bash
npm install
```

#### Set up environment variables
Create a `.env.local` file in the frontend directory:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Start the frontend development server
```bash
npm run dev
```

## Accessing the Application

1. Backend API will be available at: `http://localhost:8000`
2. Frontend will be available at: `http://localhost:3000`
3. API documentation will be available at: `http://localhost:8000/docs`

## Creating Your First Account

1. Visit `http://localhost:3000/auth/register`
2. Fill in your registration details
3. Submit the form to create your account
4. You'll be automatically logged in and redirected to the dashboard

## Using the Task Management Features

1. Once logged in, you'll see the dashboard
2. Click "Add New Task" to create a task
3. Fill in the task details including title, description, and priority
4. Save the task to add it to your list
5. You can edit, complete, or delete tasks as needed

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Tasks
- `GET /tasks` - Get current user's tasks
- `POST /tasks` - Create a new task
- `GET /tasks/{task_id}` - Get a specific task
- `PUT /tasks/{task_id}` - Update a task
- `DELETE /tasks/{task_id}` - Delete a task

## Troubleshooting

### Common Issues

**Issue**: Database connection errors
**Solution**: Verify your PostgreSQL server is running and the credentials in your `.env` file are correct

**Issue**: Frontend can't connect to backend
**Solution**: Ensure the `NEXT_PUBLIC_API_URL` in your frontend `.env.local` matches your backend server URL

**Issue**: Email service errors
**Solution**: If you don't need email functionality for development, you can skip SMTP configuration, though password reset won't work

### Development Commands

#### Backend
- Run tests: `pytest`
- Format code: `black .`
- Check linting: `flake8`

#### Frontend
- Run tests: `npm test`
- Build for production: `npm run build`
- Format code: `npm run lint`

## Next Steps

1. Explore the API documentation at `/docs`
2. Customize the UI in the frontend components
3. Add new features by extending the services and models
4. Set up automated tests for continuous integration

## Support

If you encounter any issues with the setup, please check the GitHub repository for known issues or create a new issue with detailed information about your problem.