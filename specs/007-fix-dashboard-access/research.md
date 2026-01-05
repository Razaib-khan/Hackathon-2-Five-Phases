# Research: Fix Dashboard Access and Routing

**Feature**: 007-fix-dashboard-access
**Phase**: Phase 0 - Research and Context Gathering
**Date**: 2026-01-05

## Overview

Investigation into the client-side exception error when accessing `/dashboard` route on GitHub Pages deployment, along with auth redirect and home page update issues.

## Root Cause Analysis

### Critical Issue 1: Missing Error Boundary Protection

**Decision**: Add ErrorBoundary component wrapper to dashboard route
**Rationale**: Dashboard page (`frontend/src/app/dashboard/page.tsx`) has NO error boundary despite having an ErrorBoundary implementation available at `frontend/src/components/ErrorBoundary.tsx`. Any React rendering error in dashboard components causes unhandled client-side exceptions that crash the entire page.

**Evidence**:
- ErrorBoundary.tsx exists but is not used in app/layout.tsx (Lines 20-38)
- Dashboard renders complex nested components (ViewContext, ThemeContext, Analytics) without error protection
- User reports "Application error: a client-side exception has occurred"

**Alternatives Considered**:
- Global error boundary in layout.tsx - Rejected: Too broad, would hide errors in other routes
- Component-level try-catch - Rejected: Doesn't handle React rendering errors
- **Selected**: Route-specific error boundary wrapper in dashboard page

---

### Critical Issue 2: SSR/Static Export Incompatible Code

**Decision**: Add SSR guards to all window/localStorage access in context providers
**Rationale**: ThemeContext (`frontend/src/contexts/ThemeContext.tsx` Lines 37-44, 48, 82) directly accesses `localStorage` and `window.matchMedia` without checking `typeof window !== 'undefined'`. When Next.js performs static generation with `output: 'export'` (next.config.js Line 12), these globals are undefined, causing build-time or hydration errors.

**Evidence**:
```tsx
// ThemeContext.tsx Line 38 - NO SSR guard
const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;

// ThemeContext.tsx Line 48 - NO SSR guard
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
```

**Impact**: Static export build fails or hydrates incorrectly, causing client-side exceptions on first load

**Alternatives Considered**:
- Client Component only - Rejected: Still needs SSR guards for Next.js pre-rendering
- useEffect-only access - Partially used but incomplete
- **Selected**: Comprehensive `typeof window !== 'undefined'` guards around all browser API access

---

### Critical Issue 3: Incorrect Post-Login Redirect Routes

**Decision**: Change all auth redirects from `/tasks` to `/dashboard`
**Rationale**: Authentication context (`frontend/src/lib/auth-context.tsx`) redirects to `/tasks` after login/signup (Lines 42, 55, 68), but this route doesn't exist. The actual dashboard route is `/dashboard` (exists at `frontend/src/app/dashboard/page.tsx`). This causes 404 errors after successful authentication.

**Evidence**:
```tsx
// auth-context.tsx Line 42
router.push('/tasks')  // WRONG - route doesn't exist

// Actual route exists at:
// frontend/src/app/dashboard/page.tsx
```

**Locations to fix**:
1. `auth-context.tsx` Line 42 (login function)
2. `auth-context.tsx` Line 55 (signup function)
3. `auth-context.tsx` Line 68 (register function)
4. `app/page.tsx` Line 15 (home page redirect)

**Alternatives Considered**:
- Create /tasks route - Rejected: Adds unnecessary route, dashboard already exists
- Keep /tasks and redirect internally - Rejected: Adds complexity, breaks URLs
- **Selected**: Update all redirects to use correct `/dashboard` route

---

### Critical Issue 4: GitHub Pages Base Path Routing

**Decision**: Ensure all client-side navigation respects basePath configuration
**Rationale**: GitHub Pages deployment uses `basePath: '/Hackathon-2-Five-Phases'` (next.config.js Line 13) when GITHUB_PAGES env var is set. However, absolute path redirects like `router.push('/dashboard')` don't automatically include the base path, causing navigation to fail in production.

**Evidence**:
- User error URL: `https://razaib-khan.github.io/Hackathon-2-Five-Phases/dashboard/`
- next.config.js Line 13: `basePath: process.env.GITHUB_PAGES ? '/Hackathon-2-Five-Phases' : ''`
- Next.js `useRouter().push()` respects basePath automatically for relative paths

**Verification**: Next.js App Router `useRouter().push()` DOES handle basePath correctly for absolute paths starting with `/`, so no changes needed if using router.push() consistently.

**Alternatives Considered**:
- Manually prepend basePath to all routes - Rejected: Error-prone, Next.js handles this
- Use environment variable - Rejected: Next.js already has basePath config
- **Selected**: Verify all navigation uses router.push() instead of window.location, which respects basePath

---

### Issue 5: Context Provider Initialization in Static Export

**Decision**: Add loading states and SSR-safe context initialization
**Rationale**: Dashboard immediately calls `useView()`, `useTheme()`, and `useAnalytics()` hooks before contexts are guaranteed to be initialized in static export mode. ViewContext throws errors if used outside provider (ViewContext.tsx Line 47).

