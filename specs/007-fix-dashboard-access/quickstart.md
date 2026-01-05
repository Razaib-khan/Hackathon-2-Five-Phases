# Quickstart: Fix Dashboard Access and Routing

**Feature**: 007-fix-dashboard-access
**Estimated Time**: 2-3 hours for P1 fixes
**Prerequisites**: Node.js, npm, Git, access to repository

## What This Fixes

🔴 **P1 (Critical)**: Client-side exception when accessing `/dashboard` route
🟡 **P2 (Important)**: Login redirect goes to wrong route (`/tasks` instead of `/dashboard`)
🟢 **P3 (Nice-to-have)**: Home page shows old version (likely cache issue)

## Quick Start (5 Minutes)

### 1. Checkout Feature Branch

```bash
git fetch origin
git checkout 007-fix-dashboard-access
cd frontend
```

### 2. Verify Current Issues (Before Fix)

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:3000
# Try accessing /dashboard - should see error
# Login and observe redirect to /tasks (404)
```

### 3. Make P1 Fixes (Critical)

**File 1**: `frontend/src/app/dashboard/page.tsx`
```tsx
// Add at top of file
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Wrap return statement
export default function DashboardPage() {
  return (
    <ErrorBoundary>
      {/* existing JSX */}
    </ErrorBoundary>
  )
}
```

**File 2**: `frontend/src/contexts/ThemeContext.tsx` (Lines 37-44, 48, 82)
```tsx
// Replace Line 38
const stored = typeof window !== 'undefined'
  ? localStorage.getItem(STORAGE_KEY) as Theme | null
  : null;

// Replace Line 48
useEffect(() => {
  if (typeof window === 'undefined') return;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  // ... rest of code
}, [theme]);
```

**File 3**: `frontend/src/lib/auth-context.tsx` (Lines 42, 55, 68)
```tsx
// Change ALL three occurrences
router.push('/tasks')  // BEFORE
router.push('/dashboard')  // AFTER
```

**File 4**: `frontend/src/app/page.tsx` (Line 15)
```tsx
// Change
router.push('/tasks')  // BEFORE
router.push('/dashboard')  // AFTER
```

### 4. Test Fixes

```bash
# Dev server should still be running
# Refresh browser
# Navigate to /dashboard - should now load without error
# Logout and login - should redirect to /dashboard
```

### 5. Build and Deploy

```bash
npm run build  # Verify build succeeds
git add .
git commit -m "fix(dashboard): resolve P1 critical access issues"
git push origin 007-fix-dashboard-access
```

---

## Detailed Implementation Guide

### Phase 1: Fix Client-Side Exception (P1)

**Problem**: Dashboard throws "Application error: a client-side exception has occurred"

**Root Causes**:
1. No ErrorBoundary wrapper
2. SSR-unsafe localStorage/window access in ThemeContext
3. Context providers not fully initialized during static export

**Solutions**:

#### Fix 1.1: Add ErrorBoundary to Dashboard

**File**: `frontend/src/app/dashboard/page.tsx`

**Before**:
```tsx
export default function DashboardPage() {
  const { viewMode } = useView();
  // ... rest of component
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* dashboard content */}
    </div>
  );
}
```

**After**:
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function DashboardContent() {
  const { viewMode } = useView();
  // ... rest of component logic
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* dashboard content */}
    </div>
  );
}
```

**Why**: Wrapping in ErrorBoundary prevents React rendering errors from crashing the entire page. User sees error UI with recovery options instead of blank screen.

#### Fix 1.2: Add SSR Guards to ThemeContext

**File**: `frontend/src/contexts/ThemeContext.tsx`

**Problem Lines**:
- Line 38: `const stored = localStorage.getItem(STORAGE_KEY)`
- Line 48: `const mediaQuery = window.matchMedia(...)`
- Line 82: `document.documentElement.classList.add/remove(...)`

