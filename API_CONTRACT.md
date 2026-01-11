# API Contract Documentation

## Frontend-Backend Integration

### Backend Endpoints (http://localhost:8000)

#### Health Check
- `GET /health` - Returns service health status

#### Authentication Routes (prefix: `/api`)
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/auth/sign-in` - Better Auth compatible sign-in
- `POST /api/auth/sign-up` - Better Auth compatible sign-up
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password
- `GET /api/auth/get-session` - Get current session

#### Task Management Routes (prefix: `/tasks`)
- `GET /tasks` - Get all user tasks
- `POST /tasks` - Create new task
- `GET /tasks/{task_id}` - Get specific task
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task

### Frontend Configuration

#### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to `http://localhost:8000`)

#### Frontend API Routes (http://localhost:3000)
- `GET /api/health` - Health check endpoint for container monitoring

### API Contract Consistency

The following TypeScript interfaces match the backend Pydantic models:

#### Authentication
- RegisterData ↔ RegisterRequest
- RegisterResponse ↔ RegisterResponse
- LoginData ↔ LoginRequest
- LoginResponse ↔ LoginResponse

#### Tasks
- Task ↔ Task
- CreateTaskData ↔ TaskCreateRequest
- UpdateTaskData ↔ TaskUpdateRequest

### Container Health Checks
- Backend: Dockerfile checks `/health` endpoint
- Frontend: Dockerfile checks `/api/health` endpoint