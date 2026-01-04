-- Rollback Script for Advanced UI Features Migrations
-- WARNING: This will remove all new tables and columns added in Phase 1
-- Run this ONLY if you need to completely revert the database schema changes

-- Drop new tables in reverse order (respecting foreign key dependencies)
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Drop indexes from tasks table
DROP INDEX IF EXISTS idx_task_completed;
DROP INDEX IF EXISTS idx_task_custom_order;
DROP INDEX IF EXISTS idx_task_status;
DROP INDEX IF EXISTS idx_task_due_date;
DROP INDEX IF EXISTS idx_task_priority;

-- Remove check constraints from tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_time_spent_check;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;

-- Remove new columns from tasks table
ALTER TABLE tasks
  DROP COLUMN IF EXISTS version,
  DROP COLUMN IF EXISTS recurrence_pattern,
  DROP COLUMN IF EXISTS custom_order,
  DROP COLUMN IF EXISTS time_spent,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS due_date,
  DROP COLUMN IF EXISTS priority;

-- Optionally drop UUID extension (only if not used elsewhere)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Verify rollback by listing tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
