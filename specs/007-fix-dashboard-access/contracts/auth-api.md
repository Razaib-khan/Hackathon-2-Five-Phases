# Authentication API Contract

**Feature**: 007-fix-dashboard-access
**Contract Version**: 1.0.0
**Date**: 2026-01-05

## Overview

API contract updates for authentication endpoints to support JWT access/refresh token flow with proper expiration handling. These contracts define the expected behavior for client-side authentication state management.

---

## POST /api/auth/refresh

**Purpose**: Exchange a valid refresh token for a new access token

### Request

**Method**: POST
**Content-Type**: application/json
**Authorization**: None (refresh token sent in body)

**Body**:
```json
{
  "refreshToken": "string"  // JWT refresh token from localStorage
}
```

**Body Schema**:
```typescript
interface RefreshTokenRequest {
  refreshToken: string;  // Required, non-empty JWT string
}
```

### Response

**Success (200 OK)**:
```json
{
  "accessToken": "string",   // New JWT access token
  "expiresIn": 3600          // Seconds until expiration (1 hour = 3600)
}
```

**Response Schema**:
```typescript
interface RefreshTokenResponse {
  accessToken: string;   // JWT string with 1-hour expiration
  expiresIn: number;     // Seconds (always 3600 for 1-hour tokens)
}
```

**Error Responses**:

```json
// 401 Unauthorized - Refresh token expired or invalid
{
  "error": "invalid_token",
  "message": "Refresh token expired or invalid"
}

// 400 Bad Request - Missing refresh token
{
  "error": "missing_token",
  "message": "Refresh token required"
}

// 500 Internal Server Error
{
  "error": "server_error",
  "message": "Failed to refresh token"
}
```

### Client Behavior

1. Call this endpoint when access token expires (tokenExpiry < Date.now())
2. Store new accessToken in localStorage as 'authToken'
3. Calculate new tokenExpiry = Date.now() + (expiresIn * 1000)
4. Retry original API call with new token
5. If refresh fails with 401, clear all tokens and redirect to login

---

## POST /api/auth/login

**Purpose**: Authenticate user and receive JWT tokens

### Request

**Method**: POST
**Content-Type**: application/json

**Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

### Response

**Success (200 OK)** - **UPDATED to include refresh token**:
```json
{
  "accessToken": "string",      // JWT access token (1-hour expiration)
  "refreshToken": "string",     // JWT refresh token (7-day expiration)
  "expiresIn": 3600,            // Seconds until access token expires
  "refreshExpiresIn": 604800,   // Seconds until refresh token expires (7 days)
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Response Schema**:
```typescript
interface LoginResponse {
  accessToken: string;        // 1-hour JWT
  refreshToken: string;       // 7-day JWT
  expiresIn: number;          // 3600 (1 hour in seconds)
  refreshExpiresIn: number;   // 604800 (7 days in seconds)
  user: {
    id: string;
    email: string;
    name: string;
  };
}
```

### Client Behavior

1. On success, store in localStorage:
   - `authToken` = accessToken
   - `refreshToken` = refreshToken
   - `tokenExpiry` = Date.now() + (expiresIn * 1000)
   - `refreshExpiry` = Date.now() + (refreshExpiresIn * 1000)
2. Read `returnUrl` from localStorage
3. Navigate to `returnUrl || "/dashboard"`
4. Clear `returnUrl` from localStorage

**Error Responses**:
```json
// 401 Unauthorized - Invalid credentials
{
  "error": "invalid_credentials",
  "message": "Invalid email or password"
}

