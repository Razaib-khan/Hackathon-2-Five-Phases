---
title: AIDO - Advanced Interactive Dashboard Organizer
emoji: 📋
colorFrom: blue
colorTo: indigo
sdk: docker
sdk_version: "27.0.3"
app_file: app.py
pinned: false
---

# AIDO - Advanced Interactive Dashboard Organizer

A comprehensive todo application with CRUD operations, task prioritization, and secure authentication. The platform allows users to create, manage, and organize tasks with different priority levels (critical, high, medium, low) and provides a clean, responsive interface.

## Features

### User Story 1: User Registration and Authentication
- User registration with first name, last name, email, password, and password confirmation
- Better Auth integration for secure authentication
- 6-digit email verification codes for registration and login
- Password hashing and validation
- User profile management

### User Story 2: Task Management
- Create, read, update, and delete tasks
- Required title field and optional description field
- Required priority levels (critical, high, medium, low)
- Task filtering and search functionality
- Notification system for task updates

### User Story 3: Task Prioritization
- Assign priority levels (critical, high, medium, low) to tasks
- Filter and sort tasks by priority
- Priority-based task display and indicators
- Priority change notifications

### User Story 4: Task Filtering and Organization
- Advanced task filtering by priority, status, and date
- Task search functionality
- Bulk task operations
- Saved filter functionality

### User Story 5: Secure Login
- Email/password authentication with 6-digit verification code
- Role-based access control (RBAC) for admin functions
- User management interface for admins
- Security monitoring and audit logging

## Tech Stack

### Backend
- Python 3.11+
- FastAPI for web framework
- SQLAlchemy ORM with PostgreSQL
- Alembic for database migrations
- Pydantic for data validation
- Better Auth for authentication

### Database
- Neon PostgreSQL serverless
- UUID primary keys
- Proper indexing and constraints

### Frontend
- Next.js 16
- TypeScript
- Tailwind CSS
- React hooks and context

## Getting Started

1. Clone the repository
2. Set up backend with `pip install -r requirements.txt` and database migrations
3. Set up frontend with `npm install`
4. Configure environment variables
5. Run both backend and frontend servers

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost/aido_todo
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Security Features

- Better Auth-based authentication with 6-digit verification codes
- Rate limiting to prevent abuse
- Input validation and sanitization
- SQL injection prevention via ORM
- XSS protection with security headers
- Secure password hashing with bcrypt
- Role-based access control for admin functions