# Quick Docker Commands Reference

## Starting & Stopping

```bash
# Start all services (detached mode)
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d backend
docker-compose up -d frontend
docker-compose up -d db

# Stop all services (keeps data)
docker-compose stop

# Stop and remove containers (keeps volumes/data)
docker-compose down

# Stop and remove everything (DELETES DATABASE)
docker-compose down -v

# Full reset (rebuild images + restart)
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Viewing Logs

```bash
# View all service logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100

# Last 10 minutes
docker-compose logs --since=10m

# Combine multiple services
docker-compose logs -f backend frontend
```

## Checking Services

```bash
# List all running services
docker-compose ps

# Show service details
docker-compose ps --services

# Check health status
docker-compose ps --format "table {{.Service}}\t{{.Status}}"

# Get service port mappings
docker-compose port backend 8000
docker-compose port frontend 3000
docker-compose port db 5432
```

## Running Commands in Services

```bash
# Interactive bash in backend
docker exec -it aido-backend /bin/bash

# Interactive shell in frontend
docker exec -it aido-frontend /bin/sh

# Interactive psql in database
docker exec -it aido-db psql -U postgres -d aido_dev

# Run one-off commands
docker exec aido-backend python -m pip list
docker exec aido-frontend npm list

# Python REPL in backend
docker exec -it aido-backend python

# Node REPL in frontend
docker exec -it aido-frontend node
```

## Database Operations

```bash
# Connect to database
docker exec -it aido-db psql -U postgres -d aido_dev

# List tables
docker exec -it aido-db psql -U postgres -d aido_dev -c "\dt"

# Run SQL query
docker exec -it aido-db psql -U postgres -d aido_dev -c "SELECT * FROM users;"

# Export database
docker exec aido-db pg_dump -U postgres -d aido_dev > backup.sql

# Restore database
docker exec -i aido-db psql -U postgres -d aido_dev < backup.sql

# Get database stats
docker exec -it aido-db psql -U postgres -d aido_dev -c "\l"
```

## Testing Connectivity

```bash
# Test backend health
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000

# Get API docs
curl http://localhost:8000/openapi.json

# Test database connection from backend
docker exec -it aido-backend python -c "from src.db.session import engine; print(engine.connect())"

# Check all service ports
netstat -an | grep LISTEN | grep -E "3000|8000|5432"
```

## Rebuilding Images

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache backend

# Rebuild all services
docker-compose build

# Rebuild and restart
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

## Viewing Configuration

```bash
# Show docker-compose configuration
docker-compose config

# Validate docker-compose.yml
docker-compose config --quiet

# Show image details
docker image ls | grep aido

# Show volume details
docker volume ls | grep aido

# Show network details
docker network ls | grep aido
```

## Debugging

```bash
# Inspect container
docker inspect aido-backend
docker inspect aido-frontend
docker inspect aido-db

# View resource usage
docker stats

# View running processes in container
docker top aido-backend
docker top aido-frontend
docker top aido-db

# Check container events
docker events --filter container=aido-backend

# View environment variables in container
docker exec aido-backend env | grep DATABASE
docker exec aido-frontend env | grep NEXT_PUBLIC
```

## Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (be careful!)
docker system prune -a --volumes
```

## Building for Production

```bash
# Build backend image locally
docker build -t aido-backend:latest ./backend

# Build frontend image locally
docker build -t aido-frontend:latest ./frontend

# Tag for registry
docker tag aido-backend:latest ghcr.io/username/aido-backend:latest
docker tag aido-frontend:latest ghcr.io/username/aido-frontend:latest

# Push to registry
docker push ghcr.io/username/aido-backend:latest
docker push ghcr.io/username/aido-frontend:latest
```

## Environment Variables

```bash
# View variables in running container
docker exec aido-backend env

# Set variables at runtime
docker-compose -e DATABASE_URL=... up -d backend

# Check specific variable
docker exec aido-backend printenv DATABASE_URL
docker exec aido-frontend printenv NEXT_PUBLIC_API_URL
```

## Performance & Monitoring

```bash
# Check CPU/memory usage
docker stats aido-backend aido-frontend aido-db

# View disk usage
docker system df

# Check logs size
du -sh /var/lib/docker/containers/*/

# Monitor in real-time
watch docker stats
```

## Troubleshooting Common Issues

```bash
# Service won't start - check logs
docker-compose logs backend
docker-compose logs frontend

# Port already in use
lsof -i :8000
lsof -i :3000
lsof -i :5432

# Kill process using port
kill -9 $(lsof -t -i :8000)

# Disk space issues
docker system df
docker system prune -a

# Memory issues
docker stats
docker update --memory=2g aido-backend

# Network issues
docker network inspect aido-network
docker exec aido-backend ping aido-db
```

## Development Workflow

```bash
# 1. Make code changes
# 2. Services auto-reload (backend: uvicorn, frontend: next dev)
# 3. Test changes
curl http://localhost:8000/health

# 4. If need to reset database
docker-compose down -v
docker-compose up -d

# 5. If need to rebuild image after changing dependencies
docker-compose build --no-cache backend
docker-compose up -d backend

# 6. View what changed in logs
docker-compose logs --tail=50 -f
```

## Best Practices

1. **Always use health checks**: Services have built-in health checks
2. **Use volumes for data**: Data in aido-db-volume persists across restarts
3. **Don't edit containers**: Make changes to code/config files, not inside containers
4. **Use docker-compose down**: Proper cleanup prevents port conflicts
5. **Check logs first**: Logs usually contain error details
6. **Rebuild after dependency changes**: Update requirements.txt/package.json? Rebuild images
7. **Use environment variables**: Don't hardcode secrets, use .env files
8. **Monitor resources**: Check docker stats if services slow down

## Common Scenarios

### Fresh start
```bash
docker-compose down -v
docker-compose up -d
docker-compose logs -f
```

### Deploy new code
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f
```

### Database reset
```bash
docker-compose down -v
docker-compose up -d db
docker-compose up -d
```

### Check if everything is working
```bash
docker-compose ps
curl http://localhost:8000/health
curl http://localhost:3000
```

### Debug backend issue
```bash
docker-compose logs backend
docker exec -it aido-backend /bin/bash
# Inside container:
python -c "from src.db.session import engine; print(engine.url)"
```

### Debug frontend issue
```bash
docker-compose logs frontend
docker exec -it aido-frontend /bin/sh
# Inside container:
npm list
node -v
```

### Debug database issue
```bash
docker-compose logs db
docker exec -it aido-db psql -U postgres -d aido_dev
# Inside database:
\dt
SELECT version();
```
