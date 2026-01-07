# Data Model: AIDO Missing Features

**Feature**: 001-specify-missing-features
**Date**: 2026-01-07
**Status**: Draft

## Overview

This document defines the data model for the missing features in the AIDO project, including the Web API layer, dashboard access control, and task creation functionality. The model uses SQLModel for compatibility with the specified backend stack.

## Entity Definitions

### User
**Description**: Represents a system user with authentication credentials, roles, and permissions

**Fields**:
- `id` (int, primary_key, autoincrement): Unique identifier for the user
- `username` (str, unique, max_length=50): User's unique username
- `email` (str, unique, max_length=100): User's email address
- `hashed_password` (str, max_length=255): Hashed password for authentication
- `first_name` (str, max_length=50, nullable): User's first name
- `last_name` (str, max_length=50, nullable): User's last name
- `is_active` (bool, default=True): Whether the user account is active
- `is_verified` (bool, default=False): Whether the user has verified their account
- `created_at` (datetime): Timestamp when the user was created
- `updated_at` (datetime): Timestamp when the user was last updated

**Relationships**:
- `tasks` (one-to-many): User has many tasks
- `projects` (one-to-many): User has many projects
- `roles` (many-to-many): User has many roles through user_roles table

**Validation Rules**:
- Username and email must be unique
- Email must be a valid email format
- Username must be 3-50 characters
- Email must be 5-100 characters

### Task
**Description**: Represents a work item with title, priority, description, status, and ownership information

**Fields**:
- `id` (int, primary_key, autoincrement): Unique identifier for the task
- `title` (str, max_length=200): Title of the task (required)
- `description` (str, max_length=1000, nullable): Detailed description of the task
- `priority` (str, max_length=20, default="medium"): Priority level (low, medium, high, urgent)
- `status` (str, max_length=20, default="todo"): Current status (todo, in_progress, done, blocked)
- `created_by` (int, foreign_key): ID of the user who created the task
- `assigned_to` (int, foreign_key, nullable): ID of the user assigned to the task
- `project_id` (int, foreign_key, nullable): ID of the project this task belongs to
- `due_date` (datetime, nullable): When the task is due
- `created_at` (datetime): Timestamp when the task was created
- `updated_at` (datetime): Timestamp when the task was last updated

**Relationships**:
- `creator` (many-to-one): User who created the task
- `assignee` (many-to-one): User assigned to the task
- `project` (many-to-one): Project this task belongs to

**Validation Rules**:
- Title is required and must be 1-200 characters
- Priority must be one of: "low", "medium", "high", "urgent"
- Status must be one of: "todo", "in_progress", "done", "blocked"
- Due date must be in the future if provided

### Project
**Description**: Represents a collection of tasks with metadata and access controls

**Fields**:
- `id` (int, primary_key, autoincrement): Unique identifier for the project
- `name` (str, max_length=100): Name of the project
- `description` (str, max_length=500, nullable): Description of the project
- `owner_id` (int, foreign_key): ID of the user who owns the project
- `is_active` (bool, default=True): Whether the project is active
- `created_at` (datetime): Timestamp when the project was created
- `updated_at` (datetime): Timestamp when the project was last updated

**Relationships**:
- `owner` (many-to-one): User who owns the project
- `tasks` (one-to-many): Project has many tasks

**Validation Rules**:
- Name is required and must be 1-100 characters
- Owner ID is required

### Role
**Description**: Represents a set of permissions that can be assigned to users

**Fields**:
- `id` (int, primary_key, autoincrement): Unique identifier for the role
- `name` (str, unique, max_length=50): Name of the role (e.g., "admin", "user", "viewer")
- `description` (str, max_length=200, nullable): Description of the role
- `is_active` (bool, default=True): Whether the role is active
- `created_at` (datetime): Timestamp when the role was created
- `updated_at` (datetime): Timestamp when the role was last updated

**Relationships**:
- `users` (many-to-many): Role has many users through user_roles table
- `permissions` (many-to-many): Role has many permissions through role_permissions table

**Validation Rules**:
- Name must be unique and 1-50 characters

### Permission
**Description**: Represents a specific access right or capability within the system

**Fields**:
- `id` (int, primary_key, autoincrement): Unique identifier for the permission
- `name` (str, unique, max_length=50): Name of the permission (e.g., "read:tasks", "create:projects")
- `description` (str, max_length=200, nullable): Description of the permission
- `resource` (str, max_length=50): Resource the permission applies to (e.g., "task", "project")
- `action` (str, max_length=20): Action the permission allows (e.g., "read", "create", "update", "delete")
- `created_at` (datetime): Timestamp when the permission was created
- `updated_at` (datetime): Timestamp when the permission was last updated

**Relationships**:
- `roles` (many-to-many): Permission is assigned to many roles through role_permissions table

**Validation Rules**:
- Name must be unique and 1-50 characters
- Resource and action combination should be unique

## Relationship Mappings

### User-Roles (Many-to-Many)
**Table**: `user_roles`
- `user_id` (int, foreign_key): Reference to User
- `role_id` (int, foreign_key): Reference to Role
- `assigned_at` (datetime): When the role was assigned

### Role-Permissions (Many-to-Many)
**Table**: `role_permissions`
- `role_id` (int, foreign_key): Reference to Role
- `permission_id` (int, foreign_key): Reference to Permission
- `assigned_at` (datetime): When the permission was assigned

## Indexes

### User Table
- Index on `username` (unique)
- Index on `email` (unique)
- Index on `is_active`

### Task Table
- Index on `created_by`
- Index on `assigned_to`
- Index on `project_id`
- Index on `status`
- Index on `priority`
- Index on `created_at`

### Project Table
- Index on `owner_id`
- Index on `is_active`

### Role Table
- Index on `name` (unique)

### Permission Table
- Index on `name` (unique)

## State Transitions

### Task Status Transitions
- `todo` → `in_progress`: When user starts working on the task
- `in_progress` → `done`: When user completes the task
- `in_progress` → `blocked`: When task is blocked by external factors
- `blocked` → `in_progress`: When blocking issue is resolved
- `done` → `in_progress`: When task needs further work
- `todo` → `blocked`: When task is blocked before starting

### User Account States
- `active` ↔ `inactive`: Admin can activate/deactivate accounts
- `verified` ↔ `unverified`: Based on email verification status

## Data Integrity Constraints

1. **Referential Integrity**: Foreign key constraints ensure related records exist
2. **Unique Constraints**: Username and email uniqueness enforced
3. **Check Constraints**:
   - Task priority must be in allowed values
   - Task status must be in allowed values
   - User active status is boolean
4. **Not Null Constraints**: Required fields enforced at database level
5. **Length Constraints**: Field lengths enforced to prevent overflow

## Migration Strategy

### Existing Schema Compatibility
- New tables will be added without affecting existing schema
- No destructive changes to existing data
- Migration scripts will be idempotent
- Rollback scripts will be provided for each migration

### Schema Evolution
- New columns will use appropriate defaults to maintain backward compatibility
- Indexes will be created concurrently to avoid table locking
- Foreign key constraints will be added with proper validation