from fastapi import HTTPException, status
from typing import Optional


class AidoException(HTTPException):
    """Base exception class for AIDO application"""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(status_code=status_code, detail=detail)


class UserNotFoundException(AidoException):
    """Raised when a user is not found"""
    def __init__(self, detail: str = "User not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)


class UserAlreadyExistsException(AidoException):
    """Raised when attempting to create a user that already exists"""
    def __init__(self, detail: str = "User already exists"):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT)


class InvalidCredentialsException(AidoException):
    """Raised when invalid credentials are provided"""
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)


class InsufficientPermissionsException(AidoException):
    """Raised when user doesn't have sufficient permissions"""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)


class TaskNotFoundException(AidoException):
    """Raised when a task is not found"""
    def __init__(self, detail: str = "Task not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)


class PasswordResetTokenExpiredException(AidoException):
    """Raised when a password reset token has expired"""
    def __init__(self, detail: str = "Password reset token has expired"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)


class PasswordResetTokenUsedException(AidoException):
    """Raised when a password reset token has already been used"""
    def __init__(self, detail: str = "Password reset token has already been used"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)


class EmailServiceException(AidoException):
    """Raised when there's an issue with the email service"""
    def __init__(self, detail: str = "Email service error"):
        super().__init__(detail=detail, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)