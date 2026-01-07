// frontend/src/models/user-preferences.ts
// User Preferences entity model for the AIDO task management application

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  default_view: 'list' | 'kanban' | 'calendar' | 'matrix';
  date_format?: string;
  week_start_day: number; // 0 = Sunday, 1 = Monday, etc.
  animations_enabled: boolean;
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  notification_enabled?: boolean;
  notification_sound?: boolean;
  task_reminders_enabled?: boolean;
  daily_digest_enabled?: boolean;
  timezone?: string;
  language?: string;
  completed_tasks_visible?: boolean;
  show_empty_states?: boolean;
}

export interface UserPreferencesUpdateRequest {
  theme?: 'light' | 'dark' | 'system';
  default_view?: 'list' | 'kanban' | 'calendar' | 'matrix';
  date_format?: string;
  week_start_day?: number; // 0 = Sunday, 1 = Monday, etc.
  animations_enabled?: boolean;
  pomodoro_work_minutes?: number;
  pomodoro_break_minutes?: number;
  notification_enabled?: boolean;
  notification_sound?: boolean;
  task_reminders_enabled?: boolean;
  daily_digest_enabled?: boolean;
  timezone?: string;
  language?: string;
  completed_tasks_visible?: boolean;
  show_empty_states?: boolean;
}

export interface UserPreferencesCreateRequest {
  theme?: 'light' | 'dark' | 'system';
  default_view?: 'list' | 'kanban' | 'calendar' | 'matrix';
  date_format?: string;
  week_start_day?: number; // 0 = Sunday, 1 = Monday, etc.
  animations_enabled?: boolean;
  pomodoro_work_minutes?: number;
  pomodoro_break_minutes?: number;
  notification_enabled?: boolean;
  notification_sound?: boolean;
  task_reminders_enabled?: boolean;
  daily_digest_enabled?: boolean;
  timezone?: string;
  language?: string;
  completed_tasks_visible?: boolean;
  show_empty_states?: boolean;
}