# Quickstart Guide: Backend and Database Schema Alignment

## Prerequisites

- Node.js 18+ installed
- PostgreSQL or Neon database instance
- Git for version control
- npm or yarn package manager

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables
Create a `.env` file with the following variables:
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
PORT=8000
NODE_ENV=development
```

### 4. Database Setup
Run the database migrations:
```bash
npm run migrate
# or
yarn migrate
```

### 5. Start the Development Server
```bash
npm run dev
# or
yarn dev
```

The server will start on `http://localhost:8000`.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Tasks
- `GET /api/users/{user_id}/tasks` - Get user tasks
- `POST /api/users/{user_id}/tasks` - Create task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Tags
- `GET /api/users/{user_id}/tags` - Get user tags
- `POST /api/users/{user_id}/tags` - Create tag
- `PUT /api/tags/{id}` - Update tag
- `DELETE /api/tags/{id}` - Delete tag

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/streak` - Get streak data

## Testing

Run unit tests:
```bash
npm test
# or
yarn test
```

Run integration tests:
```bash
npm run test:integration
# or
yarn run test:integration
```

## Database Migrations

To create a new migration:
```bash
npm run migration:create --name="your-migration-name"
# or
yarn migration:create --name="your-migration-name"
```

To run pending migrations:
```bash
npm run migrate
# or
yarn migrate
```

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Commit your changes: `git commit -m "feat: your commit message"`
5. Push your branch: `git push origin feature/your-feature`
6. Create a pull request

## Troubleshooting

### Common Issues
- **Database connection errors**: Verify your DATABASE_URL is correct
- **JWT errors**: Ensure JWT_SECRET is properly set
- **404 errors**: Check that the endpoint exists and the route is correct
- **401 errors**: Verify authentication token is properly included in requests

### Useful Commands
- Check API status: `curl http://localhost:8000/health`
- View database schema: `npx prisma db pull`
- Reset database: `npx prisma migrate reset`

## Deployment

### Environment Variables for Production
```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_jwt_refresh_secret
PORT=8000
NODE_ENV=production
```

### Build and Deploy
```bash
npm run build
npm start
```

## Next Steps

1. Review the API documentation at `/docs` endpoint
2. Set up monitoring and logging
3. Configure your frontend to use the new API endpoints
4. Test the integration between frontend and backend
5. Implement additional features as needed