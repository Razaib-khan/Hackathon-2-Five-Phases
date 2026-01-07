# Research & Technical Decisions: Advanced UI Features

**Feature**: 006-advanced-ui-features
**Date**: 2026-01-03
**Phase**: 0 - Research & Context Gathering

## Overview

This document consolidates research findings and technical decisions for implementing advanced UI features including priority management, theming, multiple view modes, animations, and productivity tools for the AIDO Todo App.

---

## Technology Stack Decisions

### Frontend Framework

**Decision**: Next.js 15.1+ with React 19 and TypeScript

**Rationale**:
- Already established in the project (inherited from Phase 2)
- App Router architecture provides better performance and developer experience
- React 19 offers improved concurrent rendering for smooth animations
- TypeScript ensures type safety across complex state management

**Alternatives Considered**:
- N/A - existing project constraint

**Compatibility Notes**:
- Some libraries may require `--force` or `--legacy-peer-deps` flags for React 19
- All selected libraries below are verified compatible with React 19+

---

### Animation Library

**Decision**: Motion (by Framer Motion creators)

**Library ID**: `/websites/motion-dev-docs`

**Rationale**:
- **Modern & Lightweight**: Successor to Framer Motion, optimized for performance
- **Next.js 15 Optimized**: Provides `motion/react-client` import for App Router bundle size reduction
- **React 19 Compatible**: Explicitly supports React 18.2+ including React 19
- **Hardware Accelerated**: GPU-accelerated transforms ensure 60fps performance (FR-096, SC-007)
- **Rich Feature Set**: Supports layout animations, gestures, spring physics, scroll-linked effects
- **High Quality**: 1,486 code snippets, High source reputation, 85.5 benchmark score

**Installation**:
```bash
npm install motion
```

**Usage Pattern for Next.js App Router**:
```typescript
"use client"

import { motion } from "motion/react"
// OR for optimized bundle size:
import * as motion from "motion/react-client"

export default function AnimatedComponent() {
  return <motion.div animate={{ scale: 1.5 }} />
}
```

**Key Features for Requirements**:
- **FR-081 to FR-090**: All animation requirements (page transitions, task additions/deletions, hover states, modals, theme toggles, skeleton loaders)
- **SC-005, SC-007**: 60fps animation performance target
- **FR-097**: Accessibility support with reduced-motion media query detection

**Alternatives Considered**:
- **Framer Motion** (`/grx7/framer-motion`): Older library, larger bundle size, 327 snippets, 52.1 score
- **Motion-Primitives** (`/websites/motion-primitives`): Pre-built components but less flexible, 153 snippets, 36.9 score

**References**:
- Installation docs: https://github.com/context7/motion-dev-docs/blob/main/react-installation.md
- Next.js App Router integration: Requires `"use client"` directive for client components

---

### UI Component Library

**Decision**: shadcn/ui with Radix UI primitives and Tailwind CSS

**Library ID**: `/llmstxt/ui_shadcn_llms_txt`

**Rationale**:
- **Copy-Paste Architecture**: Components are copied into project (not npm dependency), ensuring full control
- **Accessibility First**: Built on Radix UI primitives with WCAG 2.1 AA compliance (SC-023, FR-097)
- **React 19 Compatible**: Officially supports React 19 with documented migration path
- **Tailwind Integration**: Seamlessly integrates with existing Tailwind CSS setup
- **Customizable**: Full control over component code for project-specific requirements
- **CLI Tool**: `npx shadcn@latest` provides easy component installation
- **High Quality**: 775 code snippets, High source reputation, 81.8 benchmark score

**Installation**:
```bash
# Initialize shadcn/ui (interactive)
npx shadcn@latest init -d

# For React 19, use --force flag when prompted
# Choose: Use --force
```

**Configuration** (`components.json`):
```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "rsc": false,
  "tsx": true,
  "aliases": {
    "utils": "~/lib/utils",
    "components": "~/components"
  }
}
```

**Required Dependencies**:
```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
```

