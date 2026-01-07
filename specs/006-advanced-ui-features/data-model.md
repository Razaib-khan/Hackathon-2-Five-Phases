# Data Model: Advanced UI Features

**Feature**: 006-advanced-ui-features
**Date**: 2026-01-03
**Phase**: 1 - Design & Architecture

## Overview

This document defines the database schema extensions and entity relationships required for the advanced UI features. All changes extend the existing Phase 2 schema (users, tasks tables).

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       │ *
┌──────┴──────┐
│    Task     │──────────┐
└──────┬──────┘          │
       │ 1               │ *
       │                 │
       │ *         ┌─────┴──────┐
┌──────┴──────┐   │  task_tags │
│   Subtask   │   │ (junction) │
└─────────────┘   └─────┬──────┘
                        │ *
                        │
                  ┌─────┴──────┐
                  │    Tag     │
                  └────────────┘

┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       │ 1
┌──────┴───────────┐
│  UserSettings    │
└──────────────────┘
```

---

## Entities

### 1. User (Existing - No Changes)

**Purpose**: Authenticated user account

**Table**: `users`

**Existing Columns** (from Phase 2):
- `id` (UUID, PK)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())

**Relationships**:
- One-to-many with `tasks`
- One-to-many with `tags`
- One-to-one with `user_settings`

**No Migration Required**: Existing table structure sufficient

---

### 2. Task (Extended)

**Purpose**: User's todo item with enhanced properties

**Table**: `tasks`

**Existing Columns** (from Phase 2):
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id, NOT NULL)
- `title` (VARCHAR(200), NOT NULL)
- `description` (TEXT, NULLABLE)
- `completed` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())

**New Columns** (Migration Required):

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| `priority` | VARCHAR(10) | CHECK (priority IN ('high', 'medium', 'low', 'none')) | 'none' | FR-001: Priority level |
| `due_date` | TIMESTAMP | NULLABLE | NULL | FR-011: Optional deadline |
| `status` | VARCHAR(20) | CHECK (status IN ('todo', 'in_progress', 'done')) | 'todo' | FR-026: Kanban column state |
| `time_spent` | INTEGER | >= 0 | 0 | FR-064: Accumulated minutes tracked |
| `custom_order` | INTEGER | NULLABLE | NULL | FR-044: User-defined list position |
| `recurrence_pattern` | JSONB | NULLABLE | NULL | FR-072: Daily/Weekly/Monthly config |

**JSONB Structure for `recurrence_pattern`**:
```json
{
  "enabled": true,
  "frequency": "daily" | "weekly" | "monthly",
  "interval": 1,
  "end_date": "2026-12-31T00:00:00Z" // optional
}
```

**Indexes** (Performance Optimization):
```sql
CREATE INDEX idx_task_user_id ON tasks(user_id);
CREATE INDEX idx_task_priority ON tasks(priority);
CREATE INDEX idx_task_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_task_custom_order ON tasks(custom_order) WHERE custom_order IS NOT NULL;
CREATE INDEX idx_task_completed ON tasks(completed);
```

**Validation Rules**:
- `title`: 1-200 characters (FR-001)
- `priority`: One of ['high', 'medium', 'low', 'none']
- `status`: One of ['todo', 'in_progress', 'done']
- `time_spent`: Non-negative integer (minutes)
- `custom_order`: Unique per user (enforced at application layer)

**Relationships**:
- Many-to-one with `users`
- One-to-many with `subtasks`
- Many-to-many with `tags` (via `task_tags`)

**State Transitions** (FR-027):
- `todo` → `in_progress` → `done` (sequential flow supported)
- `todo` → `done` (direct transition allowed, per clarification Q5)
- `in_progress` → `todo` (rollback allowed)
- `done` → `todo` or `in_progress` (reopening allowed)

**Migration SQL**:
```sql
ALTER TABLE tasks
  ADD COLUMN priority VARCHAR(10) DEFAULT 'none' CHECK (priority IN ('high', 'medium', 'low', 'none')),
  ADD COLUMN due_date TIMESTAMP NULL,
  ADD COLUMN status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  ADD COLUMN time_spent INTEGER DEFAULT 0 CHECK (time_spent >= 0),
  ADD COLUMN custom_order INTEGER NULL,
  ADD COLUMN recurrence_pattern JSONB NULL;

