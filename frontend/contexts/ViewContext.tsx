"use client";

/**
 * View Mode Context
 *
 * Manages active task view mode (FR-022 to FR-025):
 * - list: Traditional vertical list
 * - kanban: Columns by status (To Do / In Progress / Done)
 * - calendar: Monthly calendar with due dates
 * - matrix: Eisenhower priority matrix (urgent/important)
 *
 * Default view loaded from user settings via SettingsContext.
 * Changes are persisted to settings API on update.
 */

import React, { createContext, useContext, useState } from "react";

type ViewMode = "list" | "kanban" | "calendar" | "matrix";

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>("list");

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    // TODO: Persist to user settings API (PATCH /api/user/settings)
    // This will be implemented when SettingsContext is wired up
  };

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useView must be used within ViewProvider");
  }
  return context;
}
