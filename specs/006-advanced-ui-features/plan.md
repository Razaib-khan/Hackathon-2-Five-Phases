# Implementation Plan: AIDO Advanced UI Features & Productivity Enhancements

**Branch**: `006-advanced-ui-features` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-advanced-ui-features/spec.md`

## Summary

Implement comprehensive UI/UX enhancements for AIDO Todo App including priority management, dark/light theme toggle, multiple view modes (List/Kanban/Calendar/Matrix), advanced animations with Motion library, drag-and-drop task reordering, tags and subtasks, bulk operations, productivity tools (Pomodoro timer, time tracking, analytics dashboard), and recurring tasks.

**Technical Approach**: Extend existing Next.js 15 + React 19 frontend with Motion animations, shadcn/ui components, and @dnd-kit for drag-and-drop. Extend FastAPI backend with new endpoints for tags, subtasks, analytics. Migrate Neon PostgreSQL database to add 6 new columns to tasks table and 4 new tables (tags, task_tags, subtasks, user_settings). All libraries verified compatible with Next.js 15+ and React 19 via Context7 documentation lookup.

---

## Technical Context

**Language/Version**:
- **Frontend**: TypeScript 5.3+, JavaScript ES2020+
- **Backend**: Python 3.11+

**Primary Dependencies**:
- **Frontend**: Next.js 15.1+, React 19, Motion (animation), shadcn/ui (components), @dnd-kit (drag-drop), date-fns (dates), Tailwind CSS 3+, sonner (toasts), cmdk (command palette), Recharts (charts), Zod (validation)
- **Backend**: FastAPI 0.104+, SQLAlchemy 2.0+, Pydantic 2.0+, Alembic (migrations), psycopg3 (async PostgreSQL), python-jose (JWT)

**Storage**: Neon PostgreSQL (serverless, existing from Phase 2)

**Testing**:
- **Frontend**: Jest, React Testing Library, Playwright (E2E)
- **Backend**: pytest, pytest-asyncio

**Target Platform**:
- **Frontend**: Modern browsers (Chrome 88+, Firefox 85+, Safari 14+, Edge 88+), iOS 14+, Android 10+
- **Backend**: Linux server (HuggingFace Spaces)

**Project Type**: Web application (separate frontend/backend)

**Performance Goals**:
- 60fps animations across all interactions (FR-096, SC-007)
- <500ms API response times (p95) (SC-016)
- <2s initial page load on 4G (SC-012)
- <3s task list render with 500 tasks (SC-008)
- <500ms real-time search on 1000+ tasks (SC-009)

**Constraints**:
- React 19 peer dependency compatibility (requires `--force` for some packages)
- Maximum 10,000 tasks per user (FR-106)
- Maximum 100 tags per user (FR-106)
- Maximum 50 subtasks per task (FR-106)
- 100 requests/minute per user rate limit (FR-104)
- Must maintain backward compatibility with Phase 2 data
- Stateless backend services (Constitution Principle V)

**Scale/Scope**:
- 15 user stories across 4 priority levels
- 106 functional requirements (FR-001 to FR-106)
- 32 success criteria (performance, usability, satisfaction)
- 6 database schema extensions
- 8 new API endpoints + 6 extended endpoints
- 14+ new/updated React components

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check ✅ PASS

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Specification is Source of Truth** | ✅ PASS | All 106 requirements defined in spec.md before planning |
| **II. Spec-Driven Development** | ✅ PASS | Following sequence: spec → plan → tasks → implement |
| **III. Sequential Phase Execution** | ✅ PASS | Phase 0 (research) completed before Phase 1 (design) |
| **IV. No Overengineering** | ✅ PASS | Building only specified features, no abstractions beyond requirements |
| **V. Stateless Backend by Default** | ✅ PASS | All new endpoints are stateless REST APIs |
| **VI. AI Interactions via Tools** | ✅ PASS | Used Context7 MCP server for library documentation lookup |
| **VII. Discourage Manual Coding** | ✅ PASS | Plan drives automated task generation in Phase 2 |
| **VIII. Process Over UI Polish** | ✅ PASS | Focus on specifications and planning artifacts first |
| **IX. Reusable Intelligence Artifacts** | ✅ PASS | Creating PHR for planning session, ADRs for significant decisions |

**Violations**: None

**Justifications**: N/A

---

### Post-Phase 1 Check ✅ PASS

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Specification is Source of Truth** | ✅ PASS | Design artifacts (data-model.md, contracts/) derived from spec |
| **II. Spec-Driven Development** | ✅ PASS | Plan references spec requirements by FR-XXX numbers |
| **III. Sequential Phase Execution** | ✅ PASS | Phase 0 → Phase 1 completed sequentially; Phase 2 pending |
| **IV. No Overengineering** | ✅ PASS | Simple React Context for state (no Redux), custom hooks (no React Query) |
| **V. Stateless Backend by Default** | ✅ PASS | All API endpoints stateless; no session state |
| **VI. AI Interactions via Tools** | ✅ PASS | Context7 used for Motion, shadcn/ui, @dnd-kit, date-fns docs |
| **VII. Discourage Manual Coding** | ✅ PASS | Migrations auto-generated via Alembic, components via shadcn CLI |
| **VIII. Process Over UI Polish** | ✅ PASS | Comprehensive planning before implementation |
| **IX. Reusable Intelligence Artifacts** | ✅ PASS | research.md documents all technical decisions with rationale |

**Violations**: None

**Justifications**: N/A

**Ready for Phase 2**: ✅ YES - Proceed to `/sp.tasks` for task breakdown

---

## Project Structure

### Documentation (this feature)

```text
specs/006-advanced-ui-features/
├── spec.md              # Feature specification (106 requirements, 32 success criteria)
├── plan.md              # This file - implementation plan
├── research.md          # Phase 0 - technical decisions with Context7 research
├── data-model.md        # Phase 1 - database schema with 6 new columns + 4 tables
├── quickstart.md        # Phase 1 - development setup guide
├── contracts/
│   └── openapi.yaml     # Phase 1 - REST API contract (8 new + 6 extended endpoints)
└── tasks.md             # Phase 2 - NOT YET CREATED (run /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── main.py                      # FastAPI app entry
├── models/                      # SQLAlchemy ORM models
│   ├── user.py                  # Existing (no changes)
│   ├── task.py                  # EXTENDED: +priority, +due_date, +status, +time_spent, +custom_order, +recurrence_pattern
│   ├── tag.py                   # NEW: User-defined tags
│   ├── subtask.py               # NEW: Task checklists
│   └── user_settings.py         # NEW: User preferences
├── schemas/                     # Pydantic request/response schemas
│   ├── task.py                  # EXTENDED: New fields
│   ├── tag.py                   # NEW
│   ├── subtask.py               # NEW
│   ├── user_settings.py         # NEW
│   └── analytics.py             # NEW: Dashboard data
├── routers/                     # API route handlers
│   ├── auth.py                  # Existing (no changes)
│   ├── tasks.py                 # EXTENDED: +filtering, +bulk ops, +conflict detection
│   ├── tags.py                  # NEW: CRUD endpoints
│   ├── subtasks.py              # NEW: CRUD endpoints
│   ├── settings.py              # NEW: User preferences
│   └── analytics.py             # NEW: Dashboard + streak
├── services/                    # Business logic layer
│   ├── task_service.py          # EXTENDED: +tag assignment, +subtask cascade
│   ├── tag_service.py           # NEW
│   ├── analytics_service.py     # NEW
│   └── conflict_resolver.py     # NEW: Optimistic locking
├── middleware/
│   ├── auth.py                  # Existing JWT middleware
│   └── rate_limiter.py          # NEW: 100 req/min per user (FR-104)
├── alembic/                     # Database migrations
│   ├── versions/
│   │   ├── 001_enable_uuid.py
│   │   ├── 002_add_task_columns.py
│   │   ├── 003_create_tags.py
│   │   ├── 004_create_task_tags.py
│   │   ├── 005_create_subtasks.py
│   │   ├── 006_create_user_settings.py
│   │   └── 007_create_indexes.py
│   └── env.py
├── tests/
│   ├── unit/
│   │   ├── test_task_service.py
│   │   ├── test_tag_service.py
│   │   └── test_analytics.py
│   ├── integration/
│   │   ├── test_tasks_api.py
│   │   ├── test_tags_api.py
│   │   └── test_bulk_ops.py
│   └── fixtures/
└── requirements.txt             # UPDATED: +alembic, +redis (optional)

