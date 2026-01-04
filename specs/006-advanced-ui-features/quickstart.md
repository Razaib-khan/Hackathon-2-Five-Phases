# Quickstart Guide: Advanced UI Features

**Feature**: 006-advanced-ui-features
**Date**: 2026-01-03
**Phase**: 1 - Implementation Setup

---

## Prerequisites

### Required Software

- **Node.js**: v18.17+ or v20+ (LTS recommended)
- **Python**: 3.11+
- **npm** or **pnpm**: Latest version
- **PostgreSQL Client**: For database operations (psql or pgAdmin)
- **Git**: For version control

### Environment Setup

Ensure you have access to:
- **Neon PostgreSQL Database**: Connection string from Phase 2
- **HuggingFace Spaces**: For backend deployment
- **GitHub Pages**: For frontend deployment

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd "Hackathon 2 FIve Phases"
git checkout 006-advanced-ui-features
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Install Motion animation library (React 19 compatible)
npm install motion

# Install shadcn/ui (React 19 requires --force)
npx shadcn@latest init -d
# When prompted for React 19 peer dependencies: Choose "Use --force"

# Install shadcn/ui base dependencies
npm install class-variance-authority clsx tailwind-merge lucide-react

# Install dnd-kit for drag-and-drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Install date utilities
npm install date-fns

# Install additional utilities
npm install sonner  # Toast notifications
npm install cmdk    # Command palette
npm install recharts # Dashboard charts
npm install zod     # Frontend validation

# Development server
npm run dev
```

**Expected Output**: Frontend running at `http://localhost:3000`

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install additional dependencies for new features
pip install alembic  # Database migrations
pip install redis    # Rate limiting (optional)

# Development server
uvicorn main:app --reload --port 8000
```

**Expected Output**: Backend running at `http://localhost:8000`

---

## Database Migration

### Run Alembic Migrations

```bash
cd backend

# Create migration for new schema
alembic revision --autogenerate -m "Add advanced UI features schema"

# Review generated migration file in alembic/versions/

# Apply migration
alembic upgrade head
```

### Manual Migration (if needed)

```sql
-- Connect to Neon database
psql <your-neon-connection-string>

-- Run migrations from data-model.md in order:
\i migrations/001_enable_uuid.sql
\i migrations/002_add_task_columns.sql
\i migrations/003_create_tags.sql
\i migrations/004_create_task_tags.sql
\i migrations/005_create_subtasks.sql
\i migrations/006_create_user_settings.sql
\i migrations/007_create_indexes.sql
```

---

## Configuration

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
# API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
NEXT_PUBLIC_ENABLE_OFFLINE=true
```

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<database>?sslmode=require

# JWT
JWT_SECRET=<your-secret-key>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# Rate Limiting (optional)
REDIS_URL=redis://localhost:6379
RATE_LIMIT_PER_MINUTE=100

# CORS
CORS_ORIGINS=http://localhost:3000,https://<your-github-pages-url>
```

---

## Development Workflow

### 1. Start Development Servers

**Terminal 1** (Backend):
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

**Terminal 3** (Optional - Storybook for component development):
```bash
cd frontend
npm run storybook
```

### 2. Add shadcn/ui Components as Needed

```bash
# Add components you need for implementation
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add calendar
npx shadcn@latest add checkbox
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add popover
npx shadcn@latest add sonner  # Toast notifications
npx shadcn@latest add command # Command palette
```

### 3. Verify Installation

**Frontend Health Check**:
```bash
curl http://localhost:3000
# Should return Next.js app
```

**Backend Health Check**:
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

**Database Connection Check**:
```bash
curl http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer <your-jwt-token>"
# Should return tasks array
```

---

## Project Structure

```
Hackathon 2 FIve Phases/
├── frontend/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (auth)/              # Auth pages
│   │   ├── dashboard/           # Main app
│   │   │   ├── list/           # List view
│   │   │   ├── kanban/         # Kanban view
│   │   │   ├── calendar/       # Calendar view
│   │   │   ├── matrix/         # Matrix view
│   │   │   └── analytics/      # Dashboard
│   │   └── layout.tsx
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── tasks/              # Task-related components
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   └── SubtaskList.tsx
│   │   ├── tags/               # Tag components
│   │   ├── views/              # View mode components
│   │   │   ├── ListView.tsx
│   │   │   ├── KanbanView.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   └── MatrixView.tsx
│   │   └── shared/             # Shared components
│   ├── lib/                     # Utilities
│   │   ├── api.ts              # API client
│   │   ├── hooks/              # Custom hooks
│   │   └── utils.ts            # Helper functions
│   ├── contexts/                # React Context
│   │   ├── ThemeContext.tsx
│   │   ├── FilterContext.tsx
│   │   └── SettingsContext.tsx
│   └── public/
│       └── WebsiteLogo.png     # AIDO logo (FR-102)
│
├── backend/
│   ├── main.py                  # FastAPI app entry
│   ├── models/                  # SQLAlchemy models
│   │   ├── task.py
│   │   ├── tag.py
│   │   ├── subtask.py
│   │   └── user_settings.py
│   ├── schemas/                 # Pydantic schemas
│   │   ├── task.py
│   │   ├── tag.py
│   │   └── analytics.py
│   ├── routers/                 # API routes
│   │   ├── tasks.py
│   │   ├── tags.py
│   │   ├── subtasks.py
│   │   ├── settings.py
│   │   └── analytics.py
│   ├── services/                # Business logic
│   │   ├── task_service.py
│   │   ├── tag_service.py
│   │   └── analytics_service.py
│   ├── middleware/              # Middleware
│   │   ├── rate_limiter.py
│   │   └── auth.py
│   └── alembic/                 # Database migrations
│
└── specs/006-advanced-ui-features/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md (this file)
    └── contracts/
        └── openapi.yaml
```

