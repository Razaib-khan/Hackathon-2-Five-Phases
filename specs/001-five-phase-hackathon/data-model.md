# Data Model: AIDO - Advanced Interactive Dashboard Organizer

## Core Entities

### User
- **id**: UUID (Primary Key)
- **email**: String (Unique, Required)
- **username**: String (Unique, Required)
- **first_name**: String (Required)
- **last_name**: String (Required)
- **password_hash**: String (Required)
- **role**: String (Default: participant, enum: participant, judge, admin)
- **is_active**: Boolean (Default: true)
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated, on-update)
- **last_login**: DateTime (Optional)
- **profile_image_url**: String (Optional)
- **bio**: Text (Optional)
- **email_confirmed**: Boolean (Default: false)
- **confirmation_token**: String (Optional, for email verification)
- **confirmed_at**: DateTime (Optional, when email was confirmed)

### Task
- **id**: UUID (Primary Key)
- **title**: String (Required, 1-200 characters)
- **description**: Text (Optional, up to 5000 characters)
- **priority**: String (Required, enum: critical, high, medium, low)
- **status**: String (Default: pending, enum: pending, in_progress, completed, cancelled)
- **assigned_to**: UUID (Foreign Key to User, Optional)
- **created_by**: UUID (Foreign Key to User, Required)
- **due_date**: DateTime (Optional)
- **completed_at**: DateTime (Optional)
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated, on-update)
- **is_public**: Boolean (Default: false, for sharing tasks)

### TaskTag
- **id**: UUID (Primary Key)
- **name**: String (Required, unique)
- **color**: String (Optional, hex color code)
- **created_by**: UUID (Foreign Key to User)
- **created_at**: DateTime (Auto-generated)

### TaskTagAssociation
- **id**: UUID (Primary Key)
- **task_id**: UUID (Foreign Key to Task)
- **tag_id**: UUID (Foreign Key to TaskTag)
- **assigned_at**: DateTime (Auto-generated)

### Team
- **id**: UUID (Primary Key)
- **name**: String (Required, 1-100 characters)
- **description**: Text (Optional)
- **created_by**: UUID (Foreign Key to User, team creator)
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated, on-update)
- **is_active**: Boolean (Default: true)

### TeamMember
- **id**: UUID (Primary Key)
- **team_id**: UUID (Foreign Key to Team)
- **user_id**: UUID (Foreign Key to User)
- **role**: String (Default: member, enum: member, admin, owner)
- **joined_at**: DateTime (Auto-generated)
- **is_active**: Boolean (Default: true)

### TeamInvitation
- **id**: UUID (Primary Key)
- **team_id**: UUID (Foreign Key to Team)
- **invited_by**: UUID (Foreign Key to User, who sent invitation)
- **email**: String (Required, email of invitee)
- **status**: String (Default: pending, enum: pending, accepted, declined, expired)
- **expires_at**: DateTime (Required, when invitation expires)
- **created_at**: DateTime (Auto-generated)

### Submission (Project Submission)
- **id**: UUID (Primary Key)
- **team_id**: UUID (Foreign Key to Team)
- **title**: String (Required, project name)
- **description**: Text (Required, project description)
- **repository_url**: String (Optional, link to code repository)
- **demo_url**: String (Optional, link to live demo)
- **presentation_url**: String (Optional, link to presentation)
- **submitted_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated, on-update)
- **status**: String (Default: submitted, enum: submitted, under_review, accepted, rejected)
- **submitted_by**: UUID (Foreign Key to User, who submitted)

### SubmissionFile
- **id**: UUID (Primary Key)
- **submission_id**: UUID (Foreign Key to Submission)
- **filename**: String (Required)
- **file_path**: String (Required, path in storage)
- **file_size**: Integer (Required, in bytes)
- **mime_type**: String (Required)
- **uploaded_at**: DateTime (Auto-generated)
- **uploaded_by**: UUID (Foreign Key to User)

### Evaluation (Project Evaluation/Judging)
- **id**: UUID (Primary Key)
- **submission_id**: UUID (Foreign Key to Submission)
- **evaluator_id**: UUID (Foreign Key to User, must be judge/admin role)
- **scores**: JSON (Object with criteria as keys and scores as values)
- **total_score**: Decimal (Computed from scores)
- **feedback**: Text (Optional, judge comments)
- **evaluated_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated, on-update)
- **status**: String (Default: pending, enum: pending, in_progress, completed)

### Notification
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to User, recipient)
- **title**: String (Required)
- **message**: Text (Required)
- **notification_type**: String (Required, enum: task_assigned, deadline_reminder, phase_change, team_invite, submission_update, system_announcement)
- **is_read**: Boolean (Default: false)
- **related_entity_type**: String (Optional, type of related entity)
- **related_entity_id**: UUID (Optional, ID of related entity)
- **sent_at**: DateTime (Auto-generated)
- **read_at**: DateTime (Optional)

