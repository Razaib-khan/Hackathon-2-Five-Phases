// frontend/src/models/user-preferences.ts
// User Preferences entity model for the AIDO task management application

export interface UserPreferences {
  id: string; // Using string to accommodate UUID format
  user_id: string; // Using string to accommodate UUID format
  theme: string; // Backend uses string pattern validation
  default_view: string; // Backend uses string pattern validation
  date_format: string; // Backend has this as required
  week_start_day: number; // 0 = Sunday, 1 = Monday, etc.
  animations_enabled: boolean;
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  // Remove additional fields that are not in backend schema
}

export interface UserPreferencesUpdateRequest {
  theme?: string; // Backend uses string pattern validation
  default_view?: string; // Backend uses string pattern validation
  date_format?: string; // Backend has this as required in response but optional in update
  week_start_day?: number; // 0 = Sunday, 1 = Monday, etc.
  animations_enabled?: boolean;
  pomodoro_work_minutes?: number;
  pomodoro_break_minutes?: number;
}

export interface UserPreferencesCreateRequest {
  theme?: string; // Backend uses string pattern validation
  default_view?: string; // Backend uses string pattern validation
  date_format?: string; // Backend has this as required in response but optional in update
  week_start_day?: number; // 0 = Sunday, 1 = Monday, etc.
  animations_enabled?: boolean;
  pomodoro_work_minutes?: number;
  pomodoro_break_minutes?: number;
}