# Authentication System

This directory contains the authentication and authorization implementation for the admin command center dashboard.

## Overview

The authentication system provides:
- Session-based authentication using HTTP-only cookies
- Token-based authentication for WebSocket/SSE connections
- Route protection middleware for admin pages
- Role-based access control (RBAC)

## Components

### Session Management (`session.ts`)

Handles user session creation, validation, and management using HTTP-only cookies.

**Key Functions:**
- `getSession()` - Retrieves the current user session from cookies
- `isAdmin()` - Checks if the current user has admin role
- `setSession(session)` - Creates a new session cookie
- `clearSession()` - Removes the session cookie
- `getAuthToken()` - Generates a token for API/WebSocket authentication

### Token Verification (`token.ts`)

Provides token-based authentication for WebSocket and API requests.

**Key Functions:**
- `createAuthToken(session)` - Creates an authentication token from a session
- `verifyAuthToken(token)` - Validates and decodes an authentication token
- `extractBearerToken(authHeader)` - Extracts token from Authorization header

## Usage

### Protecting Routes

Routes are automatically protected by the Next.js middleware (`middleware.ts` in project root).

All routes under `/admin/*` require admin authentication.

### Login Flow

1. User submits credentials to `/api/auth/login`
2. Server validates credentials and creates session cookie
3. User is redirected to the requested admin page
4. Middleware verifies session on each request

### WebSocket Authentication

1. Client fetches auth token from `/api/auth/token`
2. Token is passed to WebSocket/SSE endpoint via URL parameter
3. Server validates token and establishes connection

## API Endpoints

### POST `/api/auth/login`
Authenticates user and creates session.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "admin-001",
    "email": "admin@example.com",
    "role": "admin",
    "name": "Admin User"
  }
}
```

### POST `/api/auth/logout`
Clears user session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET `/api/auth/session`
Returns current user session.

**Response:**
```json
{
  "user": {
    "userId": "admin-001",
    "email": "admin@example.com",
    "role": "admin",
    "name": "Admin User"
  }
}
```

### GET `/api/auth/token`
Returns authentication token for WebSocket/API requests.

**Response:**
```json
{
  "token": "eyJhbGc..."
}
```

## Development Credentials

For development and testing, use these credentials:

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

**Regular User:**
- Email: `user@example.com`
- Password: `user123`

## Security Notes

⚠️ **This is a simplified implementation for development/testing.**

For production, you should:

1. **Use a proper authentication library** like NextAuth.js, Auth0, or Clerk
2. **Hash passwords** using bcrypt or similar
3. **Use JWT tokens** with proper signing (RS256 or HS256)
4. **Implement token refresh** mechanism
5. **Add rate limiting** to prevent brute force attacks
6. **Use HTTPS** in production
7. **Implement CSRF protection**
8. **Add session expiration** and cleanup
9. **Store sessions** in a database or Redis
10. **Add audit logging** for authentication events

## Migration to Production Auth

To migrate to a production-ready authentication system:

1. Install NextAuth.js: `npm install next-auth`
2. Replace session management with NextAuth providers
3. Update middleware to use NextAuth session validation
4. Update WebSocket authentication to use NextAuth tokens
5. Remove mock user database and implement real user storage

## Testing

To test authentication:

1. Navigate to `/login`
2. Enter admin credentials
3. Verify redirect to `/admin/command-center`
4. Check that WebSocket connection authenticates successfully
5. Test logout functionality
6. Verify unauthorized access is blocked

## Troubleshooting

**Issue: "Missing authentication token" error**
- Ensure you're logged in
- Check that session cookie is set
- Verify token endpoint returns valid token

**Issue: "Invalid or expired token" error**
- Token may have expired (1 hour lifetime)
- Log out and log back in to refresh token

**Issue: "Insufficient permissions" error**
- User account must have admin role
- Check user role in session data