### UserNotificationPreferences
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to User, unique)
- **email_notifications**: Boolean (Default: true)
- **push_notifications**: Boolean (Default: true)
- **task_assigned_notifications**: Boolean (Default: true)
- **deadline_reminders**: Boolean (Default: true)
- **team_invites**: Boolean (Default: true)
- **system_announcements**: Boolean (Default: true)
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated, on-update)

### VerificationCode
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to User)
- **code**: String (Required, 6-digit verification code)
- **code_type**: String (Required, enum: email_verification, password_reset)
- **expires_at**: DateTime (Required, when code expires)
- **used_at**: DateTime (Optional, when code was used)
- **created_at**: DateTime (Auto-generated)

### AuditLog
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to User, optional for system events)
- **action**: String (Required, what action was performed)
- **entity_type**: String (Required, what type of entity was affected)
- **entity_id**: String (Required, ID of the entity affected)
- **old_values**: JSON (Optional, previous state of the entity)
- **new_values**: JSON (Optional, new state of the entity)
- **ip_address**: String (Optional)
- **user_agent**: String (Optional)
- **timestamp**: DateTime (Auto-generated)

## Relationships

### User Relationships
- One-to-Many: User → Task (user creates tasks)
- One-to-Many: User → Team (user creates teams)
- One-to-Many: User → TeamMember (user joins multiple teams)
- One-to-Many: User → Notification (user receives notifications)
- One-to-Many: User → Evaluation (user evaluates submissions as judge)
- One-to-Many: User → VerificationCode (user has verification codes)
- One-to-One: User → UserNotificationPreferences (user preferences)

### Task Relationships
- One-to-Many: Task → TaskTagAssociation (task can have multiple tags)
- Many-to-One: Task → User (created_by and assigned_to relationships)

### Team Relationships
- One-to-Many: Team → TeamMember (team has multiple members)
- One-to-Many: Team → TeamInvitation (team sends multiple invitations)
- One-to-Many: Team → Submission (team makes multiple submissions)
- Many-to-One: Team → User (created_by relationship)

### Submission Relationships
- One-to-Many: Submission → SubmissionFile (submission can have multiple files)
- One-to-Many: Submission → Evaluation (multiple evaluations possible)
- Many-to-One: Submission → Team (submitted by team)
- Many-to-One: Submission → User (submitted_by relationship)

## Indexes for Performance

### User Table
- Index on (email) - for authentication
- Index on (username) - for lookups
- Index on (role) - for role-based queries
- Index on (email_confirmed) - for verification status queries

### Task Table
- Index on (created_by) - for user's tasks
- Index on (assigned_to) - for assigned tasks
- Index on (priority) - for priority-based queries
- Index on (status) - for status filtering
- Index on (due_date) - for deadline queries
- Index on (created_at) - for chronological queries

### Team Table
- Index on (created_by) - for user's teams
- Index on (is_active) - for active team queries

### TeamMember Table
- Index on (team_id) - for team member queries
- Index on (user_id) - for user's team membership
- Unique index on (team_id, user_id) - to prevent duplicate membership

### Submission Table
- Index on (team_id) - for team submissions
- Index on (submitted_at) - for chronological queries
- Index on (status) - for status filtering
- Index on (submitted_by) - for user's submissions

### Evaluation Table
- Index on (submission_id) - for submission evaluations
- Index on (evaluator_id) - for evaluator's evaluations
- Index on (total_score) - for scoring queries

### Notification Table
- Index on (user_id) - for user notifications
- Index on (is_read) - for unread notifications
- Index on (notification_type) - for type-based queries
- Index on (sent_at) - for chronological queries

### VerificationCode Table
- Index on (user_id) - for user's codes
- Index on (code) - for code verification
- Index on (expires_at) - for expired code cleanup
- Index on (code_type) - for code type queries

## Validation Rules

### User
- Email must be valid email format
- Username must be 3-30 characters, alphanumeric + underscore/hyphen
- First name and last name are required
- Password must meet security requirements (min 8 chars, mixed case, number, special char)
- Role must be one of allowed values
- Confirmation token is required when email_confirmed is false

### Task
- Title must be 1-200 characters
- Description must be up to 5000 characters if provided
- Priority must be one of allowed values (critical, high, medium, low)
- Status must be one of allowed values
- Due date must be in the future if provided
- Assigned user must exist if assigned_to is provided

### Team
- Name must be 1-100 characters
- Creator must be a valid user
- Team member count should not exceed reasonable limits

### Submission
- Title must be 3-200 characters
- Description must be 10-5000 characters
- URLs must be valid if provided
- Submitted by user must be a member of the submitting team

### VerificationCode
- Code must be 6 digits
- Expires_at must be in the future
- Code can only be used once
- Code type must be one of allowed values