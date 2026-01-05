# Data Model: Fix Dashboard Access and Routing

**Feature**: 007-fix-dashboard-access
**Phase**: Phase 1 - Design and Architecture
**Date**: 2026-01-05

## Overview

This feature focuses on fixing routing and authentication flow rather than introducing new data models. The existing data structures remain unchanged, but their usage patterns and validation logic need updates.

## Entities

### AuthTokens (Client-Side Storage)

**Description**: JWT authentication tokens stored in browser localStorage
**Storage**: localStorage (key-value pairs)
**Lifecycle**: Created on login/signup, refreshed hourly, cleared on logout or after 7-day expiration

**Structure**:
```typescript
interface AuthTokens {
  accessToken: string;      // JWT with 1-hour expiration
  refreshToken: string;     // JWT with 7-day expiration
  expiresAt: number;        // Unix timestamp for access token expiration
  refreshExpiresAt: number; // Unix timestamp for refresh token expiration
}
```

**localStorage Keys**:
- `authToken` - Current access token (for backward compatibility with existing code)
- `refreshToken` - Refresh token for obtaining new access tokens
- `tokenExpiry` - Timestamp when access token expires
- `refreshExpiry` - Timestamp when refresh token expires

**Validation Rules**:
- accessToken MUST be non-empty string
- refreshToken MUST be non-empty string
- expiresAt MUST be future timestamp (> Date.now())
- refreshExpiresAt MUST be future timestamp (> Date.now())
- accessToken expiration MUST be <= 1 hour from creation
- refreshToken expiration MUST be <= 7 days from creation

**State Transitions**:
1. **Not Authenticated** → **Authenticated**: User successfully logs in, tokens stored
2. **Authenticated** → **Access Expired**: After 1 hour, access token invalid
3. **Access Expired** → **Authenticated**: Refresh token used to get new access token
4. **Access Expired** → **Not Authenticated**: Refresh token also expired (7 days), must re-login
5. **Authenticated** → **Not Authenticated**: User explicitly logs out, tokens cleared

---

### RouteContext (Client-Side State)

**Description**: Navigation state tracking for return URL preservation
**Storage**: React state / localStorage (for persistence across page loads)
**Lifecycle**: Updated on route changes, used for post-login redirect

**Structure**:
```typescript
interface RouteContext {
  returnUrl: string | null;  // URL to return to after login (e.g., "/dashboard")
  previousRoute: string;      // Last visited route for back navigation
}
```

**localStorage Keys**:
- `returnUrl` - Stored when redirecting unauthenticated user to login

**Validation Rules**:
- returnUrl MUST start with `/` (relative path only)
- returnUrl MUST NOT include query params with sensitive data
- returnUrl MUST be cleared after successful redirect

**State Transitions**:
1. User visits `/dashboard` without auth → returnUrl = "/dashboard"
2. User completes login → Read returnUrl, navigate there, clear returnUrl
3. User navigates normally → returnUrl = null

---

### ErrorState (Component State)

**Description**: Error boundary state for dashboard route
**Storage**: React component state (ErrorBoundary)
**Lifecycle**: Set when error caught, cleared on boundary reset

**Structure**:
```typescript
interface ErrorState {
  hasError: boolean;          // Whether error has been caught
  error: Error | null;        // The caught error object
  errorInfo: ErrorInfo | null; // React error info with component stack
  timestamp: number;          // When error occurred
  route: string;              // Route where error occurred
}
```

**Validation Rules**:
- hasError = true IFF error !== null
- timestamp MUST be valid Unix timestamp
- route MUST match current window.location.pathname

**State Transitions**:
1. **No Error** → **Error Caught**: Component throws error, caught by boundary
2. **Error Caught** → **No Error**: User clicks "Retry" button, boundary resets
3. **Error Caught** → **Logged Out**: User clicks "Logout" button, redirects to login

---

## Relationships

```
AuthTokens (1) ──────────────> RouteContext (0..1)
   │                               │
   │ validates auth                │ determines redirect target
   │                               │
   ├──> Dashboard Route Access     │
   │                               │
   └──> ErrorState (0..1) <────────┘
         (if auth check fails)
```

### AuthTokens → RouteContext
- When tokens expire (state transition 4), set returnUrl to current route
- After refresh succeeds (state transition 3), clear returnUrl
- After login (state transition 1), check returnUrl and redirect there

### RouteContext → Dashboard Access
- If returnUrl = "/dashboard", user attempted to access dashboard while unauthenticated
- After auth succeeds, navigate to returnUrl if set, else "/dashboard" by default

### ErrorState → All Components
- ErrorBoundary wraps Dashboard route
- Catches any rendering errors from ThemeContext, ViewContext, Analytics
- Displays user-friendly error UI with Retry/Logout actions

---

## Data Flow

### Login Flow (P2 - Post-Login Redirect)

```
1. User visits /dashboard (no auth)
   → Check authToken in localStorage
   → If missing/expired, set returnUrl = "/dashboard"
   → Redirect to /login

2. User enters credentials on /login
   → Submit to POST /api/auth/login
   → Receive { accessToken, refreshToken, expiresIn, refreshExpiresIn }
   → Store in localStorage:
      - authToken = accessToken
      - refreshToken = refreshToken
      - tokenExpiry = Date.now() + (expiresIn * 1000)
      - refreshExpiry = Date.now() + (refreshExpiresIn * 1000)
   → Read returnUrl from localStorage
   → router.push(returnUrl || "/dashboard")
   → Clear returnUrl from localStorage
```

