---
id: 0002
title: Dashboard Access Implementation Plan
stage: plan
date: 2026-01-05
surface: agent
model: claude-sonnet-4-5
feature: 007-fix-dashboard-access
branch: 007-fix-dashboard-access
user: Razaib-khan
command: /sp.plan
labels: ["planning", "architecture", "routing", "authentication", "error-handling", "jwt", "ssr"]
links:
  spec: specs/007-fix-dashboard-access/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-fix-dashboard-access/plan.md
  - specs/007-fix-dashboard-access/research.md
  - specs/007-fix-dashboard-access/data-model.md
  - specs/007-fix-dashboard-access/quickstart.md
  - specs/007-fix-dashboard-access/contracts/auth-api.md
tests:
  - Manual testing checklist defined in quickstart.md
  - P1 scenarios (dashboard access, SSR guards, error boundaries)
  - P2 scenarios (login redirect, return URL preservation)
---

## Prompt

/sp.plan

(User executed the plan command to create implementation architecture and design artifacts based on the clarified specification)

## Response snapshot

Created comprehensive implementation plan with Phase 0 research and Phase 1 design complete:

**Phase 0 - Research (Complete)**:
- Investigated codebase to identify root causes of dashboard access failures
- Found 7 critical issues: missing ErrorBoundary, SSR-unsafe code in ThemeContext, incorrect route redirects (/tasks instead of /dashboard)
- Researched best practices for Next.js static export, JWT token management, and React error boundaries
- Resolved all NEEDS CLARIFICATION items from technical context

**Root Causes Identified**:
1. Missing ErrorBoundary wrapper on dashboard route
2. ThemeContext accessing localStorage/window without SSR guards (Lines 37-44, 48, 82)
3. Auth context redirecting to non-existent /tasks route instead of /dashboard (3 locations)
4. Home page also redirecting to /tasks (1 location)
5. Context initialization race conditions during static export

**Phase 1 - Design (Complete)**:

**Data Model (data-model.md)**:
- AuthTokens: localStorage-based JWT storage with access/refresh tokens and expiry tracking
- RouteContext: Return URL preservation for post-login navigation
- ErrorState: Error boundary state for dashboard error handling
- Defined localStorage schema with 5 keys (authToken, refreshToken, tokenExpiry, refreshExpiry, returnUrl)

**API Contracts (contracts/auth-api.md)**:
- POST /api/auth/login - Enhanced to return refreshToken + expiresIn + refreshExpiresIn
- POST /api/auth/signup - Same enhancement
- POST /api/auth/refresh - New endpoint to exchange refresh token for new access token
- Client-side token validation and refresh logic documented

**Quickstart Guide (quickstart.md)**:
- 5-minute quick start for minimal P1 fixes (~20 lines of code)
- Detailed implementation guide for all priorities (~160 lines total)
- Testing checklist (P1, P2, P3 scenarios)
- Deployment instructions for GitHub Pages
- Troubleshooting guide

**Implementation Plan (plan.md)**:
- Technical context: TypeScript 5.x, Next.js 15, React 18, GitHub Pages static hosting
- Constitution check: ✅ All 9 principles verified, no violations
- Files to modify: 7 files total (4 critical P1 fixes, 3 enhanced auth P2 additions)
- LOC estimate: ~160 lines changed/added
- Risk mitigation strategies for 4 identified risks
- Validation plan with functional, technical, and deployment tests

**Key Decisions**:
- Minimal viable fix: 4 files, ~20 lines → Resolves P1 and basic P2
- Full implementation: 7 files, ~160 lines → Adds robust JWT refresh token support
- Priority order: P1 (critical errors) → P2 (auth redirect) → P3 (home page cache)

**Architecture Principles Applied**:
- No overengineering: Only fixing specified issues, no new frameworks
- Stateless backend: All auth state client-side in localStorage
- Error boundaries: Route-level isolation, not global
- JWT security: 1hr access + 7-day refresh per OWASP best practices

## Outcome

- ✅ Impact: Complete implementation plan created with research, design, contracts, and quickstart guide; identified root causes and designed minimal fixes
- 🧪 Tests: Defined 15+ test scenarios across P1/P2/P3 priorities with clear acceptance criteria
- 📁 Files: Created 5 planning artifacts (plan.md, research.md, data-model.md, quickstart.md, contracts/auth-api.md)
- 🔁 Next prompts: Run /sp.tasks to generate actionable task breakdown, then /sp.implement for execution
- 🧠 Reflection: Phase 0 research using Explore agent was highly effective at identifying all 7 root causes with specific file paths and line numbers. Plan achieves minimal viable fix in ~20 lines while providing path to full JWT implementation in ~160 lines. Constitution check passed all 9 principles with no violations.

## Evaluation notes (flywheel)

- Failure modes observed: Agent context update script couldn't parse placeholder values in plan template (expected - template not yet filled); recovered by continuing with planning
- Graders run and results (PASS/FAIL): PASS - All Phase 0 and Phase 1 artifacts complete with detailed technical analysis
- Prompt variant (if applicable): Standard /sp.plan workflow with Explore agent for codebase investigation
- Next experiment (smallest change to try): Proceed with /sp.tasks to break down implementation into dependency-ordered tasks; validate that task granularity aligns with ~20 line MVP vs ~160 line full implementation split
