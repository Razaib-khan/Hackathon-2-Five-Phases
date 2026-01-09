from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import auth_router, user_router
from src.api.task_router import router as task_router
from src.api.priority_router import router as priority_router
from src.api.filter_router import router as filter_router
from src.api.phase_router import router as phase_router
from src.api.notification_router import router as notification_router
from src.api.team_router import router as team_router
from src.api.submission_router import router as submission_router
from src.api.evaluation_router import router as evaluation_router
from src.api.gdpr_router import router as gdpr_router
from src.api.backup_router import router as backup_router
from src.api.optimization_router import router as optimization_router
from src.api.cache_router import router as cache_router
from src.api.admin_router import router as admin_router
from src.middleware.security import security_middleware_handler
from src.config.settings import settings
from src.config.logging import setup_logging

# Set up logging
setup_logging(log_level="INFO")

app = FastAPI(
    title="Five Phase Hackathon Platform API",
    description="API for managing hackathon lifecycle: Registration, Ideation, Development, Submission, and Presentation/Judging",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# Add security middleware first (this will be the outermost layer)
app.middleware("http")(security_middleware_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # expose_headers=["Access-Control-Allow-Origin"]
)

# Include routers
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(user_router.router, prefix="/api/v1/users", tags=["users"])
app.include_router(task_router, prefix="/api/v1", tags=["tasks"])
app.include_router(priority_router, prefix="/api/v1", tags=["priority"])
app.include_router(filter_router, prefix="/api/v1", tags=["filters"])
app.include_router(phase_router, prefix="/api/v1", tags=["hackathons", "phases"])
app.include_router(notification_router, prefix="/api/v1", tags=["notifications"])
app.include_router(team_router, prefix="/api/v1", tags=["teams"])
app.include_router(submission_router, prefix="/api/v1", tags=["submissions"])
app.include_router(evaluation_router, prefix="/api/v1", tags=["evaluations"])
app.include_router(gdpr_router, prefix="/api/v1", tags=["gdpr", "privacy"])
app.include_router(backup_router, prefix="/api/v1", tags=["backup", "retention"])
app.include_router(optimization_router, prefix="/api/v1", tags=["optimization", "performance"])
app.include_router(cache_router, prefix="/api/v1", tags=["cache", "performance"])
app.include_router(admin_router, prefix="/api/v1", tags=["admin"])

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "hackathon-platform-api"}

@app.get("/")
async def root():
    return {"message": "Welcome to the Five Phase Hackathon Platform API"}