---

## Key Libraries & Usage

### Motion (Animation)

```typescript
"use client"

import { motion } from "motion/react"
// OR for optimized bundle:
import * as motion from "motion/react-client"

export function AnimatedTask({ task }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {task.title}
    </motion.div>
  )
}
```

**Reference**: `/websites/motion-dev-docs` via Context7

### shadcn/ui Components

```typescript
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function TaskActions() {
  return (
    <div className="flex gap-2">
      <Badge variant="destructive">High Priority</Badge>
      <Button onClick={handleEdit}>Edit</Button>
    </div>
  )
}
```

**Reference**: `/llmstxt/ui_shadcn_llms_txt` via Context7

### @dnd-kit (Drag-and-Drop)

```typescript
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function SortableTaskList({ tasks, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id)
      const newIndex = tasks.findIndex(t => t.id === over.id)
      onReorder(arrayMove(tasks, oldIndex, newIndex))
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => <SortableTask key={task.id} task={task} />)}
      </SortableContext>
    </DndContext>
  )
}

function SortableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {task.title}
    </div>
  )
}
```

**Reference**: `/websites/next_dndkit` via Context7

### date-fns (Date Utilities)

```typescript
import { format, isAfter, isBefore, addDays, startOfWeek, endOfWeek } from 'date-fns'

export function formatDueDate(date: Date) {
  return format(date, 'MMM dd, yyyy') // "Jan 03, 2026"
}

export function isOverdue(dueDate: Date) {
  return isAfter(new Date(), dueDate)
}

export function getThisWeekRange() {
  return {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  }
}
```

**Reference**: `/date-fns/date-fns` via Context7

---

## Common Tasks

### Add a New Component

```bash
# Create component file
touch frontend/components/tasks/TaskPrioritySelector.tsx

# If using shadcn/ui base:
npx shadcn@latest add select
```

### Add a New API Endpoint

```python
# backend/routers/tasks.py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

@router.get("/{task_id}/time-logs")
async def get_time_logs(task_id: UUID, current_user: User = Depends(get_current_user)):
    # Implementation
    pass
```

### Run Database Migration

```bash
cd backend

# Create migration
alembic revision -m "Add time_logs table"

# Edit migration file in alembic/versions/

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### Test API Endpoint

```bash
# Get JWT token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# Test endpoint
curl http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

---

## Testing

### Frontend Unit Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- TaskCard.test.tsx
```

### Backend Unit Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test
pytest tests/test_tasks.py::test_create_task
```

### E2E Tests (Playwright)

```bash
cd frontend

# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Run specific test
npm run test:e2e -- tests/kanban.spec.ts
```

---

## Deployment

### Frontend (GitHub Pages)

```bash
cd frontend

# Build static export
npm run build
npm run export

# Deploy to GitHub Pages
git add out/
git commit -m "Deploy frontend"
git subtree push --prefix out origin gh-pages
```

### Backend (HuggingFace Spaces)

```bash
cd backend

# Ensure Dockerfile is present
# Push to HuggingFace repository
git push hf main

# Monitor deployment
# Visit: https://huggingface.co/spaces/<your-space>
```

---

## Troubleshooting

### React 19 Peer Dependency Warnings

**Issue**: npm warns about peer dependency conflicts

**Solution**:
```bash
npm install --force
# OR
npm install --legacy-peer-deps
```

### Motion Animation Not Working

**Issue**: Animations don't play

**Checklist**:
1. ✅ Component has `"use client"` directive
2. ✅ Using `motion/react-client` for App Router
3. ✅ Checking `prefers-reduced-motion` setting
4. ✅ Verifying GPU acceleration in DevTools

### Database Connection Errors

**Issue**: Cannot connect to Neon database

**Checklist**:
1. ✅ `DATABASE_URL` in `.env` is correct
2. ✅ Database allows connections from your IP
3. ✅ SSL mode is set to `require`
4. ✅ Migrations have been run

### Rate Limit 429 Errors

**Issue**: Getting "Too Many Requests" errors

**Solution**:
- Wait 60 seconds before retrying
- Check if Redis is running (if using distributed rate limiting)
- Verify rate limit configuration in backend

---

## Next Steps

1. **Complete Phase 2**: Run `/sp.tasks` to generate implementation tasks
2. **Review Contracts**: Validate API contracts in `contracts/openapi.yaml`
3. **Setup CI/CD**: Configure GitHub Actions for automated testing
4. **Performance Testing**: Benchmark 60fps animation requirement
5. **Accessibility Audit**: Run Lighthouse and keyboard navigation tests

---

## Resources

### Documentation

- **Motion**: https://github.com/context7/motion-dev-docs
- **shadcn/ui**: https://ui.shadcn.com
- **@dnd-kit**: https://github.com/context7/next_dndkit
- **date-fns**: https://date-fns.org
- **Next.js 15**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com

### Context7 Library IDs (for docs lookup)

- Motion: `/websites/motion-dev-docs`
- shadcn/ui: `/llmstxt/ui_shadcn_llms_txt`
- @dnd-kit: `/websites/next_dndkit`
- date-fns: `/date-fns/date-fns`

### Internal Documentation

- Specification: `specs/006-advanced-ui-features/spec.md`
- Research: `specs/006-advanced-ui-features/research.md`
- Data Model: `specs/006-advanced-ui-features/data-model.md`
- API Contracts: `specs/006-advanced-ui-features/contracts/openapi.yaml`

---

**Quickstart Guide Complete**: Ready for development!