**Key Components Needed**:
- **Button**: Priority badges, bulk action toolbar
- **Select/Dropdown**: Priority selector, tag selector, view mode tabs
- **Dialog**: Confirmation dialogs (tag deletion, bulk operations, conflict resolution)
- **Calendar**: Due date picker (FR-011)
- **Checkbox**: Subtask lists, bulk selection
- **Badge**: Priority indicators, tag display
- **Tabs**: View mode switching (List/Kanban/Calendar/Matrix)
- **Popover**: Tag management, settings panel
- **Toast**: Success/error notifications via sonner integration
- **Command**: Cmd+K command palette (via cmdk)

**Alternatives Considered**:
- **Material UI**: Heavier bundle, less customizable
- **Ant Design**: Not optimized for Next.js App Router
- **Chakra UI**: Smaller ecosystem, less TypeScript support

**References**:
- React 19 migration guide: https://ui.shadcn.com/docs/react-19
- Component registry: https://ui.shadcn.com/docs/components

---

### Drag-and-Drop Library

**Decision**: @dnd-kit (core + sortable + utilities)

**Library ID**: `/websites/next_dndkit`

**Rationale**:
- **Modern & Performant**: Built specifically for React hooks, lightweight architecture
- **Accessibility Built-in**: Keyboard navigation support (FR-098, SC-023, SC-026)
- **Multi-Input Support**: Mouse, touch, keyboard sensors (FR-099)
- **Modular Design**: Install only needed packages (@dnd-kit/core, @dnd-kit/sortable)
- **Rich APIs**: `useDraggable`, `useDroppable`, `useSortable` hooks
- **Collision Detection**: Multiple strategies (closestCenter, rectIntersection, etc.)
- **High Quality**: 385 code snippets, High source reputation, 87.6 benchmark score

**Installation**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Usage Pattern**:
```typescript
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
)
```

**Key Features for Requirements**:
- **FR-027**: Kanban drag-and-drop between columns
- **FR-041 to FR-045**: Task reordering in list view
- **FR-078**: Matrix view drag between quadrants
- **FR-043**: Spring physics animations via Motion integration
- **FR-044**: Touch device support
- **SC-005, SC-006**: 60fps drag performance, <2s completion

**Use Cases**:
1. **List View Reordering** (FR-041): `verticalListSortingStrategy` with `arrayMove`
2. **Kanban Columns** (FR-027): Multiple `Droppable` zones with status updates
3. **Matrix Quadrants** (FR-078): Grid-based droppable zones with priority auto-adjustment

**Alternatives Considered**:
- **react-beautiful-dnd**: Deprecated, not maintained, no React 19 support
- **react-dnd**: HTML5 backend, more complex API, heavier bundle

**References**:
- Sortable preset: https://github.com/context7/next_dndkit/blob/main/legacy/presets/sortable.md
- Core concepts: https://github.com/context7/next_dndkit

---

### Date Utilities

**Decision**: date-fns v3.5+

**Library ID**: `/date-fns/date-fns`

**Rationale**:
- **Modular & Tree-shakeable**: Import only needed functions, minimal bundle impact
- **Immutable**: Functional programming approach prevents date mutation bugs
- **Comprehensive**: 200+ functions for all date operations
- **TypeScript Native**: Full TypeScript support with strong typing
- **Timezone Support**: date-fns-tz extension available if needed
- **High Quality**: 58 code snippets, High source reputation, 57.9 benchmark score

**Installation**:
```bash
npm install date-fns
```

**Usage Pattern**:
```typescript
import { format, isAfter, isBefore, addDays, startOfWeek, endOfWeek } from 'date-fns'

// Format due dates
format(new Date(), 'MMM dd, yyyy') // "Jan 03, 2026"

// Check overdue
isAfter(new Date(), task.dueDate) // true if overdue

// Date range filters
startOfWeek(new Date()) // For "This Week" filter
```

**Key Features for Requirements**:
- **FR-011**: Calendar picker integration
- **FR-012**: Overdue detection via `isAfter`, `isBefore`
- **FR-013**: Date range filters (today, this week, this month)
- **FR-014**: Chronological sorting
- **FR-092**: Configurable date format preference

**Alternatives Considered**:
- **Moment.js**: Deprecated, large bundle size, mutable
- **Day.js**: Smaller but less comprehensive API
- **Luxon**: Timezone-first but heavier, more complex

---