// 400 Bad Request - Missing fields
{
  "error": "missing_fields",
  "message": "Email and password required"
}
```

---

## POST /api/auth/signup

**Purpose**: Create new user account and receive JWT tokens

### Request

**Method**: POST
**Content-Type**: application/json

**Body**:
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

### Response

**Success (201 Created)** - **UPDATED to include refresh token**:
```json
{
  "accessToken": "string",      // JWT access token (1-hour expiration)
  "refreshToken": "string",     // JWT refresh token (7-day expiration)
  "expiresIn": 3600,            // Seconds until access token expires
  "refreshExpiresIn": 604800,   // Seconds until refresh token expires
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Response Schema**: Same as LoginResponse

### Client Behavior

Same as login - store tokens, check returnUrl, navigate to dashboard

**Error Responses**:
```json
// 409 Conflict - Email already exists
{
  "error": "email_exists",
  "message": "Email already registered"
}

// 400 Bad Request - Invalid input
{
  "error": "validation_error",
  "message": "Invalid email format or password too weak"
}
```

---

## GET /api/auth/validate

**Purpose**: Validate current access token (optional - can validate client-side)

### Request

**Method**: GET
**Authorization**: Bearer {accessToken}

### Response

**Success (200 OK)**:
```json
{
  "valid": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  },
  "expiresAt": 1672531200000  // Unix timestamp (ms)
}
```

**Error Responses**:
```json
// 401 Unauthorized - Token invalid or expired
{
  "valid": false,
  "error": "invalid_token"
}
```

### Client Behavior

Optional - can validate tokens client-side by checking JWT expiration claim. Use this endpoint only if needing to verify token hasn't been revoked server-side.

---

## Client-Side Token Management

### Storage Strategy

```typescript
// After successful login/signup
function storeAuthTokens(response: LoginResponse) {
  localStorage.setItem('authToken', response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
  localStorage.setItem('tokenExpiry', String(Date.now() + (response.expiresIn * 1000)));
  localStorage.setItem('refreshExpiry', String(Date.now() + (response.refreshExpiresIn * 1000)));
}

// Before making API calls
function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem('authToken');
  const expiry = localStorage.getItem('tokenExpiry');

  if (!token || !expiry) return Promise.resolve(null);

  const expiryTime = parseInt(expiry, 10);

  if (Date.now() < expiryTime) {
    return Promise.resolve(token);  // Token still valid
  }

  // Token expired, try refresh
  return refreshAuthToken();
}

async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  const refreshExpiry = localStorage.getItem('refreshExpiry');

  if (!refreshToken || !refreshExpiry) return null;

  const refreshExpiryTime = parseInt(refreshExpiry, 10);
  if (Date.now() >= refreshExpiryTime) {
    // Refresh token also expired
    clearAuthTokens();
    return null;
  }

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

function clearAuthTokens() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('refreshExpiry');
}
```

---

## Error Handling Contract

### Standard Error Response Format

All auth endpoints return errors in this format:

```typescript
interface AuthErrorResponse {
  error: string;    // Machine-readable error code
  message: string;  // Human-readable error message
  details?: any;    // Optional additional context
}
```

### Error Codes

| Code | HTTP Status | Meaning | Client Action |
|------|-------------|---------|---------------|
| `invalid_credentials` | 401 | Wrong email/password | Show error message |
| `invalid_token` | 401 | Token expired/invalid | Clear tokens, redirect login |
| `missing_token` | 400 | Token not provided | Clear tokens, redirect login |
| `email_exists` | 409 | Email already registered | Show error, suggest login |
| `validation_error` | 400 | Invalid input format | Show validation errors |
| `server_error` | 500 | Internal server error | Show retry option |

---

## Security Requirements

1. **HTTPS Only**: All auth endpoints MUST be called over HTTPS in production
2. **No Token in URL**: Never pass tokens in URL query params or fragments
3. **Authorization Header**: Use `Authorization: Bearer {token}` for protected endpoints
4. **Token Storage**: Store tokens in localStorage (acceptable for SPA with GitHub Pages constraints)
5. **Token Expiration**: Always check expiration before using tokens
6. **Error Logging**: Log authentication failures (console.error) with sanitized data (no tokens/passwords)

---

## Testing Contract

### Test Cases

1. **Successful Login**:
   - POST /api/auth/login with valid credentials
   - Expect 200 with accessToken, refreshToken, expiresIn, refreshExpiresIn
   - Verify tokens stored in localStorage
   - Verify redirect to returnUrl or /dashboard

2. **Token Refresh**:
   - POST /api/auth/refresh with valid refresh token
   - Expect 200 with new accessToken
   - Verify localStorage updated with new token and expiry

3. **Expired Refresh Token**:
   - POST /api/auth/refresh with expired refresh token
   - Expect 401 error
   - Verify all tokens cleared from localStorage
   - Verify redirect to /login with returnUrl set

4. **Direct Dashboard Access (No Auth)**:
   - Navigate to /dashboard without tokens
   - Verify returnUrl = "/dashboard" stored in localStorage
   - Verify redirect to /login

5. **Post-Login Redirect**:
   - Set returnUrl = "/dashboard" in localStorage
   - Complete login flow
   - Verify redirect to /dashboard
   - Verify returnUrl cleared from localStorage

---

## Backward Compatibility

**Existing Code**:
- Uses `localStorage.getItem('authToken')` for access token
- Login/signup endpoints may not return refreshToken yet

**Migration Path**:
1. Update backend to return refreshToken, expiresIn, refreshExpiresIn in login/signup responses
2. Update frontend to store additional token metadata
3. Add refresh token logic to API interceptor
4. Existing sessions continue working until next login (no forced logout)

**Graceful Degradation**:
- If refreshToken missing, treat like expired session → redirect to login
- If tokenExpiry missing, assume token valid until API returns 401
- Backward compatible with existing authToken-only storage

---

## Implementation Notes

**Files to Update**:
1. `frontend/src/lib/api.ts` - Add token refresh logic
2. `frontend/src/lib/auth-context.tsx` - Update login/signup to store refresh token
3. Create `frontend/src/lib/auth-utils.ts` - Token validation and refresh utilities

**Constants**:
```typescript
export const TOKEN_EXPIRY_SECONDS = 3600;        // 1 hour
export const REFRESH_EXPIRY_SECONDS = 604800;    // 7 days
export const TOKEN_REFRESH_BUFFER_MS = 60000;    // Refresh 1 min before expiry
```