CREATE INDEX idx_task_priority ON tasks(priority);
CREATE INDEX idx_task_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_task_custom_order ON tasks(custom_order) WHERE custom_order IS NOT NULL;
```

---

### 3. Tag (New)

**Purpose**: User-defined category label for task organization

**Table**: `tags`

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Unique identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL | - | Owner of tag |
| `name` | VARCHAR(50) | NOT NULL | - | Display name |
| `color` | VARCHAR(7) | NOT NULL | '#808080' | Hex color code |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | Creation timestamp |

**Unique Constraint**:
```sql
UNIQUE (user_id, name) -- Prevent duplicate tag names per user
```

**Indexes**:
```sql
CREATE INDEX idx_tag_user_id ON tags(user_id);
```

**Validation Rules**:
- `name`: 1-50 characters, alphanumeric + spaces/hyphens (FR-016)
- `color`: Valid hex color (#RRGGBB format)
- Maximum 100 tags per user (FR-106, enforced at application layer)

**Relationships**:
- Many-to-one with `users`
- Many-to-many with `tasks` (via `task_tags`)

**Migration SQL**:
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#808080',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE INDEX idx_tag_user_id ON tags(user_id);
```

---

### 4. TaskTags (Junction Table - New)

**Purpose**: Many-to-many relationship between tasks and tags

**Table**: `task_tags`

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| `task_id` | UUID | FOREIGN KEY → tasks.id, NOT NULL | - | Task reference |
| `tag_id` | UUID | FOREIGN KEY → tags.id, NOT NULL | - | Tag reference |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | Association timestamp |

**Primary Key**:
```sql
PRIMARY KEY (task_id, tag_id) -- Composite key prevents duplicates
```

**Indexes**:
```sql
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);
```

**Cascade Behavior**:
- Delete task → delete all associated task_tags (ON DELETE CASCADE)
- Delete tag → delete all associated task_tags (ON DELETE CASCADE) (FR-021)

**Validation Rules**:
- Maximum 10 tags per task (FR-021, enforced at application layer)

**Migration SQL**:
```sql
CREATE TABLE task_tags (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);
```

---

### 5. Subtask (New)

**Purpose**: Checklist item within a parent task

**Table**: `subtasks`

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Unique identifier |
| `task_id` | UUID | FOREIGN KEY → tasks.id, NOT NULL | - | Parent task |
| `title` | VARCHAR(200) | NOT NULL | - | Subtask description |
| `completed` | BOOLEAN | NOT NULL | FALSE | Completion status |
| `order_index` | INTEGER | NOT NULL | 0 | Display order |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | NOW() | Last modified |

**Indexes**:
```sql
CREATE INDEX idx_subtask_task_id ON subtasks(task_id);
CREATE INDEX idx_subtask_order ON subtasks(task_id, order_index);
```

**Cascade Behavior**:
- Delete task → delete all associated subtasks (ON DELETE CASCADE)

**Validation Rules**:
- `title`: 1-200 characters (FR-036)
- `order_index`: Non-negative integer
- Maximum 50 subtasks per task (FR-106, enforced at application layer)

**Special Behavior** (Clarification Q1):
- When parent task marked `completed = true` AND subtasks exist → automatically mark all subtasks `completed = true` (FR-040a)
- Trigger or application logic handles cascade completion

**Migration SQL**:
```sql
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subtask_task_id ON subtasks(task_id);
CREATE INDEX idx_subtask_order ON subtasks(task_id, order_index);
```

---

### 6. UserSettings (New)

**Purpose**: User preferences and configuration

**Table**: `user_settings`

**Columns**:

| Column | Type | Constraints | Default | Purpose |
|--------|------|-------------|---------|---------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Unique identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, UNIQUE, NOT NULL | - | User reference |
| `theme` | VARCHAR(10) | CHECK (theme IN ('light', 'dark', 'system')) | 'system' | FR-006: Theme preference |
| `default_view` | VARCHAR(10) | CHECK (default_view IN ('list', 'kanban', 'calendar', 'matrix')) | 'list' | FR-091: View mode |
| `date_format` | VARCHAR(20) | NOT NULL | 'MMM dd, yyyy' | FR-092: Date display format |
| `week_start_day` | INTEGER | CHECK (week_start_day IN (0, 1)) | 0 | FR-093: 0=Sunday, 1=Monday |
| `animations_enabled` | BOOLEAN | NOT NULL | TRUE | FR-090: Animation toggle |
| `pomodoro_work_minutes` | INTEGER | CHECK (pomodoro_work_minutes > 0) | 25 | FR-061: Custom interval |
| `pomodoro_break_minutes` | INTEGER | CHECK (pomodoro_break_minutes > 0) | 5 | FR-061: Custom interval |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | NOW() | Last modified |

