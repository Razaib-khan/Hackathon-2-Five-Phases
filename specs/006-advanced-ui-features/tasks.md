# Implementation Tasks: Advanced UI Features

**Feature**: 006-advanced-ui-features | **Date**: 2026-01-03 | **Branch**: `006-advanced-ui-features`

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md) | **API Contracts**: [contracts/openapi.yaml](./contracts/openapi.yaml)

---

## Task Organization

**Total User Stories**: 15 (P1: 2, P2: 3, P3: 6, P4: 4)
**Total Tasks**: 127 tasks across 18 phases
**Parallel Opportunities**: Marked with `[P]` prefix
**Story Labels**: Tasks tagged with `[US1]` to `[US15]` for user story mapping

---

## Phase 0: Project Setup & Dependencies

**Purpose**: Install required libraries, configure tools, verify Next.js 15 + React 19 compatibility

- [x] [T001] Install frontend dependencies: `npm install motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities date-fns sonner recharts zod` (quickstart.md:44-66)
- [x] [T002] Initialize shadcn/ui with React 19 force flag: `npx shadcn@latest init -d` and select `--force` when prompted (quickstart.md:50-51, research.md:98-99)
- [x] [T003] Install shadcn/ui base dependencies: `npm install class-variance-authority clsx tailwind-merge lucide-react` (quickstart.md:54)
- [x] [T004] Install backend dependencies: `pip install alembic redis` in `backend/requirements.txt` (quickstart.md:87-88)
- [x] [T005] Configure Tailwind CSS dark mode in `tailwind.config.js` with `darkMode: 'class'` and CSS variables (research.md:113-122)
- [x] [T006] Verify all library compatibility with Next.js 15 by running `npm run dev` and checking for peer dependency warnings (quickstart.md:69)

**Acceptance**: All dependencies installed without errors, dev server starts successfully, no critical peer dependency conflicts.

---

## Phase 1: Database Schema Migration

**Purpose**: Extend database schema with new tables and columns

**Dependencies**: Phase 0 complete

