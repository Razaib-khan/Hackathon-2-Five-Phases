"use client";

/**
 * Settings Context
 *
 * Manages user preferences loaded from backend API (FR-091 to FR-095):
 * - theme: light/dark/system (synced with ThemeContext)
 * - default_view: list/kanban/calendar/matrix (synced with ViewContext)
 * - date_format: Display format string (FR-092)
 * - week_start_day: 0=Sunday, 1=Monday (FR-093)
 * - animations_enabled: Boolean toggle (FR-090)
 * - pomodoro_work_minutes: Work session duration (FR-061)
 * - pomodoro_break_minutes: Break session duration (FR-061)
 *
 * API Integration:
 * - GET /api/user/settings: Load on mount (creates defaults if not exists)
 * - PATCH /api/user/settings: Update on change
 */

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserSettings {
  theme: "light" | "dark" | "system";
  default_view: "list" | "kanban" | "calendar" | "matrix";
  date_format: string;
  week_start_day: number;
  animations_enabled: boolean;
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: UserSettings = {
  theme: "system",
  default_view: "list",
  date_format: "MMM dd, yyyy",
  week_start_day: 0,
  animations_enabled: true,
  pomodoro_work_minutes: 25,
  pomodoro_break_minutes: 5,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // TODO: Implement API call to GET /api/user/settings
        // const response = await fetch('/api/user/settings', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await response.json();
        // setSettings(data);

        // For now, use defaults
        setSettings(defaultSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      // Optimistic update
      setSettings((prev) => ({ ...prev, ...updates }));

      // TODO: Implement API call to PATCH /api/user/settings
      // await fetch('/api/user/settings', {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updates)
      // });
    } catch (error) {
      console.error("Failed to update settings:", error);
      // Rollback on error
      // TODO: Reload from API or revert optimistic update
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
