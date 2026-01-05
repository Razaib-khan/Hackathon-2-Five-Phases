"use client";

/**
 * Filter Context
 *
 * Manages active task filters (FR-051 to FR-055):
 * - priority: Array of priority levels (high/medium/low/none)
 * - status: Array of statuses (todo/in_progress/done)
 * - tag_ids: Array of tag UUIDs
 * - due_date_start: Start of due date range
 * - due_date_end: End of due date range
 * - search: Full-text search term (max 200 chars)
 *
 * Filters applied with AND logic across all criteria.
 * Used by all view modes (list/kanban/calendar/matrix).
 */

import React, { createContext, useContext, useState } from "react";

interface FilterState {
  priority: ('high' | 'medium' | 'low' | 'none')[];
  status: ('todo' | 'in_progress' | 'done')[];
  tag_ids: string[];
  due_date_start: Date | null;
  due_date_end: Date | null;
  search: string;
}

interface FilterContextType {
  filters: FilterState;
  setPriority: (priorities: ('high' | 'medium' | 'low' | 'none')[]) => void;
  setStatus: (statuses: ('todo' | 'in_progress' | 'done')[]) => void;
  setTagIds: (tagIds: string[]) => void;
  setDueDateRange: (start: Date | null, end: Date | null) => void;
  setDueDateStart: (start: Date | null) => void;
  setDueDateEnd: (end: Date | null) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
}

const defaultFilters: FilterState = {
  priority: [],
  status: [],
  tag_ids: [],
  due_date_start: null,
  due_date_end: null,
  search: "",
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setPriority = (priorities: string[]) => {
    // Validate that all priority values are valid
    const validPriorities = priorities.filter(p =>
      ['high', 'medium', 'low', 'none'].includes(p)
    ) as ('high' | 'medium' | 'low' | 'none')[];
    setFilters((prev) => ({ ...prev, priority: validPriorities }));
  };

  const setStatus = (statuses: string[]) => {
    // Validate that all status values are valid
    const validStatuses = statuses.filter(s =>
      ['todo', 'in_progress', 'done'].includes(s)
    ) as ('todo' | 'in_progress' | 'done')[];
    setFilters((prev) => ({ ...prev, status: validStatuses }));
  };

  const setTagIds = (tagIds: string[]) => {
    setFilters((prev) => ({ ...prev, tag_ids: tagIds }));
  };

  const setDueDateRange = (start: Date | null, end: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      due_date_start: start,
      due_date_end: end,
    }));
  };

  const setDueDateStart = (start: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      due_date_start: start,
    }));
  };

  const setDueDateEnd = (end: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      due_date_end: end,
    }));
  };

  const setSearch = (search: string) => {
    // Enforce 200 char limit (FR-051)
    const trimmed = search.slice(0, 200);
    setFilters((prev) => ({ ...prev, search: trimmed }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setPriority,
        setStatus,
        setTagIds,
        setDueDateRange,
        setDueDateStart,
        setDueDateEnd,
        setSearch,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}
