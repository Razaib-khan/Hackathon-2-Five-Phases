# AIDO Todo Application Documentation

## Overview
AIDO is a full-stack todo application that enables users to manage their tasks efficiently with priority levels and authentication. The application consists of a Next.js frontend and a FastAPI backend with PostgreSQL database.

## Features
- User registration and authentication
- Secure password reset functionality
- Task management with priority levels (High, Medium, Low)
- Personal task dashboard
- Email notifications

## Tech Stack
- **Frontend**: Next.js 16.1.1, React, TypeScript
- **Backend**: FastAPI, Python 3.11
- **Database**: PostgreSQL (with SQLModel ORM)
- **Authentication**: Custom JWT-based authentication
- **Email Service**: SMTP-based email delivery

## Architecture
The application follows a microservice-like architecture with clear separation between frontend and backend:

### Backend Structure
```
backend/
├── src/
│   ├── api/           # API routes and controllers
│   ├── auth/          # Authentication handlers
│   ├── config/        # Configuration settings
│   ├── database/      # Database connections and setup
│   ├── models/        # Data models (SQLModel)
│   ├── services/      # Business logic
│   └── utils/         # Utilities and helpers
├── alembic/           # Database migrations
└── pyproject.toml     # Python dependencies
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/           # Next.js pages and routing
│   ├── components/    # Reusable UI components
│   ├── hooks/         # React hooks
│   ├── lib/           # API clients and utilities
│   └── types/         # TypeScript type definitions
├── package.json       # Node.js dependencies
└── next.config.ts     # Next.js configuration
```

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

## Environment Variables

### Backend
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=aido_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
SECRET_KEY=your_super_secret_key
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

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Backend
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `pip install -e .`
3. Set up the database: `alembic upgrade head`
4. Run the application: `uvicorn main:app --reload`

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Security Considerations
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Input validation on both frontend and backend
- CSRF protection
- Rate limiting
- SQL injection prevention through ORM usage

## Testing
Unit and integration tests are located in the respective test directories. Run tests using:
- Backend: `pytest`
- Frontend: `npm test`

## Deployment
The application is designed to be deployed with:
- Docker containers for easy orchestration
- Environment-specific configurations
- SSL termination at the load balancer
- Regular security updates

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License
This project is licensed under the MIT License.