### Additional Utility Libraries

#### Toast Notifications: sonner

**Decision**: sonner

**Rationale**:
- **Lightweight**: Minimal bundle size
- **shadcn/ui Compatible**: Pre-built shadcn component available
- **Beautiful Defaults**: Minimal configuration needed
- **Promise Support**: Show loading → success/error transitions

**Installation**:
```bash
npx shadcn@latest add sonner
```

**Use Cases**:
- Bulk operation success/failure (FR-048)
- Rate limit warnings (FR-104)
- Data limit warnings (FR-105)
- Conflict resolution feedback (FR-103)

---

#### Command Palette: cmdk

**Decision**: cmdk

**Rationale**:
- **By Radix Team**: Same team as shadcn/ui Radix primitives
- **Keyboard First**: Native Cmd+K experience
- **Accessible**: Built-in ARIA support
- **shadcn Component**: Available via `npx shadcn@latest add command`

**Use Cases**:
- Quick task creation
- Search across tasks
- Keyboard shortcuts for power users

---

#### Charting Library: Recharts

**Decision**: Recharts

**Rationale**:
- **React Native**: Built specifically for React
- **Declarative**: Component-based chart building
- **Responsive**: Mobile-friendly by default
- **Comprehensive**: Line, pie, bar charts for dashboard

**Installation**:
```bash
npm install recharts
```

**Use Cases** (FR-067 to FR-071):
- Line chart: Task completion trends
- Pie chart: Priority distribution
- Bar chart: Category breakdown
- Custom components: Streak tracking

---

## Backend Decisions

### API Framework

**Decision**: FastAPI (Python 3.11+)

**Rationale**:
- Already established in project (inherited from Phase 2)
- Fast async support for concurrent requests
- Automatic OpenAPI schema generation
- Native Pydantic validation

**No Changes Required**: Existing FastAPI setup continues

---

### Database

**Decision**: Neon PostgreSQL (Serverless)

**Rationale**:
- Already established in project
- Serverless architecture scales automatically
- Branching support for development/staging
- Compatible with psycopg3 for async operations

**Schema Extensions Required**:
- Add columns to `tasks` table: `priority`, `due_date`, `status`, `time_spent`, `custom_order`, `recurrence_pattern`
- New tables: `tags`, `task_tags`, `subtasks`, `user_settings`
- Indexes: `priority`, `due_date`, `status`, `tags.user_id`

---

### Authentication

**Decision**: JWT (existing implementation)

**Rationale**:
- Already implemented in Phase 2
- Stateless per Constitution Principle V
- Compatible with rate limiting (per-user identification)

**No Changes Required**: Reuse existing JWT middleware

---

## State Management Decisions

### Global State

**Decision**: React Context + hooks (no external library)

**Rationale**:
- **Simple Requirements**: Task list, user settings, theme preference
- **No Complex Async**: API calls handled by React Query pattern
- **Avoid Overengineering**: Constitution Principle IV (No premature abstraction)
- **React 19 Features**: Native use() hook for suspense

**Contexts Needed**:
1. **ThemeContext**: Light/dark mode (FR-006 to FR-010)
2. **ViewContext**: Active view mode (List/Kanban/Calendar/Matrix) (FR-022 to FR-025)
3. **FilterContext**: Active filters (priority, tags, dates, search) (FR-051 to FR-055)
4. **SettingsContext**: User preferences (FR-091 to FR-095)

**Alternatives Considered**:
- **Redux Toolkit**: Overkill for this scope, violates YAGNI
- **Zustand**: Unnecessary dependency when Context suffices
- **Jotai/Recoil**: Atomic state not needed for this app

---

### Server State (API Data)

**Decision**: Custom hooks with optimistic updates

**Rationale**:
- **Optimistic UI** (FR-099): Update UI before API confirms
- **Simple Pattern**: Custom `useTasks`, `useTags` hooks
- **Error Handling**: Built into each hook with rollback

**Pattern**:
```typescript
const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const updateTask = async (id, data) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? {...t, ...data} : t))
    try {
      await api.updateTask(id, data)
    } catch (error) {
      // Rollback on error
      setTasks(prev => /* restore original */)
      showToast.error(error.message)
    }
  }

  return { tasks, loading, updateTask }
}
```

