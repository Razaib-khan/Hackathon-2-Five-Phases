---
id: 0001
title: Advanced UI Features Planning
stage: plan
date: 2026-01-03
surface: agent
model: claude-sonnet-4-5-20250929
feature: 006-advanced-ui-features
branch: 006-advanced-ui-features
user: user
command: /sp.plan
labels: ["planning", "next.js-15", "react-19", "context7", "motion", "shadcn-ui", "dnd-kit"]
links:
  spec: specs/006-advanced-ui-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-advanced-ui-features/research.md
  - specs/006-advanced-ui-features/data-model.md
  - specs/006-advanced-ui-features/contracts/openapi.yaml
  - specs/006-advanced-ui-features/quickstart.md
  - specs/006-advanced-ui-features/plan.md
  - CLAUDE.md
tests:
  - Verified Motion library Next.js 15 compatibility via Context7
  - Verified shadcn/ui React 19 compatibility via Context7
  - Verified @dnd-kit usage patterns via Context7
  - Validated constitution compliance (all 9 principles PASS)
  - Confirmed database schema migration order
---

## Prompt

/sp.plan continue where you left but keep in mind to always prefer to use the context7 MCP server to fetch the latest documentation of the required libraries that works perfectly with the project's nextjs version more specifically 15+ IMPORTANT: Context7 is important

## Response snapshot

Successfully completed Phase 0 (Research) and Phase 1 (Design) of planning workflow for advanced UI features.

**Phase 0 - Research Completed:**
- Used Context7 MCP server to research Next.js 15+ and React 19 compatible libraries
- Selected Motion (/websites/motion-dev-docs) for animations - 85.5 benchmark score, Next.js App Router optimized
- Selected shadcn/ui (/llmstxt/ui_shadcn_llms_txt) for components - React 19 compatible with --force flag
- Selected @dnd-kit (/websites/next_dndkit) for drag-and-drop - 87.6 benchmark score, accessibility built-in
- Selected date-fns (/date-fns/date-fns) for date utilities - modular, tree-shakeable
- Documented all technical decisions with rationale, alternatives, and implementation guidance in research.md

**Phase 1 - Design Completed:**
1. **data-model.md**: Extended tasks table with 6 new columns (priority, due_date, status, time_spent, custom_order, recurrence_pattern, version). Created 4 new tables (tags, task_tags, subtasks, user_settings). Defined 7 indexes for performance optimization.

2. **contracts/openapi.yaml**: Complete REST API specification with 8 new endpoints (tags CRUD, subtasks CRUD, settings, analytics/dashboard, analytics/streak, export) and 6 extended endpoints (tasks GET with filtering, tasks POST with limits, tasks/{id} PATCH with conflict detection, tasks/bulk PATCH, tasks/bulk DELETE). Documented rate limiting headers (FR-104), conflict resolution 409 responses (FR-103), and data limit 403 responses (FR-105, FR-106).

3. **quickstart.md**: Step-by-step development setup guide with Next.js 15 + React 19 installation instructions, library installation commands with --force flag guidance, database migration steps, component usage examples from Context7 docs, troubleshooting section for peer dependency conflicts.

4. **plan.md**: Comprehensive implementation plan with constitution check (all 9 principles PASS), technical context, project structure (detailed frontend/backend file tree), risk analysis, success metrics, ADR suggestions, and next steps.

**Key Design Decisions:**
- Database: Optimistic locking with version column (Clarification Q2), composite primary keys for junction tables, cascade deletes for subtasks
- API: RESTful endpoints, combined filters with AND logic, bulk operations limited to 50 tasks
- Frontend: Four React Contexts (Theme, View, Filter, Settings), custom hooks with optimistic updates, component-based view modes
- State Management: Simple React Context + hooks (no Redux per YAGNI principle)
- Conflict Resolution: Version-based optimistic locking with HTTP 409 and user choice dialog
- Rate Limiting: Token bucket algorithm, 100 req/min per user (FR-104)
- Data Limits: Warning at 90% capacity, hard block at 100% with suggested actions (Clarification Q4)

**Context7 Integration:**
- Retrieved Motion installation and Next.js App Router usage patterns
- Retrieved shadcn/ui React 19 compatibility and --force flag requirements
- Retrieved @dnd-kit sortable list patterns with useSortable hook
- Retrieved date-fns function imports for date manipulation
- All libraries verified compatible with Next.js 15+ and React 19

**Constitution Compliance:**
- ✅ All 9 principles validated in Pre-Phase 0 and Post-Phase 1 checks
- ✅ No overengineering: Simple state management, stateless backend
- ✅ Used tools for research: Context7 MCP server for library documentation
- ✅ Sequential execution: Phase 0 → Phase 1 completed in order
- ✅ Specification-driven: All design artifacts derived from spec.md requirements

## Outcome

- ✅ Impact: Created comprehensive implementation plan with 106 functional requirements mapped to 4 design artifacts (research, data-model, contracts, quickstart), using Context7 to verify Next.js 15+ and React 19 compatibility for all libraries
- 🧪 Tests: Validated constitution compliance (9/9 principles PASS), verified library compatibility via Context7 queries, confirmed database schema migration order dependencies
- 📁 Files: Created 5 artifacts - research.md (technical decisions), data-model.md (6 extended columns + 4 new tables), contracts/openapi.yaml (8 new + 6 extended endpoints), quickstart.md (dev setup), plan.md (comprehensive plan). Updated CLAUDE.md agent context.
- 🔁 Next prompts: Run `/sp.tasks` to generate dependency-ordered implementation tasks mapped to user stories and acceptance criteria
- 🧠 Reflection: Context7 integration was essential for ensuring Next.js 15+ and React 19 compatibility - prevented selecting outdated libraries and provided accurate installation/usage patterns. Motion's `motion/react-client` import optimization and shadcn/ui's `--force` requirement were critical discoveries from Context7 docs.

## Evaluation notes (flywheel)

- Failure modes observed: None - all Context7 queries successful, all planning artifacts generated without errors
- Graders run and results (PASS/FAIL): PASS - Constitution check validated all 9 principles, Context7 library compatibility verified, database schema dependencies ordered correctly
- Prompt variant (if applicable): User explicitly requested Context7 MCP server usage for library documentation lookup (Next.js 15+ compatibility focus)
- Next experiment (smallest change to try): Consider creating ADRs during Phase 2 task breakdown for the 4 identified architectural decisions (Motion vs Framer Motion, React Context vs Redux, Optimistic Locking, shadcn/ui copy-paste architecture) rather than deferring to implementation phase
