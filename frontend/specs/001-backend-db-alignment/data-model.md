# Data Model: Backend and Database Schema Alignment

## Entity: User
- **Table Name**: `users`
- **Fields**:
  - `id` (UUID, Primary Key, Not Null) - Unique identifier
  - `email` (VARCHAR(255), Unique, Not Null) - User's email address
  - `password_hash` (VARCHAR(255), Not Null) - Hashed password
  - `created_at` (TIMESTAMPTZ, Not Null) - Account creation timestamp
  - `updated_at` (TIMESTAMPTZ, Not Null) - Last update timestamp
  - `is_active` (BOOLEAN, Default: true) - Account status
- **Validation**:
  - Email format validation
  - Password strength requirements
- **Relationships**:
  - One-to-many with `tasks` (foreign key: user_id)
  - One-to-many with `tags` (foreign key: user_id)

## Entity: Task
- **Table Name**: `tasks`
- **Fields**:
  - `id` (UUID, Primary Key, Not Null) - Unique identifier
  - `user_id` (UUID, Foreign Key, Not Null) - Owner of the task
  - `title` (VARCHAR(200), Not Null) - Task title
  - `description` (TEXT) - Task description
  - `completed` (BOOLEAN, Default: false) - Completion status
  - `priority` (VARCHAR(10), Check: IN('high', 'medium', 'low', 'none'), Default: 'none') - Task priority
  - `due_date` (TIMESTAMPTZ) - Due date for the task
  - `created_at` (TIMESTAMPTZ, Not Null) - Creation timestamp
  - `updated_at` (TIMESTAMPTZ, Not Null) - Last update timestamp
  - `completed_at` (TIMESTAMPTZ) - Completion timestamp
  - `estimated_time` (INTEGER) - Estimated time in minutes
  - `category` (VARCHAR(50)) - Task category
  - `position` (INTEGER) - Ordering position
  - `reminder_time` (TIMESTAMPTZ) - Reminder time
  - `time_spent` (INTEGER, Default: 0) - Time spent in minutes
  - `status` (VARCHAR(20), Check: IN('todo', 'in_progress', 'done'), Default: 'todo') - Task status
- **Validation**:
  - Title length (1-200 characters)
  - Valid priority values
  - Valid status values
- **Relationships**:
  - Belongs to `users` (foreign key: user_id)
  - One-to-many with `subtasks` (foreign key: task_id)
  - Many-to-many with `tags` (via `task_tags` junction table)

## Entity: Tag
- **Table Name**: `tags`
- **Fields**:
  - `id` (UUID, Primary Key, Not Null) - Unique identifier
  - `user_id` (UUID, Foreign Key, Not Null) - Owner of the tag
  - `name` (VARCHAR(50), Not Null) - Tag name
  - `color` (VARCHAR(7), Not Null) - Tag color in hex format
  - `created_at` (TIMESTAMPTZ, Not Null) - Creation timestamp
  - `updated_at` (TIMESTAMPTZ, Not Null) - Last update timestamp
- **Validation**:
  - Name length (1-50 characters)
  - Valid hex color format
- **Relationships**:
  - Belongs to `users` (foreign key: user_id)
  - Many-to-many with `tasks` (via `task_tags` junction table)

## Entity: Subtask
- **Table Name**: `subtasks`
- **Fields**:
  - `id` (UUID, Primary Key, Not Null) - Unique identifier
  - `task_id` (UUID, Foreign Key, Not Null) - Parent task
  - `title` (VARCHAR(200), Not Null) - Subtask title
  - `completed` (BOOLEAN, Default: false) - Completion status
  - `order_index` (INTEGER, Not Null) - Order in the list
  - `created_at` (TIMESTAMPTZ, Not Null) - Creation timestamp
  - `updated_at` (TIMESTAMPTZ, Not Null) - Last update timestamp
- **Validation**:
  - Title length (1-200 characters)
  - Unique order_index per task
- **Relationships**:
  - Belongs to `tasks` (foreign key: task_id)

## Entity: Task-Tag Junction
- **Table Name**: `task_tags`
- **Fields**:
  - `task_id` (UUID, Foreign Key, Not Null) - Task identifier
  - `tag_id` (UUID, Foreign Key, Not Null) - Tag identifier
  - `created_at` (TIMESTAMPTZ, Not Null) - Association timestamp
- **Validation**:
  - Composite primary key (task_id, tag_id)
- **Relationships**:
  - Belongs to `tasks` (foreign key: task_id)
  - Belongs to `tags` (foreign key: tag_id)

## Entity: Analytics
- **Table Name**: `analytics`
- **Fields**:
  - `id` (UUID, Primary Key, Not Null) - Unique identifier
  - `user_id` (UUID, Foreign Key, Not Null) - Owner of the analytics data
  - `date` (DATE, Not Null) - Date for the analytics record
  - `tasks_created` (INTEGER, Default: 0) - Number of tasks created
  - `tasks_completed` (INTEGER, Default: 0) - Number of tasks completed
  - `time_spent_minutes` (INTEGER, Default: 0) - Time spent in minutes
  - `created_at` (TIMESTAMPTZ, Not Null) - Creation timestamp
  - `updated_at` (TIMESTAMPTZ, Not Null) - Last update timestamp
- **Validation**:
  - Date must be current or past
  - Non-negative counts
- **Relationships**:
  - Belongs to `users` (foreign key: user_id)

## Entity: User Preferences
- **Table Name**: `user_preferences`
- **Fields**:
  - `id` (UUID, Primary Key, Not Null) - Unique identifier
  - `user_id` (UUID, Foreign Key, Unique, Not Null) - Associated user
  - `theme` (VARCHAR(20), Default: 'light') - UI theme preference
  - `timezone` (VARCHAR(50), Default: 'UTC') - Timezone preference
  - `language` (VARCHAR(10), Default: 'en') - Language preference
  - `created_at` (TIMESTAMPTZ, Not Null) - Creation timestamp
  - `updated_at` (TIMESTAMPTZ, Not Null) - Last update timestamp
- **Validation**:
  - Valid theme values
  - Valid timezone values
  - Valid language codes
- **Relationships**:
  - Belongs to `users` (foreign key: user_id)

## Indexes
- `users.email` - For authentication lookups
- `tasks.user_id` - For user task queries
- `tasks.status` - For status-based filtering
- `tasks.priority` - For priority-based filtering
- `tasks.due_date` - For due date queries
- `tags.user_id` - For user tag queries
- `analytics.user_id` - For user analytics queries
- `analytics.date` - For date range queries

## Constraints
- Foreign key constraints with appropriate cascade behavior
- Check constraints for enum-like fields (priority, status)
- Unique constraints where appropriate (email, user-tag-task combinations)
- Not null constraints for required fields