**Alternatives Considered**:
- **React Query / TanStack Query**: Powerful but adds complexity, not needed for simple CRUD
- **SWR**: Similar reasoning, unnecessary dependency

---

## Performance Optimization Strategies

### Animation Performance (60fps requirement)

**Decisions**:
1. **GPU Acceleration**: Use `transform` and `opacity` CSS properties only
2. **will-change Hints**: Apply to frequently animated elements
3. **Lazy Loading**: Use `React.lazy()` and `Suspense` for heavy components (FR-101)
4. **Virtualization**: For task lists >100 items, use `react-window` or similar
5. **Debouncing**: Search input (300ms), view switches (300ms) (Edge case documented)

**Rationale**:
- Meets SC-007, SC-008, SC-011 performance targets
- Prevents animation jank (SC-032: <5% jank rate)
- Optimizes initial load (SC-012: <2s on 4G)

---

### Bundle Size Optimization

**Decisions**:
1. **Motion Import**: Use `motion/react-client` for App Router
2. **Tree-shaking**: Import only needed date-fns functions
3. **Dynamic Imports**: Load Recharts charts only when dashboard opens
4. **shadcn Components**: Install only needed components, not entire library

**Rationale**:
- Keeps initial bundle small
- Improves Time to Interactive
- Better mobile experience

---

## Accessibility Strategy

### WCAG 2.1 AA Compliance (SC-023, FR-097)

**Decisions**:
1. **ARIA Labels**: All interactive elements have `aria-label` or `aria-labelledby`
2. **Keyboard Navigation**: Tab order, Enter/Space activation, Escape dismissal
3. **Focus Management**: Visible focus rings, focus trapping in modals
4. **Color Contrast**: All text meets 4.5:1 ratio in both themes
5. **Screen Reader Testing**: Test with NVDA/JAWS

**Implementation**:
- shadcn/ui provides ARIA defaults
- @dnd-kit provides keyboard sensor
- Motion respects `prefers-reduced-motion`

**Testing**:
- Lighthouse accessibility audit
- Keyboard-only navigation test (SC-026)
- Screen reader announcement test (SC-024)

---

## Offline & Sync Strategy

### Limited Offline Support (FR-101)

**Decision**: Service Worker with cache-first strategy + sync queue

**Rationale**:
- **Cache-First**: Static assets (JS, CSS, images) cached
- **Network-First**: API calls attempt network, fallback to cache
- **Sync Queue**: Failed mutations queued in IndexedDB, retried on reconnect

**Scope**:
- Read operations work offline (view cached tasks)
- Write operations queued and synced when online
- Not full offline mode (out of scope per specification)

**Implementation**:
```typescript
// Sync queue in IndexedDB
const queueMutation = async (mutation) => {
  await db.syncQueue.add({ ...mutation, timestamp: Date.now() })
}

// On reconnect
window.addEventListener('online', async () => {
  const queue = await db.syncQueue.toArray()
  for (const mutation of queue) {
    await processMutation(mutation)
    await db.syncQueue.delete(mutation.id)
  }
})
```

---

## Testing Strategy

### Unit Testing

**Decision**: Jest + React Testing Library

**Rationale**:
- Already configured in Next.js
- Component-centric testing
- Accessibility queries built-in

**Coverage Targets**:
- Utility functions: 90%
- React hooks: 80%
- Components: 70%

---

### E2E Testing

**Decision**: Playwright

**Rationale**:
- Fast execution
- Multi-browser support
- Built-in wait strategies
- Better than Cypress for App Router

**Key Test Scenarios**:
- Task CRUD with all fields (priority, tags, due date, subtasks)
- View switching (List → Kanban → Calendar → Matrix)
- Drag-and-drop in all contexts
- Keyboard navigation
- Bulk operations

---

## Security Decisions

### Rate Limiting (FR-104)

**Decision**: Token bucket algorithm with Redis

**Rationale**:
- Per-user limits (100 req/min)
- Distributed tracking across instances
- Configurable burst allowance

