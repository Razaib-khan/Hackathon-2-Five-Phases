"""
Basic tests to validate the core functionality of the Five Phase Hackathon Platform.
These tests verify that the main components are working as expected.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.main import app
from src.config.database import Base, get_db
from src.models.user import User
from src.models.hackathon import Hackathon, Phase
from src.models.team import Team
from src.models.submission import Submission


# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_health_endpoint():
    """Test the health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "hackathon-platform-api"}


def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_authentication_routes_exist():
    """Test that authentication routes exist"""
    # Test registration route exists (will return 422 for missing data, not 404)
    response = client.post("/api/v1/auth/register")
    assert response.status_code in [422, 400]  # Unprocessable entity or bad request due to missing data, but route exists

    # Test login route exists
    response = client.post("/api/v1/auth/login")
    assert response.status_code in [422, 400]  # Unprocessable entity or bad request due to missing data, but route exists


def test_hackathon_routes_exist():
    """Test that hackathon routes exist"""
    response = client.get("/api/v1/hackathons")
    assert response.status_code == 200  # Should return empty list, not 404


def test_team_routes_exist():
    """Test that team routes exist"""
    response = client.get("/api/v1/teams")
    assert response.status_code in [200, 401]  # Should be accessible or require auth, but not 404


def test_submission_routes_exist():
    """Test that submission routes exist"""
    response = client.get("/api/v1/submissions")
    assert response.status_code in [200, 401]  # Should be accessible or require auth, but not 404


def test_notification_routes_exist():
    """Test that notification routes exist"""
    response = client.get("/api/v1/notifications")
    assert response.status_code in [200, 401]  # Should be accessible or require auth, but not 404


def test_admin_routes_exist():
    """Test that admin routes exist"""
    response = client.get("/api/v1/admin/users")
    assert response.status_code in [200, 401, 403]  # Should be accessible, require auth, or require admin, but not 404


if __name__ == "__main__":
    pytest.main([__file__])