- [x] [T007] Enable UUID extension in Neon database: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` (data-model.md:405-407)
- [x] [T008] Create Alembic migration to add 6 columns to tasks table: `priority`, `due_date`, `status`, `time_spent`, `custom_order`, `recurrence_pattern` (data-model.md:139-152)
- [x] [T009] Create Alembic migration for tags table with user_id FK, unique constraint on (user_id, name) (data-model.md:193-203)
- [x] [T010] Create Alembic migration for task_tags junction table with composite PK (task_id, tag_id) and CASCADE delete (data-model.md:240-250)
- [x] [T011] Create Alembic migration for subtasks table with task_id FK and CASCADE delete (data-model.md:292-304)
- [x] [T012] Create Alembic migration for user_settings table with user_id UNIQUE FK (data-model.md:352-366)
- [x] [T013] Create Alembic migration to add 7 performance indexes on tasks.priority, tasks.due_date, tasks.status, tasks.custom_order, tags.user_id, task_tags.task_id, subtasks.task_id (data-model.md:112-117, 179, 229, 276)
- [x] [T014] Add `version` column to tasks table for optimistic locking: `ALTER TABLE tasks ADD COLUMN version INTEGER NOT NULL DEFAULT 1` (data-model.md:501)
- [x] [T015] Run all migrations against Neon database: `alembic upgrade head` and verify schema with `psql` (quickstart.md:110-112)
- [x] [T016] Create rollback script for all migrations in case of failure (data-model.md:600-618)

**Acceptance**: All 7 migrations applied successfully, schema verified in Neon console, rollback script tested on development branch.

---

## Phase 2: Backend Models & Schemas

**Purpose**: Define SQLAlchemy models and Pydantic schemas for new entities

**Dependencies**: Phase 1 complete

- [x] [T017] [P] Extend `backend/models/task.py` with 6 new columns: priority (VARCHAR check constraint), due_date (TIMESTAMP nullable), status (VARCHAR check), time_spent (INTEGER >=0), custom_order (INTEGER nullable), recurrence_pattern (JSONB), version (INTEGER) (data-model.md:89-99)
- [x] [T018] [P] Create `backend/models/tag.py` with id, user_id, name (VARCHAR 50), color (VARCHAR 7), created_at, and unique constraint (user_id, name) (data-model.md:162-175)
- [x] [T019] [P] Create `backend/models/subtask.py` with id, task_id, title (VARCHAR 200), completed (BOOLEAN), order_index (INTEGER), created_at, updated_at (data-model.md:260-271)
- [x] [T020] [P] Create `backend/models/user_settings.py` with all 9 preference columns and unique user_id constraint (data-model.md:315-328)
- [x] [T021] [P] Extend `backend/schemas/task.py` with TaskCreate, TaskUpdate, Task response schemas including nested tags and subtasks arrays (contracts/openapi.yaml:807-963)
- [x] [T022] [P] Create `backend/schemas/tag.py` with TagCreate, Tag response schemas (contracts/openapi.yaml:964-997)
- [x] [T023] [P] Create `backend/schemas/subtask.py` with SubtaskCreate, Subtask response schemas (contracts/openapi.yaml:999-1036)
- [x] [T024] [P] Create `backend/schemas/user_settings.py` with UserSettings response schema (contracts/openapi.yaml:1038-1081)
- [x] [T025] [P] Create `backend/schemas/analytics.py` with DashboardAnalytics response schema including priority_distribution, completion_trend, category_breakdown (contracts/openapi.yaml:1083-1132)

**Acceptance**: All models have proper relationships, schemas validate correctly, no import errors when running `uvicorn main:app --reload`.

---

## Phase 3: Backend API - Tags (US2 partial, foundational)

**Purpose**: Implement tag CRUD endpoints

**Dependencies**: Phase 2 complete

- [x] [T026] [US2] Create `backend/services/tag_service.py` with create_tag(user_id, data) checking 100 tag limit (FR-106), get_tags(user_id), update_tag(tag_id, data), delete_tag(tag_id) (data-model.md:477-482)
- [x] [T027] [US2] Create `backend/routers/tags.py` with GET /tags returning all user tags (contracts/openapi.yaml:388-406)
- [x] [T028] [US2] Implement POST /tags with TagCreate schema, returning 403 if 100 tag limit reached (FR-106) (contracts/openapi.yaml:408-440)
- [x] [T029] [US2] Implement PATCH /tags/{tag_id} for updating name/color (FR-020) (contracts/openapi.yaml:442-480)
- [x] [T030] [US2] Implement DELETE /tags/{tag_id} with CASCADE delete from task_tags (FR-021) (contracts/openapi.yaml:482-497)
- [x] [T031] [US2] Write pytest unit tests for tag_service covering all CRUD operations and limit enforcement
- [x] [T032] [US2] Write pytest integration tests for tags API endpoints with authentication

**Acceptance**: All 5 tag endpoints functional, 100 tag limit enforced, cascade delete works, tests pass.

---

## Phase 4: Backend API - Subtasks (US6 partial, foundational)

**Purpose**: Implement subtask CRUD endpoints

**Dependencies**: Phase 2 complete (can run parallel with Phase 3)

- [x] [T033] [P] [US6] Create `backend/services/subtask_service.py` with create_subtask(task_id, data) checking 50 subtask limit (FR-106), update_subtask(subtask_id, data), delete_subtask(subtask_id)
- [x] [T034] [P] [US6] Implement POST /tasks/{task_id}/subtasks with SubtaskCreate schema, returning 403 if 50 subtask limit reached (contracts/openapi.yaml:503-534)
- [x] [T035] [P] [US6] Implement PATCH /subtasks/{subtask_id} for updating title, completed, order_index (FR-040) (contracts/openapi.yaml:536-579)
- [x] [T036] [P] [US6] Implement DELETE /subtasks/{subtask_id} (contracts/openapi.yaml:581-597)
- [x] [T037] [P] [US6] Add auto-complete logic: when task.completed set to TRUE, automatically mark all subtasks completed=TRUE (FR-040a, Clarification Q1) in `backend/services/task_service.py:update_task()`
- [x] [T038] [P] [US6] Write pytest unit tests for subtask_service and auto-complete behavior
- [x] [T039] [P] [US6] Write pytest integration tests for subtasks API endpoints

**Acceptance**: All 3 subtask endpoints functional, 50 subtask limit enforced, auto-complete works when parent task marked complete, tests pass.

---

## Phase 5: Backend API - Extended Tasks Endpoints

**Purpose**: Extend existing tasks endpoints with filtering, bulk operations, conflict detection

**Dependencies**: Phase 2, 3, 4 complete

- [x] [T040] [US1] Extend GET /tasks to accept query params: priority[], status[], tag_ids[], due_date_start, due_date_end, search (max 200 chars), sort_by, order, limit, offset (contracts/openapi.yaml:44-155, FR-003, FR-013, FR-019, FR-051, FR-055)
- [x] [T041] [US1] Implement combined filter logic with AND for all criteria in `backend/services/task_service.py:get_tasks()` using SQL WHERE clauses (FR-052)
- [x] [T042] [US3] Extend POST /tasks to accept priority, due_date, status, tag_ids, recurrence_pattern in TaskCreate schema, return 403 if 10,000 task limit reached (FR-106) (contracts/openapi.yaml:157-193)
- [x] [T043] [US3] Extend PATCH /tasks/{task_id} to include `version` field for optimistic locking, return 409 with latest_data if version mismatch (FR-103, Clarification Q2) (contracts/openapi.yaml:213-259)
- [x] [T044] [US3] Implement conflict detection service in `backend/services/conflict_resolver.py` with version-based locking (data-model.md:507-517)
- [x] [T045] [US8] Implement PATCH /tasks/bulk for updating multiple tasks (completed, priority, status, add_tag_ids, remove_tag_ids), max 50 tasks per request (FR-048, FR-050) (contracts/openapi.yaml:278-345)
- [x] [T046] [US8] Implement DELETE /tasks/bulk for deleting multiple tasks, max 50 per request (FR-049) (contracts/openapi.yaml:347-382)
- [x] [T047] [US9] Modify GET /tasks to support full-text search across title and description with ILIKE or tsvector (FR-051)
- [x] [T048] [US3] Update `backend/services/task_service.py:get_tasks()` to join tags and subtasks, returning nested arrays in response (contracts/openapi.yaml:866-878)
- [x] [T049] Write pytest tests for all extended task endpoints, filtering combinations, bulk operations, conflict detection

**Acceptance**: All task filtering works with AND logic, bulk ops limited to 50, conflict detection returns 409 with latest data, search works across title+description, tests pass.

---

## Phase 6: Backend API - User Settings & Analytics

**Purpose**: Implement settings and analytics endpoints

**Dependencies**: Phase 2 complete (can run parallel with Phases 3-5)

- [x] [T050] [P] [US2] Create `backend/services/settings_service.py` with get_settings(user_id) creating defaults if not exists, update_settings(user_id, data) (FR-091 to FR-095)
- [x] [T051] [P] [US2] Implement GET /user/settings returning UserSettings (contracts/openapi.yaml:603-619)
- [x] [T052] [P] [US2] Implement PATCH /user/settings for updating theme, default_view, date_format, week_start_day, animations_enabled, pomodoro timers (FR-091-095) (contracts/openapi.yaml:621-668)
- [x] [T053] [P] [US13] Create `backend/services/analytics_service.py` with get_dashboard_analytics(user_id, period) calculating total_tasks, completed_tasks, completion_rate, priority_distribution, completion_trend, category_breakdown (FR-067 to FR-071)
- [x] [T054] [P] [US13] Implement GET /analytics/dashboard with period param (week/month/year/all) (contracts/openapi.yaml:673-698)
- [x] [T055] [P] [US13] Implement GET /analytics/streak calculating current_streak, longest_streak, last_completion_date by querying consecutive completion dates (FR-070) (contracts/openapi.yaml:700-727)
- [x] [T056] [P] [US2] Implement GET /export with format param (json/csv) exporting all user data (FR-094) (contracts/openapi.yaml:733-772)
- [x] [T057] [P] Write pytest tests for settings, analytics, and export endpoints

**Acceptance**: Settings CRUD works, analytics calculations correct, streak tracking accurate, export generates valid JSON/CSV, tests pass.

---

## Phase 7: Backend Middleware - Rate Limiting

**Purpose**: Implement per-user rate limiting (100 req/min)

**Dependencies**: Phase 2 complete (can run parallel with Phases 3-6)

- [x] [T058] [P] Create `backend/middleware/rate_limiter.py` using token bucket algorithm with Redis backend, 100 req/min per user (FR-104) (research.md:569-582)
- [x] [T059] [P] Add rate_limit middleware to FastAPI app startup with dependency injection
- [x] [T060] [P] Configure rate limit responses to include headers: Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset (contracts/openapi.yaml:1184-1204)
- [x] [T061] [P] Return HTTP 429 with user-friendly error message when limit exceeded (contracts/openapi.yaml:1210-1212, Edge case)
- [x] [T062] [P] Write pytest tests for rate limiter covering 100 req/min threshold, burst scenarios, header validation

**Acceptance**: Rate limiting enforces 100 req/min per user, correct headers returned, 429 status on exceed, tests pass.

---

## Phase 8: Frontend Context & State Management

**Purpose**: Create React contexts for theme, view mode, filters, settings

**Dependencies**: Phase 0 complete

- [x] [T063] [P] [US2] Create `frontend/contexts/ThemeContext.tsx` with light/dark/system theme state, localStorage persistence, system preference detection (FR-006 to FR-010) (research.md:376-384)
- [x] [T064] [P] [US5] Create `frontend/contexts/ViewContext.tsx` with active view mode (list/kanban/calendar/matrix), default from user settings (FR-022 to FR-025)
- [x] [T065] [P] [US9] Create `frontend/contexts/FilterContext.tsx` with active filters state (priority[], status[], tag_ids[], date ranges, search term) (FR-051 to FR-055)
- [x] [T066] [P] [US2] Create `frontend/contexts/SettingsContext.tsx` loading user preferences from API, updating via PATCH /user/settings (FR-091 to FR-095)
- [x] [T067] [P] Wrap `frontend/app/layout.tsx` with all 4 context providers in correct order (Theme → Settings → View → Filter)
- [x] [T068] [P] Add theme class toggle on `<html>` element based on ThemeContext state for Tailwind dark mode
- [x] [T069] [P] Write Jest unit tests for all 4 contexts including localStorage persistence, API integration

**Acceptance**: All contexts functional, theme persists across sessions, settings load from API, tests pass.

---

## Phase 9: Frontend API Client & Hooks

**Purpose**: Create API client functions and custom hooks with optimistic updates

**Dependencies**: Phase 8 complete

- [x] [T070] [P] Extend `frontend/lib/api.ts` with tag endpoints: getTags(), createTag(data), updateTag(id, data), deleteTag(id)
- [x] [T071] [P] Extend `frontend/lib/api.ts` with subtask endpoints: createSubtask(taskId, data), updateSubtask(id, data), deleteSubtask(id)
- [x] [T072] [P] Extend `frontend/lib/api.ts` with analytics endpoints: getDashboardAnalytics(period), getStreak()
- [x] [T073] [P] Extend `frontend/lib/api.ts` with settings endpoints: getSettings(), updateSettings(data)
- [x] [T074] [P] Extend `frontend/lib/api.ts` with export endpoint: exportData(format)
- [x] [T075] [US3] Extend `frontend/lib/hooks/useTasks.ts` to include optimistic updates, conflict handling with version field, retry logic on 409 (FR-103, Clarification Q2) (research.md:402-426)
- [x] [T076] [P] [US2] Create `frontend/lib/hooks/useTags.ts` with getTags, createTag, updateTag, deleteTag with optimistic updates
- [x] [T077] [P] [US6] Create `frontend/lib/hooks/useSubtasks.ts` with createSubtask, updateSubtask, deleteSubtask with optimistic updates
- [x] [T078] [P] [US2] Create `frontend/lib/hooks/useSettings.ts` with getSettings, updateSettings, syncing with SettingsContext
- [x] [T079] [P] [US13] Create `frontend/lib/hooks/useAnalytics.ts` with getDashboard, getStreak
- [x] [T080] [P] Add error handling with toast notifications (sonner) for all API failures (FR-100)
- [x] [T081] [P] Write Jest tests for all hooks including optimistic update rollback on error

**Acceptance**: All API client functions work, hooks provide optimistic updates, conflict dialog shows on 409, error toasts display, tests pass.

---

## Phase 10: shadcn/ui Components Installation

**Purpose**: Install needed shadcn/ui components

**Dependencies**: Phase 0 complete (can run parallel with Phases 8-9)

- [x] [T082] [P] Install shadcn/ui components: `npx shadcn@latest add button dialog select calendar checkbox badge tabs popover sonner command` (quickstart.md:196-208)
- [x] [T083] [P] Verify all components installed in `frontend/components/ui/` directory
- [x] [T084] [P] Test each component in isolation to ensure React 19 compatibility (no console errors)
- [x] [T085] [P] Configure sonner toast provider in `frontend/app/layout.tsx` (research.md:268-277)

**Acceptance**: All 9 shadcn components installed without errors, sonner toaster rendered in layout, components functional.

---

## Phase 11: Core UI Components - Tasks

**Purpose**: Build/extend task-related components

**Dependencies**: Phase 8, 9, 10 complete

- [x] [T086] [US1] Extend `frontend/components/tasks/TaskCard.tsx` to display priority badge with color (Red/Yellow/Blue/Gray), tags as colored badges, subtask progress (2/5 completed), due date with overdue styling (FR-001, FR-002, FR-012, FR-018, FR-038) (plan.md:211-215)
- [x] [T087] [US1] Create `frontend/components/tasks/PriorityBadge.tsx` with color mapping: high=red, medium=yellow, low=blue, none=gray using shadcn Badge (FR-002)
- [x] [T088] [US1] Extend `frontend/components/tasks/TaskForm.tsx` to include priority selector (Select), due date picker (Calendar in Popover), tag multi-select, recurrence pattern fields (FR-001, FR-011, FR-017, FR-072)
- [x] [T089] [US6] Create `frontend/components/tasks/SubtaskList.tsx` with expandable/collapsible checklist, progress indicator (3/7), individual checkbox toggles (FR-037, FR-038, FR-040)
- [x] [T090] [US8] Create `frontend/components/tasks/BulkActionsToolbar.tsx` appearing when tasks selected, with buttons: Mark Complete, Change Priority, Add Tags, Delete (FR-047, FR-048)
- [x] [T091] [US1] Extend `frontend/components/tasks/TaskList.tsx` to include checkboxes for selection, bulk toolbar integration (FR-046, FR-047)
- [x] [T092] Write Storybook stories for all task components with various states (high priority, overdue, subtasks)
- [x] [T093] Write Jest tests for TaskCard, PriorityBadge, TaskForm, SubtaskList, BulkActionsToolbar

**Acceptance**: All task components render correctly, priority colors match spec, subtask progress calculates, bulk toolbar appears on selection, tests pass.

---

## Phase 12: Core UI Components - Tags & Shared

**Purpose**: Build tag components and shared UI elements

**Dependencies**: Phase 8, 9, 10 complete (can run parallel with Phase 11)

- [x] [T094] [P] [US4] Create `frontend/components/tags/TagManager.tsx` as Dialog with tag list, create form (name + color picker), edit/delete buttons, 100 tag limit warning (FR-016, FR-020, FR-106)
- [x] [T095] [P] [US4] Create `frontend/components/tags/TagBadge.tsx` displaying tag name with custom background color from hex code (FR-018)
- [x] [T096] [P] [US4] Create `frontend/components/tags/TagFilter.tsx` as multi-select dropdown with tag badges, AND logic for filtering (FR-019)
- [x] [T097] [P] [US2] Create `frontend/components/shared/ThemeToggle.tsx` as button with sun/moon icon, 180deg rotation animation on toggle (FR-007, FR-087) (quickstart.md:314-333)
- [x] [T098] [P] [US5] Create `frontend/components/shared/ViewModeTabs.tsx` with 4 tabs (List/Kanban/Calendar/Matrix), active state styling, 300ms transition (FR-023, FR-024)
- [x] [T099] [P] [US9] Create `frontend/components/shared/SearchBar.tsx` with real-time filtering (300ms debounce), 200 char limit, clear button (FR-051, FR-055)
- [x] [T100] [P] [US2] Create `frontend/components/shared/SettingsPanel.tsx` as Dialog with all 7 user preference inputs (theme, default_view, date_format, week_start_day, animations, pomodoro timers) (FR-091 to FR-095)
- [x] [T101] [P] Write Storybook stories for all shared components
- [x] [T102] [P] Write Jest tests for TagManager CRUD, TagFilter logic, ThemeToggle state, SearchBar debounce

**Acceptance**: Tag manager creates/edits/deletes tags, tag filter works with AND logic, theme toggle animates, search debounces, settings panel saves, tests pass.

---

## Phase 13: View Mode Components - List & Kanban

**Purpose**: Implement List and Kanban view modes with drag-and-drop

**Dependencies**: Phase 11, 12 complete

- [x] [T103] [US7] Create `frontend/components/views/ListView.tsx` using @dnd-kit SortableContext with verticalListSortingStrategy, integrating TaskList with drag handles (FR-041 to FR-045) (quickstart.md:358-401, research.md:174-184)
- [x] [T104] [US7] Implement drag visual feedback: rotation (2deg), scale (1.05), elevated shadow during drag (FR-042) using Motion transforms
- [x] [T105] [US7] Implement drop animation with spring physics (stiffness 300, damping 30) (FR-043) (quickstart.md:327-333)
- [x] [T106] [US7] Save custom_order to database on drop using PATCH /tasks/{id} with new order value (FR-044)
- [x] [T107] [US7] Show shake animation (rotate -5deg to 5deg x3) for invalid drop targets (FR-045)
- [x] [T108] [US5] Create `frontend/components/views/KanbanView.tsx` with 3 droppable columns (To Do / In Progress / Done), task counts in headers (FR-026, FR-028)
- [x] [T109] [US5] Implement drag-and-drop between columns using @dnd-kit DndContext with closestCenter collision detection, allow direct To Do → Done transitions (FR-027, Clarification Q5)
- [x] [T110] [US5] Update task status on drop: todo/in_progress/done via PATCH /tasks/{id} (FR-030)
- [x] [T111] [US5] Animate task movement between columns with spring physics (FR-029)
- [x] [T112] Add keyboard sensor to both views for accessibility (Space to pick up, arrow keys to move) (FR-097, SC-023) (quickstart.md:366-368)
- [x] [T113] Write Playwright E2E tests for drag-and-drop in both List and Kanban views

**Acceptance**: List view allows reordering with animations, order persists, Kanban allows column transitions, status updates, keyboard navigation works, E2E tests pass.

---

## Phase 14: View Mode Components - Calendar & Matrix

**Purpose**: Implement Calendar and Matrix view modes

**Dependencies**: Phase 11, 12 complete (can run parallel with Phase 13)

- [x] [T114] [P] [US10] Create `frontend/components/views/CalendarView.tsx` using date-fns for month grid generation, displaying tasks on due_date cells (FR-031) (quickstart.md:408-425)
- [x] [T115] [P] [US10] Color-code tasks in calendar cells by priority (red/yellow/blue/gray) (FR-032)
- [x] [T116] [P] [US10] Add previous/next month navigation buttons (FR-033)
- [x] [T117] [P] [US10] Implement click-on-empty-date to create task with pre-filled due_date (FR-034)
- [x] [T118] [P] [US10] Add "Unscheduled" section below calendar for tasks with null due_date (FR-035)
- [x] [T119] [P] [US15] Create `frontend/components/views/MatrixView.tsx` with 2x2 grid layout (Urgent/Not Urgent x Important/Not Important axes) (FR-077)
- [x] [T120] [P] [US15] Implement drag-and-drop between 4 quadrants using @dnd-kit (FR-078)
- [x] [T121] [P] [US15] Auto-adjust task priority on quadrant drop: Urgent+Important=high, Urgent+NotImportant=medium, NotUrgent+Important=low, NotUrgent+NotImportant=none (FR-079)
- [x] [T122] [P] [US15] Display task counts in each quadrant header (FR-080)
- [x] [T123] [P] Write Playwright E2E tests for Calendar date clicking, Matrix quadrant dragging

**Acceptance**: Calendar shows tasks on due dates, month navigation works, click creates task, unscheduled section displays, Matrix auto-adjusts priority, E2E tests pass.

---

## Phase 15: Productivity Components

**Purpose**: Implement Pomodoro timer, time tracker, dashboard

**Dependencies**: Phase 11, 12 complete (can run parallel with Phases 13-14)

- [x] [T124] [P] [US11] Create `frontend/components/productivity/PomodoroTimer.tsx` with 25min work / 5min break countdown, sound alerts on completion, 4-session tracking for 15min long break (FR-056 to FR-061)
- [x] [T125] [P] [US11] Use Web Worker for timer to continue in background when tab inactive (Edge case: Pomodoro in background)
- [x] [T126] [P] [US11] Load timer intervals from user settings (pomodoro_work_minutes, pomodoro_break_minutes) (FR-093)
- [x] [T127] [P] [US12] Create `frontend/components/productivity/TimeTracker.tsx` with start/stop button, elapsed time display (HH:MM:SS), accumulate time_spent on task (FR-062 to FR-066)
- [x] [T128] [P] [US12] Save time_spent to database via PATCH /tasks/{id} on stop (FR-064)
- [x] [T129] [P] [US13] Create `frontend/components/productivity/Dashboard.tsx` using Recharts for 4 charts: LineChart (completion trends), PieChart (priority distribution), BarChart (category breakdown), custom streak display (FR-067 to FR-071) (research.md:313-317)
- [x] [T130] [P] [US13] Fetch analytics data from GET /analytics/dashboard and GET /analytics/streak (FR-070)
- [x] [T131] [P] [US13] Add period selector (week/month/year/all) for trend chart
- [x] [T132] [P] Write Jest tests for PomodoroTimer state machine, TimeTracker accumulation, Dashboard chart data transformations

**Acceptance**: Pomodoro timer counts down correctly, sound plays on completion, long break after 4 sessions, time tracker accumulates, dashboard charts render with real data, tests pass.

---

## Phase 16: Animations & Polish

**Purpose**: Implement all animations using Motion library

**Dependencies**: All view components (Phases 11-15) complete

- [x] [T133] Create `frontend/components/animations/transitions.tsx` with Motion variants for all animations: pageTransition (300ms fade), taskAdd (spring slide from top), taskDelete (scale + fade + slide left 300ms), hoverLift (2px + shadow 200ms), modalOpen (backdrop fade + scale 0.95 + slide up 10px 200ms), themeToggle (300ms color transition), skeletonShimmer (FR-081 to FR-089)
- [x] [T134] [US1] Apply taskAdd animation to new tasks using `<motion.div initial="hidden" animate="visible" variants={taskAdd}>` (FR-082)
- [x] [T135] [US1] Apply taskDelete animation to removed tasks with AnimatePresence and exit prop (FR-083)
- [x] [T136] [US1] Apply hoverLift animation to TaskCard using `whileHover` prop (FR-085)
- [x] [T137] [US2] Apply themeToggle animation to all UI elements using Motion layoutId for smooth color transitions (FR-087)
- [x] [T138] [US2] Add 180deg rotation to sun/moon icon in ThemeToggle button (FR-087)
- [x] [T139] Apply modalOpen animation to all Dialog components (tag manager, settings, confirmations) (FR-086)
- [x] [T140] Create skeleton loaders with shimmer effect for task list, dashboard charts during loading states (FR-088) using Motion and CSS gradients
- [x] [T141] Add checkbox draw animation (stroke-dashoffset) and text strikethrough transition (200ms) for task completion toggle (FR-084)
- [x] [T142] Implement `prefers-reduced-motion` media query detection to disable animations if user preference set (FR-097)
- [x] [T143] Test all animations achieve 60fps using Chrome DevTools Performance tab (FR-096, SC-007)
- [x] [T144] Write Playwright visual regression tests for key animations (task add/delete, theme toggle, drag-and-drop)

**Acceptance**: All 10 animation types implemented, respect reduced-motion, 60fps verified in DevTools, visual regression tests pass.

---

## Phase 17: Error Handling & Data Limits

**Purpose**: Implement conflict dialogs, rate limit warnings, data limit enforcement

**Dependencies**: All backend APIs (Phases 3-7) and frontend hooks (Phase 9) complete

- [x] [T145] [US3] Create conflict resolution dialog component showing "Task was modified elsewhere" with two buttons: "Keep My Changes" (force update) or "Reload Latest" (refetch) (FR-103, Clarification Q2) (data-model.md:520-535)
- [x] [T146] [US3] Trigger conflict dialog when useTasks hook receives 409 response, pass latest_data to dialog for comparison
- [x] [T147] Implement rate limit warning toast when receiving 429 response, showing retry-after time from header (FR-104, Edge case)
- [x] [T148] Implement 90% data limit warning banner for tasks (9,000 tasks), tags (90 tags), subtasks (45 subtasks) using persistent banner component (FR-105)
- [x] [T149] Implement 100% data limit blocking modal with suggested actions: "Delete unused tags", "Archive completed tasks", "Export data" (FR-106)
- [x] [T150] Add task/tag/subtask counts to user settings context, refresh on create/delete operations
- [x] [T151] Show limit warnings/blocks before attempting create operations (optimistic UI)
- [x] [T152] Write Playwright E2E tests for conflict dialog flow, rate limit toast, data limit warnings

**Acceptance**: Conflict dialog shows on 409 with latest data, rate limit toast displays with countdown, 90% warning appears, 100% blocks creation, E2E tests pass.

---

## Phase 18: Final Integration & Testing

**Purpose**: End-to-end testing, performance optimization, deployment preparation

**Dependencies**: All previous phases complete

- [x] [T153] Create main dashboard page at `frontend/app/dashboard/page.tsx` integrating ViewModeTabs, SearchBar, ThemeToggle, TaskList/Kanban/Calendar/Matrix views based on ViewContext
- [x] [T154] Add AIDO logo (WebsiteLogo.png) to navbar, login page, register page, favicon (FR-102)
- [x] [T155] Implement responsive layout for mobile (320px), tablet (768px), desktop (1024px+) breakpoints (FR-098, SC-025)
- [x] [T156] Test touch gestures on mobile device: long-press drag, swipe, pinch (FR-099, SC-026)
- [x] [T157] Run Lighthouse accessibility audit, ensure all scores ≥90 (SC-023, SC-024, SC-027)
- [x] [T158] Run Lighthouse performance audit, ensure score ≥90, check metrics: initial load <2s on 4G, 500 task list renders <3s (SC-008, SC-012)
- [x] [T159] Test keyboard navigation: Tab order, Enter/Space activation, Escape dismissal, arrow key drag (SC-023)
- [x] [T160] Test screen reader (NVDA/JAWS) announcements for all task operations (create, update, delete, drag) (SC-024)
- [x] [T161] Verify WCAG 2.1 AA color contrast ratios in both light and dark themes using axe DevTools (SC-027)
- [x] [T162] Run bundle analyzer to check bundle size, ensure initial load <500KB gzipped (research.md:448-457)
- [x] [T163] Implement code splitting for heavy components: Dashboard (Recharts), CalendarView, MatrixView using React.lazy() (FR-101)
- [x] [T164] Test real-time search performance with 1000 tasks, ensure results <500ms (SC-009)
- [x] [T165] Test bulk operations with 50 tasks, ensure completion <5s with progress feedback (SC-010)
- [x] [T166] Test view switching speed (List→Kanban→Calendar→Matrix), ensure <800ms per transition (SC-011)
- [x] [T167] Write comprehensive Playwright E2E test suite covering all 15 user stories' acceptance scenarios
- [x] [T168] Run full test suite (Jest unit + integration, Playwright E2E) and fix any failures
- [x] [T169] Update frontend .env with production API URL (HuggingFace Spaces backend)
- [x] [T170] Build and test production bundle: `npm run build && npm run start`
- [x] [T171] Deploy frontend to GitHub Pages: `npm run build && npm run export && git subtree push --prefix out origin gh-pages`
- [x] [T172] Deploy backend to HuggingFace Spaces: `git push hf main` (ensure Dockerfile and environment variables configured)
- [x] [T173] Test deployed application end-to-end with production URLs
- [x] [T174] Create comprehensive README with setup instructions, features list, screenshots

**Acceptance**: All 15 user stories pass E2E tests, performance metrics met, accessibility scores ≥90, production deployment successful, documentation complete.

---

## Dependency Graph

```
Phase 0 (Setup)
    ↓
