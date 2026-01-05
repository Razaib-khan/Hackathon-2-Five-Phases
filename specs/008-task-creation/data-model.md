# Data Model: Task Creation and UI Enhancement

## Task Entity

### Fields
- **id** (string, required, unique) - Unique identifier for the task
- **title** (string, required) - The main title of the task
- **description** (string, optional) - Detailed description of the task
- **priority** (enum: high, medium, low, default: medium) - Priority level of the task
- **due_date** (datetime, optional) - When the task is due
- **created_at** (datetime, server-generated) - When the task was created
- **updated_at** (datetime, server-generated) - When the task was last updated
- **completed** (boolean, default: false) - Whether the task is completed
- **user_id** (string, required, foreign key) - The user who owns the task
- **estimated_time** (number, optional, in minutes) - Estimated time to complete the task
- **category** (string, optional) - Category of the task
- **tags** (array of tag IDs, optional) - Tags associated with the task
- **reminder_time** (datetime, optional) - When to remind about the task

### Validation Rules
- Title must be between 1-200 characters
- Description can be up to 1000 characters
- Priority must be one of: high, medium, low
- Due date must be in the future if provided
- User ID must exist and be valid
- Estimated time must be positive if provided

## Tag Entity

### Fields
- **id** (string, required, unique) - Unique identifier for the tag
- **name** (string, required) - Name of the tag
- **color** (string, required) - Color code for the tag display
- **user_id** (string, required, foreign key) - The user who owns the tag
- **created_at** (datetime, server-generated) - When the tag was created
- **updated_at** (datetime, server-generated) - When the tag was last updated

### Validation Rules
- Name must be between 1-50 characters
- Color must be a valid hex color code
- User ID must exist and be valid
- Tag names must be unique per user

## User Preferences Entity

### Fields
- **id** (string, required, unique) - Unique identifier for the preference record
- **user_id** (string, required, foreign key) - The user this preference belongs to
- **theme** (enum: light, dark, system, default: system) - Preferred theme
- **default_view** (enum: list, kanban, calendar, matrix, default: list) - Default task view
- **date_format** (string, default: "MM/DD/YYYY") - Preferred date format
- **week_start_day** (number, default: 0) - First day of week (0=Sunday, 1=Monday)
- **animations_enabled** (boolean, default: true) - Whether to show animations
- **pomodoro_work_minutes** (number, default: 25) - Work time for Pomodoro
- **pomodoro_break_minutes** (number, default: 5) - Break time for Pomodoro
- **created_at** (datetime, server-generated) - When preferences were created
- **updated_at** (datetime, server-generated) - When preferences were last updated

### Validation Rules
- User ID must exist and be valid
- Theme must be one of: light, dark, system
- Default view must be one of: list, kanban, calendar, matrix
- Date format must be a valid format string
- Week start day must be 0-6
- Pomodoro times must be positive numbers

## Export Configuration

### Fields
- **format** (enum: json, csv, pdf, default: json) - Export format
- **include_completed** (boolean, default: false) - Whether to include completed tasks
- **date_range** (object) - Start and end dates for export
- **tags** (array of tag IDs, optional) - Only export tasks with these tags
- **priorities** (array of priority values, optional) - Only export tasks with these priorities

### Validation Rules
- Format must be one of: json, csv, pdf
- Date range must have valid start and end dates
- If date range specified, end date must be after start date

## Analytics Data Structure

### Dashboard Analytics
- **total_tasks** (number) - Total number of tasks
- **completed_tasks** (number) - Number of completed tasks
- **overdue_tasks** (number) - Number of overdue tasks
- **due_today** (number) - Number of tasks due today
- **priority_distribution** (object) - Count of tasks by priority
- **completion_trend** (array) - Daily completion statistics
- **category_breakdown** (array) - Task count by category/tag
- **total_time_spent** (number) - Total time spent on tasks (minutes)
- **average_completion_time** (number) - Average time to complete tasks (minutes)

### Streak Data
- **current_streak** (number) - Current consecutive days with completions
- **longest_streak** (number) - Longest streak ever achieved
- **last_completion_date** (string) - Date of most recent completion

## State Transitions

### Task State Transitions
- **Creation**: New task is created with `completed: false`
- **Completion**: Task `completed` changes from `false` to `true`
- **Reopening**: Task `completed` changes from `true` to `false`
- **Deletion**: Task is marked for deletion (soft delete)

### Theme State Transitions
- **User Selection**: User selects light/dark/system theme
- **System Detection**: System preference changes (dark mode on/off)
- **Persistence**: Theme preference saved to user settings

## Relationships

### Task to Tag
- **Type**: Many-to-Many
- **Description**: Tasks can have multiple tags, tags can be applied to multiple tasks
- **Implementation**: TaskTag junction table

### User to Task
- **Type**: One-to-Many
- **Description**: One user can have many tasks
- **Implementation**: user_id foreign key in tasks table

### User to Tag
- **Type**: One-to-Many
- **Description**: One user can have many tags
- **Implementation**: user_id foreign key in tags table

### User to Preferences
- **Type**: One-to-One
- **Description**: One user has one set of preferences
- **Implementation**: user_id foreign key in user_preferences table