**Unique Constraint**:
```sql
UNIQUE (user_id) -- One settings record per user
```

**Indexes**:
```sql
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

**Validation Rules**:
- `theme`: One of ['light', 'dark', 'system'] (FR-007)
- `default_view`: One of ['list', 'kanban', 'calendar', 'matrix'] (FR-091)
- `week_start_day`: 0 (Sunday) or 1 (Monday) (FR-093)
- `pomodoro_work_minutes`: 1-60 minutes (reasonable range)
- `pomodoro_break_minutes`: 1-30 minutes (reasonable range)

**Relationships**:
- One-to-one with `users`

**Migration SQL**:
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(10) NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  default_view VARCHAR(10) NOT NULL DEFAULT 'list' CHECK (default_view IN ('list', 'kanban', 'calendar', 'matrix')),
  date_format VARCHAR(20) NOT NULL DEFAULT 'MMM dd, yyyy',
  week_start_day INTEGER NOT NULL DEFAULT 0 CHECK (week_start_day IN (0, 1)),
  animations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  pomodoro_work_minutes INTEGER NOT NULL DEFAULT 25 CHECK (pomodoro_work_minutes > 0),
  pomodoro_break_minutes INTEGER NOT NULL DEFAULT 5 CHECK (pomodoro_break_minutes > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

---

## Database Views (Optional Performance Optimization)

### View: task_with_details

**Purpose**: Pre-join tasks with tags and subtask progress for faster queries

```sql
CREATE VIEW task_with_details AS
SELECT
  t.*,
  COALESCE(json_agg(DISTINCT jsonb_build_object(
    'id', tag.id,
    'name', tag.name,
    'color', tag.color
  )) FILTER (WHERE tag.id IS NOT NULL), '[]') AS tags,
  COALESCE(COUNT(DISTINCT s.id), 0) AS subtask_count,
  COALESCE(COUNT(DISTINCT s.id) FILTER (WHERE s.completed = TRUE), 0) AS completed_subtask_count
FROM tasks t
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags tag ON tt.tag_id = tag.id
LEFT JOIN subtasks s ON t.id = s.task_id
GROUP BY t.id;
```

**Benefits**:
- Reduces N+1 query problems
- Faster task list rendering
- Includes computed fields (subtask progress)

---

## Migration Order & Dependencies

### Migration 1: Enable UUID Extension
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Migration 2: Add Task Columns
```sql
-- Add new columns to tasks table
-- See Task entity migration SQL above
```

### Migration 3: Create Tags Table
```sql
-- Create tags table
-- See Tag entity migration SQL above
```

### Migration 4: Create Task-Tags Junction
```sql
-- Create task_tags junction table
-- See TaskTags migration SQL above
```

### Migration 5: Create Subtasks Table
```sql
-- Create subtasks table
-- See Subtask migration SQL above
```

### Migration 6: Create UserSettings Table
```sql
-- Create user_settings table
-- See UserSettings migration SQL above
```

### Migration 7: Create Indexes
```sql
-- All indexes from entities above
-- Run after data population for optimal index building
```

### Migration 8: Create Views (Optional)
```sql
-- Create task_with_details view
-- See Database Views section above
```

---

## Data Integrity Rules

### Application-Level Enforcement

**Tag Limit per Task** (FR-021):
```python
async def add_tag_to_task(task_id: UUID, tag_id: UUID, db: Session):
    current_count = db.query(TaskTag).filter_by(task_id=task_id).count()
    if current_count >= 10:
        raise ValueError("Maximum 10 tags per task")
    # ... proceed with insertion
```

**Subtask Limit per Task** (FR-106):
```python
async def create_subtask(task_id: UUID, data: SubtaskCreate, db: Session):
    current_count = db.query(Subtask).filter_by(task_id=task_id).count()
    if current_count >= 50:
        raise ValueError("Maximum 50 subtasks per task")
    # ... proceed with creation
