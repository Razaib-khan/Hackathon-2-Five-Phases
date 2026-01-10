# Data Model for AIDO Todo Application

## User Entity
- **Fields**:
  - `id` (UUID/Integer): Unique identifier for the user
  - `first_name` (String): User's first name (required)
  - `last_name` (String): User's last name (required)
  - `email` (String): User's email address (required, unique)
  - `password_hash` (String): Hashed password (required)
  - `created_at` (DateTime): Timestamp when user was created
  - `updated_at` (DateTime): Timestamp when user was last updated

- **Validation Rules**:
  - Email must be unique across all users
  - Email must follow standard email format
  - First name and last name must not be empty
  - Password must meet security requirements

- **Relationships**:
  - One-to-many with Task entity (one user can have many tasks)

## Task Entity
- **Fields**:
  - `id` (UUID/Integer): Unique identifier for the task
  - `title` (String): Task title (required)
  - `description` (Text): Optional task description
  - `priority` (String): Task priority level (required, values: "High", "Medium", "Low")
  - `user_id` (UUID/Integer): Foreign key linking to the owning user (required)
  - `created_at` (DateTime): Timestamp when task was created
  - `updated_at` (DateTime): Timestamp when task was last updated

- **Validation Rules**:
  - Title is required and cannot be empty
  - Priority must be one of: "High", "Medium", "Low"
  - User_id must reference an existing user
  - Task can only be accessed by the owning user

- **Relationships**:
  - Many-to-one with User entity (many tasks belong to one user)

## Session Entity
- **Fields**:
  - `id` (String): Session identifier (required)
  - `user_id` (UUID/Integer): Foreign key linking to the user (required)
  - `expires_at` (DateTime): Timestamp when session expires (required)
  - `created_at` (DateTime): Timestamp when session was created

- **Validation Rules**:
  - Session must be linked to an existing user
  - Session must expire after 7 days of inactivity
  - Expired sessions should be cleaned up

- **Relationships**:
  - Many-to-one with User entity (many sessions can belong to one user)

## PasswordResetToken Entity
- **Fields**:
  - `id` (UUID/Integer): Unique identifier for the token
  - `user_id` (UUID/Integer): Foreign key linking to the user (required)
  - `token` (String): The reset token (required, unique)
  - `expires_at` (DateTime): Timestamp when token expires (required)
  - `used` (Boolean): Whether the token has been used (default: false)
  - `created_at` (DateTime): Timestamp when token was created

- **Validation Rules**:
  - Token must be unique
  - Token must expire after 10 minutes
  - Token can only be used once
  - Token must be linked to an existing user

- **Relationships**:
  - Many-to-one with User entity (many reset tokens can belong to one user)