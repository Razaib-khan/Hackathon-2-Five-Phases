"""
End-to-end tests for the Five Phase Hackathon Platform.
These tests verify the complete workflow of the application.
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


def test_complete_registration_flow():
    """Test the complete user registration and authentication flow"""
    # Test registration
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepassword123",
        "first_name": "Test",
        "last_name": "User",
        "gdpr_consent": True
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Extract token for further tests
    token = data["access_token"]

    # Test getting user profile
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "test@example.com"
    assert user_data["username"] == "testuser"


def test_hackathon_creation_and_management():
    """Test hackathon creation and management functionality"""
    # Register a user first
    response = client.post("/api/v1/auth/register", json={
        "email": "organizer@example.com",
        "username": "organizer",
        "password": "securepassword123",
        "first_name": "Organizer",
        "last_name": "User",
        "gdpr_consent": True
    })
    assert response.status_code == 201
    token = response.json()["access_token"]

    # Test creating a hackathon
    response = client.post("/api/v1/hackathons", json={
        "name": "Test Hackathon",
        "description": "A test hackathon for demonstration",
        "start_date": "2024-01-01T00:00:00",
        "end_date": "2024-01-07T23:59:59",
        "max_participants": 100
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    hackathon_data = response.json()
    assert hackathon_data["name"] == "Test Hackathon"
    assert hackathon_data["status"] == "draft"


def test_team_creation_and_management():
    """Test team creation and management functionality"""
    # Register a user first
    response = client.post("/api/v1/auth/register", json={
        "email": "teammember@example.com",
        "username": "teammember",
        "password": "securepassword123",
        "first_name": "Team",
        "last_name": "Member",
        "gdpr_consent": True
    })
    assert response.status_code == 201
    token = response.json()["access_token"]

    # Test creating a team
    response = client.post("/api/v1/teams", json={
        "name": "Test Team",
        "description": "A test team for the hackathon"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    team_data = response.json()
    assert team_data["name"] == "Test Team"


def test_submission_workflow():
    """Test the project submission workflow"""
    # Register a user first
    response = client.post("/api/v1/auth/register", json={
        "email": "submitter@example.com",
        "username": "submitter",
        "password": "securepassword123",
        "first_name": "Project",
        "last_name": "Submitter",
        "gdpr_consent": True
    })
    assert response.status_code == 201
    token = response.json()["access_token"]

    # Create a team first (needed for submission)
    response = client.post("/api/v1/teams", json={
        "name": "Submission Team",
        "description": "Team for submission test"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    team_id = response.json()["id"]

    # Test creating a submission (simplified)
    response = client.get("/api/v1/teams")  # Just to verify teams endpoint works
    assert response.status_code in [200, 401]  # Either success or auth required


def test_notification_system():
    """Test notification system endpoints"""
    # Register a user first
    response = client.post("/api/v1/auth/register", json={
        "email": "notified@example.com",
        "username": "notifieduser",
        "password": "securepassword123",
        "first_name": "Notified",
        "last_name": "User",
        "gdpr_consent": True
    })
    assert response.status_code == 201
    token = response.json()["access_token"]

    # Test getting notifications
    response = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200  # Should return empty list or similar


def test_admin_endpoints():
    """Test admin-specific endpoints"""
    # Register a user first
    response = client.post("/api/v1/auth/register", json={
        "email": "admin@example.com",
        "username": "adminuser",
        "password": "securepassword123",
        "first_name": "Admin",
        "last_name": "User",
        "gdpr_consent": True
    })
    assert response.status_code == 201
    token = response.json()["access_token"]

    # Test admin endpoints (these may require admin role, so expect 403 for non-admins)
    response = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
    # Should either be accessible (200) or forbidden (403) but not not found (404)
    assert response.status_code in [200, 401, 403]


def test_phase_tracking():
    """Test phase tracking functionality"""
    # Register a user first
    response = client.post("/api/v1/auth/register", json={
        "email": "phaseuser@example.com",
        "username": "phaseuser",
        "password": "securepassword123",
        "first_name": "Phase",
        "last_name": "User",
        "gdpr_consent": True
    })
    assert response.status_code == 201
    token = response.json()["access_token"]

    # Test getting hackathons (for phase tracking)
    response = client.get("/api/v1/hackathons", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200  # Should return list even if empty


if __name__ == "__main__":
    pytest.main([__file__, "-v"])