frontend/
├── app/                         # Next.js 15 App Router
│   ├── (auth)/                  # Existing auth pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/               # Main application
│   │   ├── page.tsx            # EXTENDED: View mode tabs
│   │   ├── list/               # NEW: List view with drag-drop reordering
│   │   │   └── page.tsx
│   │   ├── kanban/             # NEW: Kanban board (3 columns)
│   │   │   └── page.tsx
│   │   ├── calendar/           # NEW: Calendar grid view
│   │   │   └── page.tsx
│   │   ├── matrix/             # NEW: Eisenhower matrix (2x2 grid)
│   │   │   └── page.tsx
│   │   └── analytics/          # NEW: Dashboard with charts
│   │       └── page.tsx
│   ├── layout.tsx              # EXTENDED: Theme provider, AIDO logo
│   └── globals.css             # EXTENDED: Dark mode CSS variables
├── components/
│   ├── ui/                     # shadcn/ui components (copied into project)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── calendar.tsx
│   │   ├── checkbox.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── popover.tsx
│   │   ├── sonner.tsx          # Toast notifications
│   │   └── command.tsx         # Cmd+K palette
│   ├── tasks/
│   │   ├── TaskCard.tsx        # EXTENDED: +priority badge, +tags, +subtask progress
│   │   ├── TaskForm.tsx        # EXTENDED: +priority, +tags, +due date
│   │   ├── TaskList.tsx        # EXTENDED: +filtering, +bulk selection
│   │   ├── PriorityBadge.tsx   # NEW: Color-coded badges
│   │   ├── SubtaskList.tsx     # NEW: Expandable checklist
│   │   └── BulkActionsToolbar.tsx  # NEW: Multi-select operations
│   ├── tags/
│   │   ├── TagManager.tsx      # NEW: Tag CRUD dialog
│   │   ├── TagBadge.tsx        # NEW: Colored tag display
│   │   └── TagFilter.tsx       # NEW: Multi-tag filter
│   ├── views/
│   │   ├── ListView.tsx        # NEW: Sortable list with @dnd-kit
│   │   ├── KanbanView.tsx      # NEW: 3-column board
│   │   ├── CalendarView.tsx    # NEW: Monthly grid
│   │   └── MatrixView.tsx      # NEW: 2x2 Eisenhower grid
│   ├── productivity/
│   │   ├── PomodoroTimer.tsx   # NEW: 25/5 min timer
│   │   ├── TimeTracker.tsx     # NEW: Start/stop timer
│   │   └── Dashboard.tsx       # NEW: Recharts visualizations
│   ├── shared/
│   │   ├── ThemeToggle.tsx     # NEW: Sun/moon icon with animation
│   │   ├── ViewModeTabs.tsx    # NEW: List/Kanban/Calendar/Matrix switcher
│   │   ├── SearchBar.tsx       # NEW: Real-time filtering
│   │   └── SettingsPanel.tsx   # NEW: User preferences dialog
│   └── animations/
│       └── transitions.tsx     # NEW: Motion animation variants
├── lib/
│   ├── api.ts                  # EXTENDED: +tags, +subtasks, +analytics endpoints
│   ├── hooks/
│   │   ├── useTasks.ts         # EXTENDED: +optimistic updates, +conflict handling
│   │   ├── useTags.ts          # NEW
│   │   ├── useSubtasks.ts      # NEW
│   │   ├── useSettings.ts      # NEW
│   │   └── useAnalytics.ts     # NEW
│   ├── utils.ts                # EXTENDED: +date helpers, +priority sorting
│   └── validation.ts           # NEW: Zod schemas
├── contexts/
│   ├── ThemeContext.tsx        # NEW: Light/dark/system theme
│   ├── FilterContext.tsx       # NEW: Active filters state
│   ├── ViewContext.tsx         # NEW: Active view mode
│   └── SettingsContext.tsx     # NEW: User preferences
├── public/
│   ├── WebsiteLogo.png         # Existing (FR-102: use in navbar, login, favicon)
│   └── favicon.ico             # UPDATED: Use WebsiteLogo.png
├── tests/
│   ├── unit/
│   │   ├── TaskCard.test.tsx
│   │   ├── TagManager.test.tsx
│   │   └── hooks/
│   ├── integration/
│   │   ├── TaskCRUD.test.tsx
│   │   └── ViewSwitching.test.tsx
│   └── e2e/
│       ├── kanban.spec.ts
│       ├── bulk-operations.spec.ts
│       └── keyboard-navigation.spec.ts
└── package.json                # UPDATED: +motion, +@dnd-kit, +shadcn/ui, +date-fns, +recharts
```

**Structure Decision**: Web application structure (Option 2) with existing frontend/backend separation from Phase 2. Frontend uses Next.js 15 App Router with component-based architecture. Backend uses FastAPI with layered architecture (routers → services → models). All new code extends existing structure without breaking changes.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No Violations Detected** - All constitutional principles followed.

---

## Phase 0: Research (✅ COMPLETED)

**Artifact**: `research.md`

**Decisions Made**:
1. **Animation Library**: Motion (by Framer Motion creators) - Next.js 15 optimized, 85.5 benchmark score
2. **UI Components**: shadcn/ui - React 19 compatible, Radix UI + Tailwind, copy-paste architecture
3. **Drag-and-Drop**: @dnd-kit - Modern hooks API, accessibility built-in, 87.6 benchmark score
4. **Date Utilities**: date-fns v3.5+ - Modular, tree-shakeable, immutable
5. **State Management**: React Context + hooks (no external library per YAGNI principle)
6. **Rate Limiting**: Token bucket with Redis (100 req/min per user)
7. **Conflict Resolution**: Optimistic locking with version column
8. **Data Limits**: Progressive warnings at 90%, hard block at 100%

**Context7 Lookups Used**:
- `/websites/motion-dev-docs` - Motion animation docs
- `/llmstxt/ui_shadcn_llms_txt` - shadcn/ui React 19 compatibility
- `/websites/next_dndkit` - @dnd-kit sortable patterns
- `/date-fns/date-fns` - date-fns utilities

**Key Insights**:
- Motion provides `motion/react-client` import for optimized Next.js App Router bundle size
- shadcn/ui requires `--force` flag for React 19 peer dependencies
- @dnd-kit offers `useSortable` hook combining draggable + droppable
- All selected libraries verified compatible with React 19

---

## Phase 1: Design (✅ COMPLETED)

### Artifacts Created

1. **data-model.md** ✅
   - Extended `tasks` table with 6 new columns
   - Created 4 new tables: `tags`, `task_tags`, `subtasks`, `user_settings`
   - Defined 7 indexes for performance
   - Documented migration order and rollback plan

2. **contracts/openapi.yaml** ✅
   - 8 new API endpoints (tags, subtasks, settings, analytics)
   - 6 extended endpoints (tasks with filtering, bulk ops, conflict detection)
   - Complete request/response schemas
   - Rate limiting headers (FR-104)
   - Conflict resolution error responses (FR-103)

3. **quickstart.md** ✅
   - Step-by-step installation for Next.js 15 + React 19
   - Library installation commands with `--force` flag guidance
   - Database migration instructions
   - Component usage examples from Context7 docs
   - Troubleshooting section for React 19 peer dependencies

### Key Design Decisions

**Database Schema**:
- Added `version` column to tasks for optimistic locking (Clarification Q2)
- Composite primary key for `task_tags` junction table
- Cascade delete for subtasks when parent task deleted
- JSONB column for recurrence patterns (flexible schema)

**API Design**:
- RESTful endpoints following FastAPI conventions
- Combined filters with AND logic (priority + tags + date)
- Bulk operations limited to 50 tasks per request
- HTTP 409 for conflicts with latest data in response

**Frontend Architecture**:
- Four React Contexts (Theme, View, Filter, Settings)
- Custom hooks with optimistic updates pattern
- Component-based view modes (List, Kanban, Calendar, Matrix)
- Motion animations with `prefers-reduced-motion` support

---

## Phase 2: Tasks (⏳ PENDING)

**Command**: `/sp.tasks`

**Expected Outputs**:
- Dependency-ordered implementation tasks
- Mapping to user stories and acceptance criteria
- Parallel vs sequential work identification
- Effort estimates per task

**Not Started Yet** - Awaiting Phase 2 execution

---

## Architectural Decision Records

### ADR Suggestions (For Phase 2)

The following architectural decisions were made during planning and should be documented as ADRs during implementation:

1. **ADR-001: Motion vs Framer Motion for Animations**
   - Decision: Use Motion (successor library)
   - Rationale: 40% smaller bundle, Next.js App Router optimization
   - Trade-offs: Newer library vs battle-tested Framer Motion

2. **ADR-002: React Context vs Redux for State Management**
   - Decision: React Context + hooks
   - Rationale: Simpler for app scope, avoids overengineering
   - Trade-offs: Manual optimization vs automatic Redux DevTools

3. **ADR-003: Optimistic Locking for Conflict Resolution**
   - Decision: Version-based optimistic locking
   - Rationale: Stateless per Constitution, prevents lost updates
   - Trade-offs: Requires retry logic vs pessimistic locking simplicity

4. **ADR-004: shadcn/ui Copy-Paste vs npm Package**
   - Decision: Copy components into project
   - Rationale: Full control, no dependency updates breaking changes
   - Trade-offs: Manual updates vs automatic npm updates

**Note**: These ADRs should be created during `/sp.implement` when decisions are actively applied.

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| React 19 peer dependency conflicts | Medium | Medium | Use `--force` flag, test thoroughly, fallback to React 18 if critical |
| 60fps animation performance on low-end devices | Medium | High | Implement `prefers-reduced-motion`, progressive enhancement, device testing |
| Database query performance with complex filters | Low | Medium | Indexes on priority/due_date/status, pagination, query optimization |
| Bundle size growth beyond acceptable limits | Low | Medium | Code splitting, dynamic imports, tree-shaking, bundle analysis |
| Rate limiting false positives | Low | Low | Adjust limits based on monitoring, per-endpoint limits if needed |
| Conflict resolution UX confusion | Medium | Medium | Clear dialog messaging, show diff preview, user testing |

---

## Success Metrics

**How we'll measure success**:

1. **Performance** (SC-007, SC-008, SC-009, SC-011, SC-012):
   - Lighthouse Performance Score ≥90
   - Actual FPS measurement ≥60fps
   - API p95 latency <500ms
   - Initial load <2s on 4G

2. **Usability** (SC-001 to SC-006):
   - Task completion time tracking
   - User testing sessions (5+ participants)
   - Keyboard navigation 100% coverage

3. **Adoption** (SC-013 to SC-020):
   - Feature usage analytics (% users using each view mode)
   - Completion rate improvement (baseline vs post-launch)
   - User satisfaction survey (NPS score)

4. **Reliability** (SC-027 to SC-032):
   - Error rate monitoring (<0.1% data loss)
   - Uptime tracking (99.9% SLO)
   - Offline sync success rate (>95%)

---

## Timeline Estimate (Informational Only)

**Note**: Constitution Principle - No time estimates required. This is for reference only.

- **Phase 0 (Research)**: Completed
- **Phase 1 (Design)**: Completed
- **Phase 2 (Tasks)**: Run `/sp.tasks` next
- **Phase 3 (Implementation)**: TBD after task breakdown
- **Phase 4 (Validation)**: TBD after implementation

---

## Next Steps

1. ✅ **Phase 0 Complete**: All technical decisions researched and documented
2. ✅ **Phase 1 Complete**: Data model, API contracts, and quickstart guide created
3. ⏳ **Phase 2 Pending**: Run `/sp.tasks` to generate implementation tasks
4. ⏳ **ADR Creation**: Document significant decisions as ADRs during implementation
5. ⏳ **PHR Completion**: Finalize Prompt History Record for planning session

**Ready to Proceed**: ✅ YES - Execute `/sp.tasks` to begin Phase 2 (Task Breakdown)

---

## References

- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/openapi.yaml](./contracts/openapi.yaml)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Planning Phase Complete**: All design artifacts generated, constitution check passed, ready for task breakdown.