**Fix**:
```tsx
// Line 37-44: Fix initial theme loading
useEffect(() => {
  if (typeof window === 'undefined') return;  // SSR guard

  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    setTheme(stored);
  }
}, []);

// Line 48: Fix media query listener
useEffect(() => {
  if (typeof window === 'undefined' || theme !== 'system') return;  // SSR guard

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  // ... rest of listener code
}, [theme]);

// Line 82: Fix DOM manipulation
useEffect(() => {
  if (typeof window === 'undefined') return;  // SSR guard

  const root = document.documentElement;
  // ... rest of DOM manipulation
}, [resolvedTheme]);
```

**Why**: Next.js static export pre-renders components during build. `window`, `localStorage`, and `document` are undefined during SSR. Guards prevent "X is not defined" errors.

---

### Phase 2: Fix Post-Login Redirect (P2)

**Problem**: After login, user redirected to `/tasks` (404) instead of `/dashboard`

**Files to Change**:
1. `frontend/src/lib/auth-context.tsx` (3 locations)
2. `frontend/src/app/page.tsx` (1 location)

**Implementation**:

```tsx
// frontend/src/lib/auth-context.tsx
// Line 42 (login function)
const login = async (email: string, password: string) => {
  const response = await apiLogin(email, password);
  setUser(response.user);
  router.push('/dashboard');  // Changed from '/tasks'
};

// Line 55 (signup function)
const signup = async (email: string, password: string) => {
  const response = await apiSignup(email, password);
  setUser(response.user);
  router.push('/dashboard');  // Changed from '/tasks'
};

// Line 68 (register function - if exists)
const register = async (email: string, password: string) => {
  const response = await apiRegister(email, password);
  setUser(response.user);
  router.push('/dashboard');  // Changed from '/tasks'
};
```

```tsx
// frontend/src/app/page.tsx
// Line 14-18 (auto-redirect logic)
useEffect(() => {
  const token = getToken();
  if (token) {
    router.push('/dashboard');  // Changed from '/tasks'
  } else {
    router.push('/login');
  }
}, [router]);
```

**Verification**:
```bash
# Test login flow
1. Navigate to http://localhost:3000/login
2. Enter credentials
3. Submit form
4. Should redirect to http://localhost:3000/dashboard (not /tasks)
```

---

### Phase 3: Enhanced Authentication (Optional, for Full JWT Implementation)

**If implementing full JWT with refresh tokens** (as per clarified spec):

#### Step 3.1: Create Auth Utilities

**New File**: `frontend/src/lib/auth-utils.ts`

```tsx
export const TOKEN_EXPIRY_SECONDS = 3600;        // 1 hour
export const REFRESH_EXPIRY_SECONDS = 604800;    // 7 days

export function storeAuthTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  refreshExpiresIn: number
) {
  localStorage.setItem('authToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('tokenExpiry', String(Date.now() + (expiresIn * 1000)));
  localStorage.setItem('refreshExpiry', String(Date.now() + (refreshExpiresIn * 1000)));
}

export function isAccessTokenValid(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('authToken');
  const expiry = localStorage.getItem('tokenExpiry');

  if (!token || !expiry) return false;

  return Date.now() < parseInt(expiry, 10);
}

export async function refreshAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refreshToken');
  const refreshExpiry = localStorage.getItem('refreshExpiry');

  if (!refreshToken || !refreshExpiry) return null;
  if (Date.now() >= parseInt(refreshExpiry, 10)) return null;

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) throw new Error('Refresh failed');

    const data = await response.json();
    localStorage.setItem('authToken', data.accessToken);
    localStorage.setItem('tokenExpiry', String(Date.now() + (data.expiresIn * 1000)));

    return data.accessToken;
  } catch (error) {
    clearAuthTokens();
    return null;
  }
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('refreshExpiry');
}
```

#### Step 3.2: Update Auth Context

**File**: `frontend/src/lib/auth-context.tsx`

```tsx
import { storeAuthTokens, clearAuthTokens } from './auth-utils';

const login = async (email: string, password: string) => {
  const response = await apiLogin(email, password);

  // Store tokens
  storeAuthTokens(
    response.accessToken,
    response.refreshToken,
    response.expiresIn,
    response.refreshExpiresIn
  );

  setUser(response.user);

  // Check for return URL
  const returnUrl = localStorage.getItem('returnUrl');
  localStorage.removeItem('returnUrl');

  router.push(returnUrl || '/dashboard');
};

const logout = () => {
  clearAuthTokens();
  setUser(null);
  router.push('/login');
};
```

