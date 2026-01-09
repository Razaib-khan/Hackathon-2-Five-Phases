# Five Phase Hackathon Platform

A comprehensive platform for managing hackathons through five distinct phases: Registration, Ideation, Development, Submission, and Presentation/Judging.

## Features

### User Story 1: Participant Registration
- User registration and authentication with email/password
- OAuth2 integration for Google and GitHub login
- Password hashing and validation
- User profile management
- Email confirmation and GDPR compliance

### User Story 2: Phase Progression Tracking
- Hackathon creation and management
- Multiple phase types (Registration, Ideation, Development, Submission, Presentation, Judging, Results)
- Phase scheduling and automatic transitions
- Notification system for phase changes
- Timeline visualization of hackathon phases
- Countdown timers for phase deadlines

### User Story 3: Team Formation and Management
- Team creation with customizable sizes
- Team member invitations and role assignments
- Team joining and leaving functionality
- Team member management (leader can manage members)
- Automatic team validation during hackathon registration

### User Story 4: Project Submission and Presentation
- Team-based project submissions
- Multiple file uploads with cloud storage integration
- Demo video and presentation deck links
- Judge evaluation system with scoring
- Category-based evaluations (Technical, Creativity, etc.)
- Anonymous submissions for unbiased judging

### User Story 5: Admin Management and Monitoring
- User management (role assignment, activation/deactivation)
- Hackathon management and creation
- Comprehensive reporting system
- Audit logging for security and compliance
- Platform usage statistics
- System health monitoring

### Cross-Cutting Concerns
- Comprehensive logging with JSON format
- Rate limiting and security headers
- Input validation and sanitization
- Role-based access control (RBAC)
- GDPR compliance features
- API documentation with Swagger UI

## Tech Stack

### Backend
- Python 3.11+
- FastAPI for web framework
- SQLAlchemy ORM with PostgreSQL
- Alembic for database migrations
- Pydantic for data validation
- JWT for authentication
- OAuth2 for social login

### Database
- PostgreSQL 15
- UUID primary keys
- Proper indexing and constraints

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React hooks and context

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user profile

### Hackathons & Phases
- `POST /api/v1/hackathons` - Create a new hackathon
- `GET /api/v1/hackathons` - Get all hackathons
- `GET /api/v1/hackathons/{id}` - Get specific hackathon
- `PUT /api/v1/hackathons/{id}` - Update hackathon
- `POST /api/v1/hackathons/{id}/phases` - Create phase for hackathon
- `GET /api/v1/hackathons/{id}/phases` - Get all phases for hackathon
- `GET /api/v1/hackathons/{id}/current-phase` - Get current active phase

### Teams
- `POST /api/v1/teams` - Create a new team
- `GET /api/v1/teams/{id}` - Get specific team
- `PUT /api/v1/teams/{id}` - Update team
- `DELETE /api/v1/teams/{id}` - Delete team
- `POST /api/v1/teams/{id}/members` - Add member to team
- `DELETE /api/v1/teams/{id}/members/{user_id}` - Remove member from team
- `POST /api/v1/teams/{id}/invitations` - Send team invitation
- `POST /api/v1/team-invitations/{id}/accept` - Accept team invitation

### Submissions & Evaluations
- `POST /api/v1/submissions` - Create a new submission
- `GET /api/v1/submissions/{id}` - Get specific submission
- `PUT /api/v1/submissions/{id}` - Update submission
- `DELETE /api/v1/submissions/{id}` - Withdraw submission
- `POST /api/v1/submissions/{id}/files` - Upload file to submission
- `POST /api/v1/submissions/{id}/evaluations` - Evaluate submission
- `GET /api/v1/submissions/{id}/score` - Get average score for submission

### Notifications
- `GET /api/v1/notifications` - Get user's notifications
- `GET /api/v1/notifications/unread` - Get unread notifications
- `POST /api/v1/notifications/{id}/read` - Mark notification as read
- `GET /api/v1/notification-preferences` - Get notification preferences
- `PUT /api/v1/notification-preferences` - Update notification preferences

### Admin
- `GET /api/v1/admin/users` - Get all users (admin only)
- `PUT /api/v1/admin/users/{id}/role` - Update user role (admin only)
- `GET /api/v1/admin/hackathons` - Get all hackathons (admin only)
- `GET /api/v1/admin/reports/platform-usage` - Get platform usage report (admin only)
- `GET /api/v1/admin/reports/system-health` - Get system health report (admin only)

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hackathon-platform
```

2. Set up backend:
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Update .env with your database credentials
alembic upgrade head
uvicorn src.main:app --reload
```

3. Set up frontend:
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost/dbname
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

## Security Features

- JWT-based authentication with refresh tokens
- Rate limiting to prevent abuse
- Input validation and sanitization
- SQL injection prevention via ORM
- XSS protection with security headers
- Secure password hashing with bcrypt
- OAuth2 integration with secure providers

## Database Schema

The platform uses a comprehensive database schema with the following main entities:

- **Users**: Account management with roles and profiles
- **Hackathons**: Events with multiple phases
- **Phases**: Different stages of the hackathon lifecycle
- **Teams**: Groups of participants working together
- **Submissions**: Project deliverables from teams
- **Evaluations**: Scoring and feedback from judges
- **Notifications**: Communication system for updates
- **Audit Logs**: Security and compliance tracking

## Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd frontend
npm test
```

## Deployment

The platform includes Docker configurations for easy deployment:

1. Build the containers:
```bash
docker-compose build
```

2. Run the application:
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
