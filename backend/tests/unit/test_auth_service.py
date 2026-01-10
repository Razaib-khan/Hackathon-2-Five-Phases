import pytest
from unittest.mock import Mock, MagicMock
from sqlmodel import Session, select
from backend.src.models.user import User
from backend.src.services.auth_service import UserService
from backend.src.utils.errors import UserAlreadyExistsException
from uuid import UUID, uuid4
from datetime import datetime
from backend.src.auth.auth_handler import auth_handler


class TestUserService:
    def setup_method(self):
        """Setup method to initialize mock session for each test"""
        self.session = Mock(spec=Session)

    def test_create_user_success(self):
        """Test successful user creation"""
        # Arrange
        first_name = "John"
        last_name = "Doe"
        email = "john.doe@example.com"
        password = "securepassword"

        # Mock the query result to return None (user doesn't exist)
        mock_exec_result = Mock()
        mock_exec_result.first.return_value = None
        self.session.exec.return_value = mock_exec_result

        # Act
        result = UserService.create_user(
            session=self.session,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password
        )

        # Assert
        assert isinstance(result, User)
        assert result.first_name == first_name
        assert result.last_name == last_name
        assert result.email == email
        assert hasattr(result, 'password_hash')
        assert result.password_hash is not None

        # Verify that session methods were called appropriately
        self.session.add.assert_called_once()
        self.session.commit.assert_called_once()
        self.session.refresh.assert_called_once()

    def test_create_user_already_exists(self):
        """Test that creating a user with existing email raises an exception"""
        # Arrange
        existing_user = User(
            id=uuid4(),
            first_name="Existing",
            last_name="User",
            email="existing@example.com",
            password_hash="hashed_password"
        )

        mock_exec_result = Mock()
        mock_exec_result.first.return_value = existing_user
        self.session.exec.return_value = mock_exec_result

        # Act & Assert
        with pytest.raises(UserAlreadyExistsException):
            UserService.create_user(
                session=self.session,
                first_name="New",
                last_name="User",
                email="existing@example.com",
                password="password"
            )

    def test_authenticate_user_success(self):
        """Test successful user authentication"""
        # Arrange
        email = "test@example.com"
        password = "validpassword"
        hashed_password = auth_handler.get_password_hash(password)

        user = User(
            id=uuid4(),
            first_name="Test",
            last_name="User",
            email=email,
            password_hash=hashed_password
        )

        mock_exec_result = Mock()
        mock_exec_result.first.return_value = user
        self.session.exec.return_value = mock_exec_result

        # Act
        result = UserService.authenticate_user(
            session=self.session,
            email=email,
            password=password
        )

        # Assert
        assert result is not None
        assert result.id == user.id
        assert result.email == email

        # Verify that last_login was updated
        self.session.add.assert_called_once()
        self.session.commit.assert_called_once()

    def test_authenticate_user_invalid_password(self):
        """Test authentication with invalid password"""
        # Arrange
        email = "test@example.com"
        password = "validpassword"
        wrong_password = "wrongpassword"
        hashed_password = auth_handler.get_password_hash(password)

        user = User(
            id=uuid4(),
            first_name="Test",
            last_name="User",
            email=email,
            password_hash=hashed_password
        )

        mock_exec_result = Mock()
        mock_exec_result.first.return_value = user
        self.session.exec.return_value = mock_exec_result

        # Act
        result = UserService.authenticate_user(
            session=self.session,
            email=email,
            password=wrong_password
        )

        # Assert
        assert result is None

    def test_get_user_by_id_found(self):
        """Test getting a user by ID when user exists"""
        # Arrange
        user_id = uuid4()
        expected_user = User(
            id=user_id,
            first_name="Test",
            last_name="User",
            email="test@example.com",
            password_hash="hashed"
        )

        mock_exec_result = Mock()
        mock_exec_result.first.return_value = expected_user
        self.session.exec.return_value = mock_exec_result

        # Act
        result = UserService.get_user_by_id(
            session=self.session,
            user_id=user_id
        )

        # Assert
        assert result == expected_user

    def test_get_user_by_id_not_found(self):
        """Test getting a user by ID when user doesn't exist"""
        # Arrange
        user_id = uuid4()

        mock_exec_result = Mock()
        mock_exec_result.first.return_value = None
        self.session.exec.return_value = mock_exec_result

        # Act
        result = UserService.get_user_by_id(
            session=self.session,
            user_id=user_id
        )

        # Assert
        assert result is None