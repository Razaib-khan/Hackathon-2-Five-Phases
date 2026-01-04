"""
API Integration Tests

Tests for core API endpoints:
- Authentication
- Task CRUD operations
- Tag management
- Analytics
- Export
- Search
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from src.main import app
from src.models.user import User
from src.models.task import Task
from src.models.tag import Tag

client = TestClient(app)


@pytest.fixture
def test_user():
    """Create a test user and return auth token"""
    # Register user
    response = client.post(
        "/api/auth/register",
        json={
            "email": f"test_{datetime.now().timestamp()}@example.com",
            "password": "TestPassword123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]


@pytest.fixture
def test_task(test_user):
    """Create a test task"""
    response = client.post(
        "/api/tasks",
        headers={"Authorization": f"Bearer {test_user}"},
        json={
            "title": "Test Task",
            "description": "Test Description",
            "priority": "high",
            "status": "todo",
            "due_date": (datetime.now() + timedelta(days=1)).isoformat(),
        },
    )
    assert response.status_code == 200
    return response.json()


class TestAuthentication:
    """Test authentication endpoints"""

    def test_register_success(self):
        """Test successful user registration"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": f"newuser_{datetime.now().timestamp()}@example.com",
                "password": "SecurePass123!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email(self, test_user):
        """Test registration with duplicate email fails"""
        # Try to register with same email
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "AnotherPass123!",
            },
        )
        assert response.status_code == 400

    def test_login_success(self):
        """Test successful login"""
        # Register first
        email = f"logintest_{datetime.now().timestamp()}@example.com"
        password = "LoginTest123!"
        client.post(
            "/api/auth/register",
            json={"email": email, "password": password},
        )

        # Now login
        response = client.post(
            "/api/auth/login",
            data={"username": email, "password": password},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials fails"""
        response = client.post(
            "/api/auth/login",
            data={"username": "invalid@example.com", "password": "wrongpass"},
        )
        assert response.status_code == 401


class TestTaskCRUD:
    """Test task CRUD operations"""

    def test_create_task(self, test_user):
        """Test creating a task"""
        response = client.post(
            "/api/tasks",
            headers={"Authorization": f"Bearer {test_user}"},
            json={
                "title": "New Task",
                "description": "Task description",
                "priority": "medium",
                "status": "todo",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Task"
        assert data["priority"] == "medium"

    def test_get_tasks(self, test_user, test_task):
        """Test retrieving tasks"""
        response = client.get(
            "/api/tasks",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_get_task_by_id(self, test_user, test_task):
        """Test retrieving a specific task"""
        task_id = test_task["id"]
        response = client.get(
            f"/api/tasks/{task_id}",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == test_task["title"]

    def test_update_task(self, test_user, test_task):
        """Test updating a task"""
        task_id = test_task["id"]
        response = client.put(
            f"/api/tasks/{task_id}",
            headers={"Authorization": f"Bearer {test_user}"},
            json={
                "title": "Updated Task Title",
                "priority": "low",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Task Title"
        assert data["priority"] == "low"

    def test_delete_task(self, test_user, test_task):
        """Test deleting a task"""
        task_id = test_task["id"]
        response = client.delete(
            f"/api/tasks/{task_id}",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        assert response.status_code == 200

        # Verify task is deleted
        response = client.get(
            f"/api/tasks/{task_id}",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        assert response.status_code == 404

    def test_toggle_task_completion(self, test_user, test_task):
        """Test toggling task completion status"""
        task_id = test_task["id"]
        response = client.patch(
            f"/api/tasks/{task_id}/toggle",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"

        # Toggle again
        response = client.patch(
            f"/api/tasks/{task_id}/toggle",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "todo"


class TestTagManagement:
    """Test tag management endpoints"""

    def test_create_tag(self, test_user):
        """Test creating a tag"""
        response = client.post(
            "/api/tags",
            headers={"Authorization": f"Bearer {test_user}"},
            json={"name": "Work", "color": "#3b82f6"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Work"
        assert data["color"] == "#3b82f6"

    def test_get_tags(self, test_user):
        """Test retrieving all tags"""
        # Create a tag first
        client.post(
            "/api/tags",
            headers={"Authorization": f"Bearer {test_user}"},
            json={"name": "Personal", "color": "#10b981"},
        )

        response = client.get(
            "/api/tags",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_apply_tag_to_task(self, test_user, test_task):
        """Test applying a tag to a task"""
        # Create tag
        tag_response = client.post(
            "/api/tags",
            headers={"Authorization": f"Bearer {test_user}"},
            json={"name": "Urgent", "color": "#ef4444"},
        )
        tag_id = tag_response.json()["id"]

        # Apply to task
        task_id = test_task["id"]
        response = client.post(
            f"/api/tasks/{task_id}/tags/{tag_id}",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        assert response.status_code == 200

        # Verify tag is applied
        task_response = client.get(
            f"/api/tasks/{task_id}",
            headers={"Authorization": f"Bearer {test_user}"},
        )
        task_data = task_response.json()
        assert len(task_data["tags"]) == 1
        assert task_data["tags"][0]["name"] == "Urgent"


class TestAnalytics:
    """Test analytics endpoints"""

    def test_get_dashboard_stats(self, test_user, test_task):
        """Test retrieving dashboard statistics"""
        response = client.get(
            "/api/analytics/dashboard",
            headers={"Authorization": f"Bearer {test_user}"},
            params={"period": "all"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_tasks" in data
        assert "completed_tasks" in data
        assert "due_today" in data
        assert "overdue_tasks" in data

    def test_get_productivity_trends(self, test_user):
        """Test retrieving productivity trends"""
        response = client.get(
            "/api/analytics/productivity",
            headers={"Authorization": f"Bearer {test_user}"},
            params={"period": "week"},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestExport:
    """Test export endpoints"""

    def test_export_json(self, test_user, test_task):
        """Test exporting tasks as JSON"""
        response = client.get(
            "/api/export/tasks/json",
            headers={"Authorization": f"Bearer {test_user}"},
            params={"include_completed": True},
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        assert "attachment" in response.headers["content-disposition"]

    def test_export_csv(self, test_user, test_task):
        """Test exporting tasks as CSV"""
        response = client.get(
            "/api/export/tasks/csv",
            headers={"Authorization": f"Bearer {test_user}"},
            params={"include_completed": False},
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv"
        assert "attachment" in response.headers["content-disposition"]


class TestSearch:
    """Test search endpoints"""

    def test_basic_search(self, test_user, test_task):
        """Test basic full-text search"""
        response = client.get(
            "/api/search/tasks",
            headers={"Authorization": f"Bearer {test_user}"},
            params={"q": "Test"},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_search_with_highlighting(self, test_user, test_task):
        """Test search with result highlighting"""
        response = client.get(
            "/api/search/tasks/highlighted",
            headers={"Authorization": f"Bearer {test_user}"},
            params={"q": "Test"},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "headline" in data[0]
            assert "<mark>" in data[0]["headline"]


class TestRateLimiting:
    """Test rate limiting"""

    def test_rate_limit_exceeded(self, test_user):
        """Test that rate limiting works"""
        # Make many requests quickly
        for _ in range(150):  # Exceed 100/min limit
            response = client.get(
                "/api/tasks",
                headers={"Authorization": f"Bearer {test_user}"},
            )

        # Last request should be rate limited
        assert response.status_code == 429
        assert "rate limit exceeded" in response.json()["detail"].lower()


class TestValidation:
    """Test input validation"""

    def test_create_task_missing_title(self, test_user):
        """Test creating task without title fails"""
        response = client.post(
            "/api/tasks",
            headers={"Authorization": f"Bearer {test_user}"},
            json={"description": "No title"},
        )
        assert response.status_code == 422

    def test_create_task_invalid_priority(self, test_user):
        """Test creating task with invalid priority fails"""
        response = client.post(
            "/api/tasks",
            headers={"Authorization": f"Bearer {test_user}"},
            json={
                "title": "Task",
                "priority": "invalid_priority",
            },
        )
        assert response.status_code == 422

    def test_register_weak_password(self):
        """Test registration with weak password fails"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "weak",
            },
        )
        assert response.status_code == 422


class TestAuthorization:
    """Test authorization and access control"""

    def test_access_without_token(self):
        """Test accessing protected endpoint without token fails"""
        response = client.get("/api/tasks")
        assert response.status_code == 401

    def test_access_with_invalid_token(self):
        """Test accessing with invalid token fails"""
        response = client.get(
            "/api/tasks",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    def test_access_other_users_task(self, test_user, test_task):
        """Test that users cannot access other users' tasks"""
        # Create another user
        response = client.post(
            "/api/auth/register",
            json={
                "email": f"other_{datetime.now().timestamp()}@example.com",
                "password": "OtherPass123!",
            },
        )
        other_token = response.json()["access_token"]

        # Try to access first user's task
        task_id = test_task["id"]
        response = client.get(
            f"/api/tasks/{task_id}",
            headers={"Authorization": f"Bearer {other_token}"},
        )
        assert response.status_code == 404  # or 403
