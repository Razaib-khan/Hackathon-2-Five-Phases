// frontend/src/lib/constants.ts
// Shared constants for the AIDO task management application

// Theme Constants
export const THEME_PREFERENCES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
  SYSTEM: 'system' as const,
} as const;

export type ThemeType = typeof THEME_PREFERENCES[keyof typeof THEME_PREFERENCES];

export const THEME_STORAGE_KEY = 'aido-theme';

// View Constants
export const VIEW_PREFERENCES = {
  LIST: 'list' as const,
  KANBAN: 'kanban' as const,
  CALENDAR: 'calendar' as const,
  MATRIX: 'matrix' as const,
} as const;

export type ViewType = typeof VIEW_PREFERENCES[keyof typeof VIEW_PREFERENCES];

// Priority Constants
export const PRIORITY_LEVELS = {
  HIGH: 'high' as const,
  MEDIUM: 'medium' as const,
  LOW: 'low' as const,
} as const;

export type PriorityType = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

// Task View Constants
export const TASK_VIEWS = {
  ALL: 'all' as const,
  ACTIVE: 'active' as const,
  COMPLETED: 'completed' as const,
  OVERDUE: 'overdue' as const,
  TODAY: 'today' as const,
} as const;

export type TaskViewType = typeof TASK_VIEWS[keyof typeof TASK_VIEWS];

// Logo Sizes
export const LOGO_SIZES = {
  NAVBAR: 32,
  AUTH: 64,
} as const;

// Default Values
export const DEFAULT_VALUES = {
  POMODORO_WORK_MINUTES: 25,
  POMODORO_BREAK_MINUTES: 5,
  WEEK_START_DAY: 1, // Monday
  ANIMATIONS_ENABLED: true,
  DATE_FORMAT: 'MM/dd/yyyy',
  TIMEZONE: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

// API Constants
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 10000, // 10 seconds
};

// UI Constants
export const UI_CONSTANTS = {
  TOAST_DURATION: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 300, // 300ms
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
  TASK_FILTERS: 'taskFilters',
  LAST_LOGIN: 'lastLogin',
  THEME: 'aido-theme',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  MIN_TAG_NAME_LENGTH: 1,
  MAX_TAG_NAME_LENGTH: 50,
  MIN_TASK_TITLE_LENGTH: 1,
  MAX_TASK_TITLE_LENGTH: 200,
  MAX_TASK_DESCRIPTION_LENGTH: 1000,
  MAX_CATEGORY_NAME_LENGTH: 50,
};