```

**Tag Limit per User** (FR-106):
```python
async def create_tag(user_id: UUID, data: TagCreate, db: Session):
    current_count = db.query(Tag).filter_by(user_id=user_id).count()
    if current_count >= 100:
        raise ValueError("Maximum 100 tags per user")
    # ... proceed with creation
```

**Task Limit per User** (FR-106):
```python
async def create_task(user_id: UUID, data: TaskCreate, db: Session):
    current_count = db.query(Task).filter_by(user_id=user_id).count()
    if current_count >= 10000:
        raise ValueError("Maximum 10,000 tasks per user")
    # ... proceed with creation
```

---

## Conflict Resolution (Clarification Q2)

### Optimistic Locking Strategy

**Implementation**: Add `version` column to tasks table

```sql
ALTER TABLE tasks ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
```

**Update Logic**:
```python
async def update_task(task_id: UUID, data: TaskUpdate, current_version: int, db: Session):
    result = db.execute(
        update(Task)
        .where(Task.id == task_id, Task.version == current_version)
        .values(**data.dict(), version=current_version + 1)
        .returning(Task)
    )
    if result.rowcount == 0:
        raise ConflictError("Task was modified by another session")
    return result.scalar_one()
```

**Frontend Handling** (FR-103):
```typescript
try {
  await updateTask(id, data, currentVersion)
} catch (ConflictError) {
  const choice = await showDialog({
    title: "Conflict Detected",
    message: "This task was modified elsewhere. Keep your changes or reload latest version?",
    buttons: ["Keep My Changes", "Reload Latest"]
  })
  if (choice === "Reload Latest") {
    await refetchTask(id)
  } else {
    await forceUpdateTask(id, data) // Overwrite
  }
}
```

---

## Sample Queries

### Get Tasks with Filters
```sql
SELECT * FROM task_with_details
WHERE user_id = $1
  AND ($2::VARCHAR IS NULL OR priority = $2)
  AND ($3::TIMESTAMP IS NULL OR due_date >= $3)
  AND ($4::TIMESTAMP IS NULL OR due_date <= $4)
  AND ($5::VARCHAR IS NULL OR status = $5)
  AND ($6::UUID[] IS NULL OR id IN (
    SELECT task_id FROM task_tags WHERE tag_id = ANY($6)
  ))
ORDER BY
  CASE WHEN $7 = 'priority' THEN
    CASE priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      ELSE 4
    END
  END,
  CASE WHEN $7 = 'due_date' THEN due_date END NULLS LAST,
  CASE WHEN $7 = 'custom_order' THEN custom_order END NULLS LAST,
  created_at DESC;
```

### Get Dashboard Statistics
```sql
SELECT
  COUNT(*) AS total_tasks,
  COUNT(*) FILTER (WHERE completed = TRUE) AS completed_tasks,
  COUNT(*) FILTER (WHERE priority = 'high') AS high_priority,
  COUNT(*) FILTER (WHERE due_date < NOW() AND completed = FALSE) AS overdue,
  AVG(time_spent) FILTER (WHERE completed = TRUE) AS avg_completion_time
FROM tasks
WHERE user_id = $1;
```

### Get Streak Data
```sql
SELECT
  DATE(updated_at) AS completion_date,
  COUNT(*) AS tasks_completed
FROM tasks
WHERE user_id = $1
  AND completed = TRUE
  AND updated_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(updated_at)
ORDER BY completion_date DESC;
```

---

## Backup & Rollback Plan

### Pre-Migration Backup
```bash
pg_dump -h <neon-host> -U <user> -d <database> -F c -f backup_before_006.dump
```

### Rollback Script
```sql
-- Drop new tables in reverse order
DROP VIEW IF EXISTS task_with_details;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS subtasks;
DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS tags;

-- Remove new columns from tasks
ALTER TABLE tasks
  DROP COLUMN IF EXISTS priority,
  DROP COLUMN IF EXISTS due_date,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS time_spent,
  DROP COLUMN IF EXISTS custom_order,
  DROP COLUMN IF EXISTS recurrence_pattern,
  DROP COLUMN IF EXISTS version;
```

---

**Data Model Complete**: All entities, relationships, migrations, and integrity rules defined.
