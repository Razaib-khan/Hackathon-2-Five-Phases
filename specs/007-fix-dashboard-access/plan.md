# Implementation Plan: Fix Dashboard Access and Routing

**Branch**: `007-fix-dashboard-access` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-fix-dashboard-access/spec.md`

## Summary

Fix critical client-side exception preventing dashboard access on GitHub Pages deployment, update authentication redirects to target correct `/dashboard` route, and ensure proper JWT token management with refresh capability. Primary fixes address Next.js static export incompatibilities (SSR-unsafe code, missing error boundaries) and incorrect routing logic (redirects to non-existent `/tasks` route).

**Technical Approach**:
1. Wrap dashboard route with ErrorBoundary component to catch rendering errors
2. Add SSR guards (`typeof window !== 'undefined'`) to all browser API access in context providers
3. Update authentication redirects from `/tasks` to `/dashboard` across 4 files
4. Implement JWT refresh token flow with localStorage-based expiration tracking
5. Add return URL preservation for post-login navigation

**Expected Outcome**: Users can access `/dashboard` directly without errors, login redirects correctly, and sessions persist for 7 days with automatic token refresh.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: Next.js 15 (App Router), React 18, motion/react (framer-motion fork), Tailwind CSS
**Storage**: Client-side localStorage (JWT tokens, preferences), Backend PostgreSQL (via Neon - not modified in this feature)
**Testing**: Manual testing (no automated tests added in this feature per spec clarification)
**Target Platform**: GitHub Pages static hosting (Next.js static export with `output: 'export'`)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Best effort (focus on functionality first per FR spec clarification)
**Constraints**:
  - Static export only (no server-side rendering capabilities)
  - basePath: `/Hackathon-2-Five-Phases` for GitHub Pages
  - Client-side only authentication (localStorage-based JWT)
  - No server-side session management
**Scale/Scope**: Single-user sessions, ~7 dashboard components, 4 context providers, 3 auth routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check ✅

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. Specification is Single Source of Truth** | ✅ PASS | Feature defined in spec.md with 14 functional requirements, clarifications completed via /sp.clarify |
| **II. Spec-Driven Development** | ✅ PASS | Following workflow: spec.md → plan.md → tasks.md → implementation |
| **III. Sequential Phase Execution** | ✅ PASS | Phase 0 (research) completed; now in Phase 1 (design); Phase 2 (tasks) next |
| **IV. No Overengineering** | ✅ PASS | Minimal changes: fix broken routes, add error boundaries, enhance auth. No new abstractions or frameworks |
| **V. Stateless Backend** | ✅ PASS | No backend state changes; all state management client-side (localStorage) |
| **VI. AI Interactions via Tools** | ✅ PASS | Using /sp.plan command, will use /sp.tasks and /sp.implement |
| **VII. Discourage Manual Coding** | ✅ PASS | Agent-driven implementation planned via /sp.implement |
| **VIII. Process Clarity Over UI Polish** | ✅ PASS | Focus on fixing functional errors, not UI refinement |
| **IX. Reusable Intelligence Artifacts** | ✅ PASS | PHR created for /sp.specify and /sp.clarify; will create for /sp.plan |

**No constitutional violations** - feature adheres to all principles.

### Post-Phase 1 Check ✅

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **Research Complete** | ✅ PASS | research.md created with root cause analysis and best practices |
| **Design Artifacts Generated** | ✅ PASS | data-model.md, contracts/auth-api.md, quickstart.md all complete |
| **No Premature Abstraction** | ✅ PASS | Auth utilities (auth-utils.ts) justified by spec requirements (FR-007, FR-008, FR-014) |
| **Complexity Justified** | ✅ PASS | JWT refresh token complexity required by security best practices and 7-day session requirement |

**Gate Status**: ✅ PASS - Ready to proceed to Phase 2 (Task Breakdown)

## Project Structure

### Documentation (this feature)

```text
specs/007-fix-dashboard-access/
├── spec.md              # Feature specification (/sp.specify output)
├── plan.md              # This file (/sp.plan output)
├── research.md          # Phase 0 output (root cause analysis, best practices)
├── data-model.md        # Phase 1 output (auth token storage, error state)
├── quickstart.md        # Phase 1 output (implementation guide)
├── contracts/           # Phase 1 output
│   └── auth-api.md      # JWT refresh token API contract
└── tasks.md             # Phase 2 output (/sp.tasks - NOT YET CREATED)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home page (Line 15: redirect fix)
│   │   ├── layout.tsx                # Root layout (context providers)
│   │   └── dashboard/
│   │       └── page.tsx              # Dashboard route (ADD: ErrorBoundary)
│   ├── components/
│   │   ├── ErrorBoundary.tsx         # Error boundary (exists, will be used)
│   │   ├── TaskCard.tsx              # Task component
│   │   └── views/                    # View mode components
│   ├── contexts/
│   │   ├── ThemeContext.tsx          # Theme provider (FIX: SSR guards Lines 37-82)
│   │   ├── ViewContext.tsx           # View mode provider
│   │   └── FilterContext.tsx         # Filter state provider
│   ├── lib/
│   │   ├── api.ts                    # API client (existing getToken function)
│   │   ├── auth-context.tsx          # Auth provider (FIX: Lines 42, 55, 68)
│   │   └── auth-utils.ts             # NEW: Token management utilities
│   └── hooks/
│       ├── useTasks.ts               # Task management hook
│       └── useAnalytics.ts           # Analytics hook
└── tests/                             # No test changes in this feature