### Dashboard Access Flow (P1 - Direct Dashboard Access)

```
1. User navigates to /dashboard
   → Check authToken exists in localStorage
   → If missing, redirect to /login with returnUrl
   → If exists, validate expiration:
      - If tokenExpiry > Date.now(), proceed to render
      - If tokenExpiry < Date.now():
         a. Check refreshExpiry > Date.now()
         b. If yes, call POST /api/auth/refresh with refreshToken
         c. If refresh succeeds, update tokens and proceed
         d. If refresh fails or refreshExpiry expired, redirect to /login

2. Dashboard renders with ErrorBoundary
   → Wrap all dashboard components
   → If any component throws error:
      - Catch in ErrorBoundary
      - Log to console: { error, errorInfo, route, timestamp }
      - Display error UI with Retry/Logout buttons
```

### Token Refresh Flow (P1 - Session Management)

```
1. API call returns 401 Unauthorized
   → Check if refreshToken exists and refreshExpiry > Date.now()
   → If yes:
      a. Call POST /api/auth/refresh with refreshToken
      b. Receive new { accessToken, expiresIn }
      c. Update localStorage:
         - authToken = new accessToken
         - tokenExpiry = Date.now() + (expiresIn * 1000)
      d. Retry original API call with new token
   → If no:
      - Clear all tokens from localStorage
      - Set returnUrl = current route
      - Redirect to /login
```

---

## Storage Schema

### localStorage Structure

```typescript
// Current state (exists in codebase)
localStorage.setItem('authToken', string);

// Enhanced state (to be added)
localStorage.setItem('authToken', string);      // Access token
localStorage.setItem('refreshToken', string);   // Refresh token
localStorage.setItem('tokenExpiry', string);    // ISO timestamp or Unix ms
localStorage.setItem('refreshExpiry', string);  // ISO timestamp or Unix ms
localStorage.setItem('returnUrl', string);      // Relative path (e.g., "/dashboard")
```

### Backward Compatibility

- Existing code uses `localStorage.getItem('authToken')` - keep this key
- Add new keys for refresh token and expiry tracking
- Existing `getToken()` function (frontend/src/lib/api.ts Line 13) returns access token
- Create new `getRefreshToken()` and `isTokenExpired()` utility functions

---

## Validation Logic

### Token Validation (Before API Calls)

```typescript
function isAccessTokenValid(): boolean {
  const token = localStorage.getItem('authToken');
  const expiry = localStorage.getItem('tokenExpiry');

  if (!token || !expiry) return false;

  const expiryTime = parseInt(expiry, 10);
  return Date.now() < expiryTime;
}

function isRefreshTokenValid(): boolean {
  const refreshToken = localStorage.getItem('refreshToken');
  const expiry = localStorage.getItem('refreshExpiry');

  if (!refreshToken || !expiry) return false;

  const expiryTime = parseInt(expiry, 10);
  return Date.now() < expiryTime;
}
```

### Route Protection Logic

```typescript
function useAuthGuard(route: string) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isAccessTokenValid()) {
      if (isRefreshTokenValid()) {
        // Attempt token refresh
        refreshAuthToken().catch(() => {
          localStorage.setItem('returnUrl', route);
          router.push('/login');
        });
      } else {
        // Both tokens invalid
        localStorage.setItem('returnUrl', route);
        router.push('/login');
      }
    }
  }, [route, router]);
}
```

---

## Error Handling

### Error Types

1. **Authentication Errors**
   - Token missing → Redirect to login
   - Token expired → Attempt refresh, fallback to login
   - Refresh failed → Clear tokens, redirect to login

2. **Rendering Errors**
   - Context not initialized → Show loading state
   - Component throws exception → Catch in ErrorBoundary
   - SSR hydration mismatch → Add proper guards

3. **API Errors**
   - Network failure → Show "Retry" button
   - 401 Unauthorized → Trigger token refresh flow
   - 403 Forbidden → Show "Insufficient permissions" message
   - 5xx Server errors → Log details, show user-friendly message

### Error Logging Format

```typescript
interface ErrorLog {
  type: 'auth' | 'rendering' | 'api' | 'network';
  message: string;
  error?: Error;
  context: {
    route: string;
    userId?: string;
    timestamp: number;
    statusCode?: number;
    requestUrl?: string;
  };
}

// Log to console
console.error('[Dashboard Error]', errorLog);
```

---

## Migration Notes

**Existing Data**: No database schema changes required
**Existing Code**: Update token storage from single `authToken` to include refresh token and expiry
**Backward Compatibility**: Keep `authToken` key for existing API calls, add new keys alongside

**Migration Steps**:
1. On next login, store all 4 localStorage keys (authToken, refreshToken, tokenExpiry, refreshExpiry)
2. Existing sessions with only `authToken` will work until expiry, then require re-login
3. No server-side migration needed (API already returns tokens in expected format per API investigation)

---

## References

- JWT Best Practices: OWASP JWT Security Cheat Sheet
- localStorage Security: Store only tokens, never passwords or sensitive user data
- Token Expiration: Industry standard 1hr access / 7 day refresh
- Error Boundary Pattern: React documentation on Error Boundaries