---

## Testing Checklist

### P1 Tests (Critical - Must Pass)

- [ ] Navigate to `/dashboard` while logged in → No client-side error
- [ ] Navigate to `/dashboard` while logged out → Redirect to `/login`
- [ ] Refresh page on `/dashboard` while logged in → Page reloads successfully
- [ ] View browser console on `/dashboard` → No errors or warnings
- [ ] ThemeContext switches between light/dark → No console errors

### P2 Tests (Important - Should Pass)

- [ ] Login with valid credentials → Redirect to `/dashboard` (not `/tasks`)
- [ ] Signup new account → Redirect to `/dashboard` (not `/tasks`)
- [ ] Home page auto-redirect if logged in → Goes to `/dashboard`
- [ ] Attempt to access `/dashboard` without auth → Store returnUrl, redirect to login → After login, return to `/dashboard`

### P3 Tests (Nice-to-have)

- [ ] Home page at `/` shows latest content (may require cache clear)
- [ ] Hard refresh home page (Ctrl+Shift+R) → Latest version loads

---

## Deployment

### Build Test

```bash
cd frontend
npm run build

# Check for errors
# Verify output: "export" mode completed successfully
# Check .next/static/ directory created
```

### GitHub Pages Deployment

```bash
# Ensure GITHUB_PAGES environment variable set
export GITHUB_PAGES=true

# Build with base path
npm run build

# Commit changes
git add .
git commit -m "fix(dashboard): resolve routing and SSR issues

- Add ErrorBoundary to dashboard route
- Fix SSR guards in ThemeContext
- Update auth redirects from /tasks to /dashboard
- Support JWT refresh token flow"

git push origin 007-fix-dashboard-access

# Create PR
gh pr create --title "Fix Dashboard Access and Routing" --body "Fixes P1 client-side exception, P2 auth redirects, and P3 home page caching issues"
```

### Verify Production

After GitHub Actions deploys:

1. Visit `https://razaib-khan.github.io/Hackathon-2-Five-Phases/dashboard/`
2. Should load without errors
3. Login and verify redirect to dashboard
4. Check browser console for any errors

---

## Troubleshooting

### Issue: Still seeing "Application error" on dashboard

**Cause**: SSR guards not comprehensive enough
**Fix**: Add more `typeof window !== 'undefined'` checks to any code accessing browser APIs

### Issue: Login redirects to /tasks (404)

**Cause**: auth-context.tsx not updated
**Fix**: Find and replace all `router.push('/tasks')` with `router.push('/dashboard')`

### Issue: Home page still shows old version

**Cause**: Browser or CDN cache
**Fix**:
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Wait 5-10 minutes for GitHub Pages CDN to update

### Issue: Token refresh not working

**Cause**: Backend doesn't return refreshToken
**Fix**: Verify backend API returns `refreshToken` and `refreshExpiresIn` in login/signup responses

---

## Files Changed Summary

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `frontend/src/app/dashboard/page.tsx` | ~10 | Add ErrorBoundary wrapper |
| `frontend/src/contexts/ThemeContext.tsx` | ~15 | Add SSR guards |
| `frontend/src/lib/auth-context.tsx` | ~3 | Fix redirect routes |
| `frontend/src/app/page.tsx` | ~1 | Fix redirect route |
| `frontend/src/lib/auth-utils.ts` | +80 (new) | Token management utilities |

**Total LOC**: ~100 lines changed/added

---

## Next Steps After Implementation

1. Test all P1 scenarios ✅
2. Test all P2 scenarios ✅
3. Create PR with descriptive title/body
4. Request code review
5. Merge to main after approval
6. Monitor production for any errors
7. Close related GitHub issues

---

## Support

**Questions?** Check:
- Specification: `specs/007-fix-dashboard-access/spec.md`
- Research: `specs/007-fix-dashboard-access/research.md`
- Data Model: `specs/007-fix-dashboard-access/data-model.md`
- API Contracts: `specs/007-fix-dashboard-access/contracts/auth-api.md`