Phase 1 (DB Migration)
    ↓
Phase 2 (Models/Schemas)
    ↓
    ├→ Phase 3 (Tags API) ────┐
    ├→ Phase 4 (Subtasks API) ─┤
    ├→ Phase 6 (Settings/Analytics) ─┤
    └→ Phase 7 (Rate Limiting) ──────┤
    ↓                                 ↓
Phase 5 (Extended Tasks API) ←───────┘
    ↓
Phase 0 (Setup - parallel)
    ↓
    ├→ Phase 8 (Contexts) ──┐
    ├→ Phase 10 (shadcn) ───┤
    └→ Phase 9 (API Hooks) ──┤
         ↓                   ↓
         └────────────→ Phase 11 (Task Components) ←──┐
                         ↓                             │
                    Phase 12 (Tag/Shared Components) ──┘
                         ↓
                    ├→ Phase 13 (List/Kanban) ──┐
                    ├→ Phase 14 (Calendar/Matrix) ─┤
                    └→ Phase 15 (Productivity) ────┤
                         ↓                         ↓
                    Phase 16 (Animations) ←────────┘
                         ↓
                    Phase 17 (Error Handling)
                         ↓
                    Phase 18 (Integration & Deploy)
```

---

## Parallel Execution Opportunities

**Backend (can run in parallel)**:
- Phase 3 (Tags), Phase 4 (Subtasks), Phase 6 (Settings/Analytics), Phase 7 (Rate Limiting) all independent after Phase 2

**Frontend (can run in parallel)**:
- Phase 8 (Contexts), Phase 9 (Hooks), Phase 10 (shadcn) all independent after Phase 0
- Phase 13 (List/Kanban), Phase 14 (Calendar/Matrix), Phase 15 (Productivity) all independent after Phases 11-12

**Maximum Parallelism**:
- Backend: 4 streams (Phases 3, 4, 6, 7)
- Frontend: 3 streams (Phases 8, 9, 10), then 3 streams (Phases 13, 14, 15)

---

## Story Completion Order (Priority-Based)

**Priority 1 (P1)** - Critical Features:
- **US1** (Task Priority Management): Phases 5, 11, 16 → Tasks T040-T049, T086-T093, T134-T136
- **US2** (Dark/Light Theme Toggle): Phases 6, 8, 12, 16 → Tasks T050-T052, T063, T066, T097, T137-T138

**Priority 2 (P2)** - High Value:
- **US3** (Due Date Management): Phases 5, 9, 11, 17 → Tasks T042-T044, T075, T088, T145-T146
- **US4** (Custom Tags): Phases 3, 9, 11, 12 → Tasks T026-T032, T076, T088, T094-T096
- **US5** (Kanban Board): Phases 8, 11, 12, 13 → Tasks T064, T098, T108-T111

**Priority 3 (P3)** - Nice to Have:
- **US6** (Subtask Checklists): Phases 4, 9, 11 → Tasks T033-T039, T077, T089
- **US7** (Drag-and-Drop Reordering): Phase 13 → Tasks T103-T107, T112
- **US8** (Bulk Task Actions): Phases 5, 11 → Tasks T045-T046, T090
- **US9** (Advanced Search/Filtering): Phases 5, 8, 12 → Tasks T040-T041, T047, T065, T099
- **US10** (Calendar View): Phase 14 → Tasks T114-T118
- **US11** (Pomodoro Timer): Phase 15 → Tasks T124-T126

**Priority 4 (P4)** - Supplementary:
- **US12** (Task Time Tracking): Phase 15 → Tasks T127-T128
- **US13** (Productivity Dashboard): Phases 6, 9, 15 → Tasks T053-T055, T079, T129-T131
- **US14** (Recurring Tasks): Phases 5, 11 → Tasks T042 (recurrence_pattern support), T088
- **US15** (Matrix View): Phase 14 → Tasks T119-T122

---

## File Reference Map

**Backend Files**:
- `backend/models/`: task.py (T017), tag.py (T018), subtask.py (T019), user_settings.py (T020)
- `backend/schemas/`: task.py (T021), tag.py (T022), subtask.py (T023), user_settings.py (T024), analytics.py (T025)
- `backend/routers/`: tags.py (T027-T030), subtasks.py (T034-T036), tasks.py (T040-T048), settings.py (T051-T052), analytics.py (T054-T056)
- `backend/services/`: tag_service.py (T026), subtask_service.py (T033), task_service.py (T041, T048), conflict_resolver.py (T044), settings_service.py (T050), analytics_service.py (T053)
- `backend/middleware/`: rate_limiter.py (T058-T061)
- `backend/alembic/versions/`: 001_enable_uuid.py (T007), 002_add_task_columns.py (T008), 003_create_tags.py (T009), 004_create_task_tags.py (T010), 005_create_subtasks.py (T011), 006_create_user_settings.py (T012), 007_create_indexes.py (T013)

**Frontend Files**:
- `frontend/contexts/`: ThemeContext.tsx (T063), ViewContext.tsx (T064), FilterContext.tsx (T065), SettingsContext.tsx (T066)
- `frontend/lib/`: api.ts (T070-T074), hooks/useTasks.ts (T075), hooks/useTags.ts (T076), hooks/useSubtasks.ts (T077), hooks/useSettings.ts (T078), hooks/useAnalytics.ts (T079)
- `frontend/components/ui/`: (shadcn components - T082)
- `frontend/components/tasks/`: TaskCard.tsx (T086), PriorityBadge.tsx (T087), TaskForm.tsx (T088), SubtaskList.tsx (T089), BulkActionsToolbar.tsx (T090), TaskList.tsx (T091)
- `frontend/components/tags/`: TagManager.tsx (T094), TagBadge.tsx (T095), TagFilter.tsx (T096)
- `frontend/components/shared/`: ThemeToggle.tsx (T097), ViewModeTabs.tsx (T098), SearchBar.tsx (T099), SettingsPanel.tsx (T100)
- `frontend/components/views/`: ListView.tsx (T103-T107), KanbanView.tsx (T108-T111), CalendarView.tsx (T114-T118), MatrixView.tsx (T119-T122)
- `frontend/components/productivity/`: PomodoroTimer.tsx (T124-T126), TimeTracker.tsx (T127-T128), Dashboard.tsx (T129-T131)
- `frontend/components/animations/`: transitions.tsx (T133-T144)
- `frontend/app/dashboard/`: page.tsx (T153)

---

**Task Breakdown Complete**: 174 tasks across 18 phases, all mapped to user stories, with dependencies and parallel execution identified.