backend/
└── (no changes required in this feature)
```

**Structure Decision**: Existing web application structure (frontend + backend). This feature only modifies frontend routing, authentication, and error handling. Backend API contracts documented but no backend code changes needed (API already returns tokens in expected format per investigation).

## Complexity Tracking

> Feature does NOT violate constitutional principles - no entries required

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

**Justification for auth-utils.ts (New File)**:
- **Needed**: Centralize token validation, refresh logic, and storage operations (FR-007, FR-008, FR-014)
- **Simpler Alternative**: Inline token logic in each component
- **Rejected Because**: Would duplicate code across 4+ files (auth-context, dashboard page, API client), violate DRY principle, make testing harder

**Justification for JWT Refresh Tokens (Complexity)**:
- **Needed**: 7-day session persistence requirement (clarified in spec) with security best practice of short-lived access tokens
- **Simpler Alternative**: Long-lived single token (24-hour or 7-day access token)
- **Rejected Because**: Security risk (compromised token valid for 7 days), OWASP best practices require short access tokens with refresh capability

---

## Phase 0: Research Summary

**Status**: ✅ Complete
**Output**: [research.md](./research.md)

### Root Cause Analysis

Identified 7 critical issues through codebase investigation:

1. **Missing Error Boundary** (P0) - Dashboard has no React error protection
2. **SSR-Unsafe Code** (P0) - ThemeContext accesses `localStorage`/`window` without guards
3. **Incorrect Routes** (P1) - Auth redirects to `/tasks` (doesn't exist) instead of `/dashboard`
4. **basePath Compatibility** (P1) - Verified Next.js router.push() handles basePath correctly
5. **Context Initialization** (P2) - Dashboard uses hooks before contexts fully initialized

### Best Practices Research

1. **Next.js Static Export**: Requires `'use client'`, browser API guards, error boundaries
2. **JWT Token Management**: 1hr access + 7-day refresh per OWASP recommendations
3. **React Error Boundaries**: Route-level isolation, fallback UI, error logging

### Decisions Made

All unknowns from Technical Context section resolved:
- ✅ Authentication storage → localStorage with JWT (clarified Q1)
- ✅ Error message style → User-friendly with actions (clarified Q2)
- ✅ Diagnostic logging → Client errors + API failures (clarified Q3)
- ✅ Performance targets → Deferred to focus on P1 (clarified Q4)
- ✅ Token expiration → Access 1hr, Refresh 7 days (clarified Q5)

---

## Phase 1: Design Summary

**Status**: ✅ Complete
**Outputs**:
- [data-model.md](./data-model.md) - Auth token storage, error state, route context
- [contracts/auth-api.md](./contracts/auth-api.md) - JWT refresh token API
- [quickstart.md](./quickstart.md) - Implementation guide with code examples

### Data Model Design

**Key Entities**:
1. **AuthTokens**: localStorage-based JWT storage (access + refresh tokens with expiry tracking)
2. **RouteContext**: Return URL preservation for post-login navigation
3. **ErrorState**: Error boundary state for dashboard error handling

**Storage Schema**:
```typescript
// localStorage keys
localStorage.setItem('authToken', string);      // Access token (1hr)
localStorage.setItem('refreshToken', string);   // Refresh token (7 days)
localStorage.setItem('tokenExpiry', string);    // Unix timestamp
localStorage.setItem('refreshExpiry', string);  // Unix timestamp
localStorage.setItem('returnUrl', string);      // Return URL after login
```

### API Contract Design

**Enhanced Endpoints**:
- `POST /api/auth/login` - Returns accessToken, refreshToken, expiresIn, refreshExpiresIn
- `POST /api/auth/signup` - Same as login
- `POST /api/auth/refresh` - Exchange refresh token for new access token

**Client-Side Token Management**:
- Validate expiration before API calls
- Automatically refresh when access token expires
- Clear tokens and redirect to login if refresh fails

### Quickstart Guide

Complete implementation guide with:
- 5-minute quick start (minimal P1 fixes)
- Detailed step-by-step for all priorities
- Code examples for each file change
- Testing checklist (P1, P2, P3)
- Deployment instructions
- Troubleshooting guide

---

## Phase 2: Task Breakdown (Next Step)

**Command**: `/sp.tasks`
**Prerequisites**: ✅ research.md, data-model.md, contracts, quickstart.md all complete

**Expected Tasks** (preview):
1. Add ErrorBoundary wrapper to dashboard page
2. Add SSR guards to ThemeContext (3 locations)
3. Update auth redirects from /tasks to /dashboard (4 files)
4. Create auth-utils.ts with token management
5. Update auth-context to store refresh token
6. Add return URL preservation logic
7. Update API client to handle token refresh
8. Test P1 scenarios (dashboard access, refresh, error handling)
9. Test P2 scenarios (login redirect, return URL)
10. Build and deploy to GitHub Pages

---

## Implementation Strategy

### Priority Order (Aligned with User Stories)

**P1 (Critical - Blocking)**: Fix client-side exception
- Add ErrorBoundary to dashboard (prevents crashes)
- Fix SSR guards in ThemeContext (prevents build/hydration errors)

**P2 (Important - UX)**: Fix post-login redirect
- Change /tasks to /dashboard (3 auth files + home page)
- Add return URL preservation (auth-context, auth-utils)

**P3 (Nice-to-have)**: Home page update
- Investigate cache issues (likely GitHub Pages CDN delay)
- No code changes expected (content is current in repo)

### Minimal Viable Fix (MVP)

For fastest resolution of user-reported error:
1. Add ErrorBoundary wrapper (10 lines)
2. Add `typeof window !== 'undefined'` guards to ThemeContext (5 lines)
3. Change 4 occurrences of `'/tasks'` to `'/dashboard'` (4 lines)

**Total**: ~20 lines of code changes → Resolves P1 and P2

### Full Implementation

Includes JWT refresh token support:
- Create auth-utils.ts (~80 lines)
- Update auth-context for token storage (~20 lines)
- Add token refresh to API client (~30 lines)

**Total**: ~130 lines of code changes → Resolves P1, P2, and adds robust session management

---

## Risk Mitigation

### Risk 1: ErrorBoundary Hides Useful Errors

**Mitigation**:
- Log full error details to console (error, errorInfo, component stack)
- Show "Report Issue" link in error UI with pre-filled bug report
- Only catch errors in dashboard route, not globally

### Risk 2: Token Refresh Fails Silently

**Mitigation**:
- Log refresh failures to console with status code and error message
- Show user-friendly error: "Session expired. Please log in again."
- Clear all tokens to force clean re-authentication

### Risk 3: localStorage Security Concerns

**Mitigation**:
- Document XSS risk in security notes (localStorage accessible to any script)
- No HttpOnly cookies available (GitHub Pages static hosting limitation)
- Recommend HTTPS only (already enforced by GitHub Pages)
- Short-lived access tokens (1hr) limit exposure window

### Risk 4: Home Page Cache Issues Persist

**Mitigation**:
- Add cache-busting query param to home page assets: `?v={git-commit-sha}`
- Document expected CDN propagation delay (5-10 minutes)
- Provide user instructions for hard refresh (Ctrl+Shift+R)

---

## Validation Plan

### Pre-Implementation Validation

- ✅ Constitution Check passed
- ✅ All NEEDS CLARIFICATION resolved
- ✅ Research complete with root cause analysis
- ✅ Design artifacts generated and documented

### Post-Implementation Validation

**Functional Tests** (from spec.md acceptance scenarios):
1. Navigate to /dashboard while logged in → No client-side error ✓
2. Navigate to /dashboard without auth → Redirect to login ✓
3. Refresh dashboard page → Maintains session, no errors ✓
4. Login with valid credentials → Redirect to /dashboard ✓
5. Attempt dashboard access, then login → Return to dashboard ✓

**Technical Tests**:
1. npm run build → No errors, static export succeeds ✓
2. Browser console on /dashboard → No errors or warnings ✓
3. Theme toggle (light/dark) → No SSR errors ✓
4. Token expiration after 1hr → Automatic refresh triggered ✓
5. Refresh token expiration after 7 days → Redirect to login ✓

**Deployment Tests**:
1. GitHub Actions build succeeds ✓
2. GitHub Pages serves /dashboard without 404 ✓
3. basePath /Hackathon-2-Five-Phases applied correctly ✓
4. All static assets load with correct paths ✓

---

## Files to Modify

### Priority 0 (P1 - Critical Fixes)

| File | Lines | Change Type | Purpose |
|------|-------|-------------|---------|
| `frontend/src/app/dashboard/page.tsx` | +10 | Modify | Wrap with ErrorBoundary |
| `frontend/src/contexts/ThemeContext.tsx` | ~15 | Modify | Add SSR guards (Lines 37-44, 48, 82) |
| `frontend/src/lib/auth-context.tsx` | ~3 | Modify | Change /tasks to /dashboard (Lines 42, 55, 68) |
| `frontend/src/app/page.tsx` | ~1 | Modify | Change /tasks to /dashboard (Line 15) |

### Priority 1 (P2 - Enhanced Auth)

| File | Lines | Change Type | Purpose |
|------|-------|-------------|---------|
| `frontend/src/lib/auth-utils.ts` | +80 | Create | Token validation and refresh utilities |
| `frontend/src/lib/auth-context.tsx` | +20 | Modify | Store refresh token, handle return URL |
| `frontend/src/lib/api.ts` | +30 | Modify | Add token refresh interceptor |

### Priority 2 (P3 - Home Page)

| File | Lines | Change Type | Purpose |
|------|-------|-------------|---------|
| `frontend/src/app/page.tsx` | 0 | None | Content is current; investigate cache |

**Total LOC**: ~160 lines changed/added across 7 files

---

## Dependencies and Prerequisites

### External Dependencies (No Changes)

- Next.js 15.1.3 (already installed)
- React 18 (already installed)
- Tailwind CSS (already configured)
- motion/react (already installed)

### Internal Dependencies

**Existing Components/Utilities**:
- `ErrorBoundary.tsx` - Already exists, will be used
- `getToken()` function in api.ts - Already exists, keep for backward compatibility
- Auth context provider - Already exists, will be enhanced

**New Utilities to Create**:
- `auth-utils.ts` - Token management (isAccessTokenValid, refreshAuthToken, etc.)

### Git Dependencies

- Feature branch `007-fix-dashboard-access` - ✅ Already created
- Clean working directory - ✅ No conflicts

---

## Acceptance Criteria

### Definition of Done

- ✅ All P1 critical fixes implemented and tested
- ✅ All P2 important fixes implemented and tested
- ✅ P3 investigated with recommendations provided
- ✅ No TypeScript compilation errors
- ✅ npm run build succeeds with static export
- ✅ Browser console shows no errors on /dashboard
- ✅ All acceptance scenarios from spec.md validated
- ✅ PHR created for implementation session
- ✅ Code committed with descriptive message
- ✅ GitHub Pages deployment verified

### Success Metrics (from spec.md)

- **SC-001**: ✅ 0% error rate on dashboard route access
- **SC-002**: ✅ 100% of logins redirect to /dashboard within 1 second
- **SC-003**: ✅ Home page displays latest codebase version
- **SC-004**: ✅ 100% functional parity for direct vs. navigated dashboard access
- **SC-005**: ✅ Zero client-side exceptions in browser console
- **SC-006**: ✅ All assets resolve correctly with basePath

---

## Next Steps

1. **User**: Review this plan for approval
2. **Agent**: Run `/sp.tasks` to generate dependency-ordered task breakdown
3. **Agent**: Run `/sp.implement` to execute tasks sequentially
4. **User**: Test implementation on local dev server
5. **Agent**: Create commit and PR via `/sp.git.commit_pr`
6. **User**: Merge PR after review
7. **User**: Verify production deployment on GitHub Pages

---

## References

- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/auth-api.md](./contracts/auth-api.md)
- **Implementation Guide**: [quickstart.md](./quickstart.md)
- **Constitution**: `.specify/memory/constitution.md`

**Status**: ✅ Phase 0 (Research) Complete | ✅ Phase 1 (Design) Complete | ⏳ Phase 2 (Tasks) Next
