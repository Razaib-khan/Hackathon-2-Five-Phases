// frontend/src/models/analytics.ts
// Analytics entity models for the AIDO task management application

export interface DashboardAnalytics {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  due_today: number;
  priority_distribution: {
    high: number;
    medium: number;
    low: number;
    none: number; // Added for compatibility
  };
  completion_trends: {
    date: string; // ISO date string
    completed: number;
    created: number; // Added to match CompletionTrendDataPoint interface
  }[];
  category_breakdown: {
    tag_name: string; // Changed from category to tag_name
    tag_color: string; // Added tag_color
    task_count: number; // Changed from count to task_count
    completed_count: number; // Added completed_count
  }[];
  streak_days: number;
  longest_streak: number;
  total_time_spent: number; // Added for compatibility
  average_completion_time: number; // Added for compatibility
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_completed_date?: string; // ISO date string
  streak_history: {
    date: string; // ISO date string
    completed: boolean;
  }[];
}