**Implementation**:
```python
from fastapi import HTTPException
from redis import Redis

redis_client = Redis()

async def rate_limit(user_id: str):
    key = f"rate_limit:{user_id}"
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, 60)  # 1 minute window
    if current > 100:
        raise HTTPException(429, headers={"Retry-After": "60"})
```

---

### Input Validation

**Decision**: Pydantic models (backend) + Zod schemas (frontend)

**Rationale**:
- Type-safe validation on both ends
- Prevent XSS, SQL injection
- Consistent error messages

**Example**:
```typescript
// Frontend (Zod)
const taskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['high', 'medium', 'low', 'none']),
  due_date: z.date().optional(),
})

// Backend (Pydantic)
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    priority: Literal['high', 'medium', 'low', 'none']
    due_date: Optional[datetime] = None
```

---

## Deployment Decisions

### Frontend Deployment

**Decision**: GitHub Pages (existing)

**Rationale**:
- Already configured
- Static export compatible
- Free hosting

**Build Command**:
```bash
npm run build
next export
```

---

### Backend Deployment

**Decision**: HuggingFace Spaces (existing)

**Rationale**:
- Already deployed in Phase 2
- Automatic scaling
- Built-in secrets management

**Environment Variables**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Token signing key
- `REDIS_URL`: Rate limiting storage (if needed)

---

## Migration Strategy

### Database Migrations

**Decision**: Alembic (Python)

**Rationale**:
- FastAPI standard
- Version-controlled migrations
- Rollback support

**Migration Plan**:
1. Add new columns to `tasks` table
2. Create `tags`, `task_tags`, `subtasks`, `user_settings` tables
3. Add indexes for performance
4. Backfill default values for existing records

**Example Migration**:
```python
def upgrade():
    op.add_column('tasks', sa.Column('priority', sa.String(10), default='none'))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime, nullable=True))
    op.add_column('tasks', sa.Column('status', sa.String(20), default='todo'))
    op.create_index('idx_task_priority', 'tasks', ['priority'])
```

---

## Open Questions & Risks

### Risks Identified

1. **React 19 Library Compatibility**
   - **Risk**: Some npm packages may have peer dependency conflicts
   - **Mitigation**: Use `--force` flag, test thoroughly, fallback to React 18 if critical issues
   - **Status**: Low risk - all selected libraries verified compatible

2. **Animation Performance on Low-End Devices**
   - **Risk**: 60fps target may not be achievable on older mobile devices
   - **Mitigation**: Implement `prefers-reduced-motion`, progressive enhancement, throttle animations
   - **Status**: Medium risk - requires device testing

3. **Database Query Performance at Scale**
   - **Risk**: Complex filtering (tags + priority + date) may slow down with 10k+ tasks
   - **Mitigation**: Database indexes, pagination, lazy loading, query optimization
   - **Status**: Medium risk - will monitor in production

4. **Bundle Size Growth**
   - **Risk**: Adding 14+ new components may increase bundle size beyond acceptable limits
   - **Mitigation**: Code splitting, dynamic imports, tree-shaking, bundle analysis
   - **Status**: Low risk - mitigation strategies defined

---

## Next Steps

**Phase 1 Actions**:
1. ✅ Create `data-model.md` with database schema extensions
2. ✅ Generate API contracts in `/contracts/` directory
3. ✅ Create `quickstart.md` for development setup
4. ✅ Update agent context with new technologies

**Phase 2 Actions** (via `/sp.tasks`):
1. Break down implementation into dependency-ordered tasks
2. Map tasks to user stories and acceptance criteria
3. Estimate effort and identify parallel work streams

---

## References

### Documentation Links

- **Motion**: https://github.com/context7/motion-dev-docs
- **shadcn/ui**: https://ui.shadcn.com
- **@dnd-kit**: https://github.com/context7/next_dndkit
- **date-fns**: https://date-fns.org
- **Next.js 15**: https://nextjs.org/docs
- **React 19**: https://react.dev

### Context7 Library IDs

- Motion: `/websites/motion-dev-docs`
- shadcn/ui: `/llmstxt/ui_shadcn_llms_txt`
- @dnd-kit: `/websites/next_dndkit`
- date-fns: `/date-fns/date-fns`

---

**Research Phase Complete**: All technical decisions documented with rationale, alternatives, and implementation guidance.