**Evidence**:
```tsx
// dashboard/page.tsx Lines 56-58
const { viewMode, setViewMode } = useView()
const { theme, setTheme, resolvedTheme } = useTheme()
const { dashboard, fetchDashboard } = useAnalytics()

// ViewContext.tsx Line 47
if (!context) {
  throw new Error("useView must be used within ViewProvider");
}
```

**Alternatives Considered**:
- Make contexts optional - Rejected: Breaks type safety
- Render dashboard server-side - Rejected: Incompatible with `output: 'export'`
- **Selected**: Add loading state while contexts initialize; ensure providers wrap dashboard in layout

---

## Technical Decisions

### Authentication Strategy (Clarified in Spec)

**Decision**: localStorage with JWT tokens (access 1hr, refresh 7 days)
**Rationale**: Aligns with static GitHub Pages deployment (no server-side session). JWT tokens are self-contained and can be validated client-side.

**Implementation Requirements**:
- Store access token and refresh token in localStorage
- Check token expiration before rendering protected routes
- Implement automatic token refresh when access token expires
- Redirect to login with return URL if refresh token expired

---

### Error Handling Strategy (Clarified in Spec)

**Decision**: User-friendly messages with recovery actions
**Rationale**: Better UX than technical error codes. Shows "Unable to load dashboard" with [Retry] [Logout] buttons.

**Implementation Requirements**:
- ErrorBoundary component catches React errors
- Display user-friendly error UI with actionable buttons
- Log technical details (stack trace, component tree) to console
- Track error context (route, user ID, timestamp)

---

### Diagnostic Logging (Clarified in Spec)

**Decision**: Client errors + API failures with status codes
**Rationale**: Essential diagnostic information for debugging without full observability overhead.

**Implementation Requirements**:
- Wrap API calls in try-catch to log failures
- Include status code, error message, request details in logs
- Log authentication failures (token validation, refresh failures)
- Use console.error() for immediate visibility in browser DevTools

---

## Best Practices Research

### Next.js Static Export Best Practices

1. **No Server-Side Data Fetching**: Use `'use client'` directive and fetch data in useEffect
2. **Error Boundaries**: Required for static pages since Next.js error handling relies on server
3. **Browser API Guards**: Always check `typeof window !== 'undefined'` before accessing window/localStorage/document
4. **basePath Configuration**: Set in next.config.js and use router.push() for navigation (handles basePath automatically)
5. **Trailing Slashes**: Set `trailingSlash: true` for GitHub Pages compatibility (already configured)

**Reference**: Next.js Static Exports documentation - https://nextjs.org/docs/app/building-your-application/deploying/static-exports

---

### JWT Token Management Best Practices

1. **Token Storage**: localStorage acceptable for SPAs; HttpOnly cookies preferred but requires server
2. **Token Expiration**: Short-lived access tokens (1hr) with longer refresh tokens (7 days)
3. **Automatic Refresh**: Intercept 401 responses and attempt token refresh before failing
4. **Token Validation**: Check expiration client-side before API calls to avoid unnecessary requests
5. **Logout Handling**: Clear localStorage and redirect to login

**Reference**: OWASP JWT Security Cheat Sheet - https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

---

### React Error Boundary Patterns

1. **Route-Level Boundaries**: Wrap each major route to isolate errors
2. **Fallback UI**: Show user-friendly error with recovery actions
3. **Error Logging**: Use componentDidCatch to log errors with context
4. **Reset Mechanism**: Provide way to reset error boundary and retry
5. **Development vs Production**: Show stack traces in dev, generic messages in prod

**Reference**: React Error Boundaries documentation - https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

---

## Open Questions (All Resolved)

✅ Authentication storage mechanism → localStorage with JWT
✅ Error message style → User-friendly with recovery actions
✅ Diagnostic logging requirements → Client errors + API failures
✅ Performance targets → Deferred (focus on P1 fixes)
✅ Token expiration times → Access 1hr, Refresh 7 days

**Status**: All critical unknowns from Technical Context have been resolved through specification clarification and codebase investigation.

---

## Files Requiring Changes

### Priority 0 (P1 - Blocking)
1. `frontend/src/app/dashboard/page.tsx` - Wrap with ErrorBoundary
2. `frontend/src/contexts/ThemeContext.tsx` - Add SSR guards (Lines 37-44, 48, 82)
3. `frontend/src/lib/auth-context.tsx` - Change `/tasks` to `/dashboard` (Lines 42, 55, 68)
4. `frontend/src/app/page.tsx` - Change `/tasks` to `/dashboard` (Line 15)

### Priority 1 (P2 - Post-Login Redirect)
5. `frontend/src/lib/auth-context.tsx` - Add return URL state management
6. `frontend/src/app/dashboard/page.tsx` - Add loading state during context initialization

### Priority 2 (P3 - Home Page)
7. `frontend/src/app/page.tsx` - Verify latest content is deployed (likely cache issue, not code)

---

## Implementation Sequence

**Phase 0**: ✅ Research complete
**Phase 1**: Design (data model, contracts, quickstart) - Next step
**Phase 2**: Task breakdown - After Phase 1
**Phase 3**: Implementation (Red → Green → Refactor) - After Phase 2

---

## References

- Next.js Static Export: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- OWASP JWT Security: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
- GitHub Pages Deployment: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
