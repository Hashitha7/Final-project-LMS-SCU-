# JWT Authentication Implementation - Modernistic LMS

## Overview
This document describes the complete JWT (JSON Web Token) authentication and authorization system implemented for the Modernistic LMS LMS platform.

## Backend Implementation

### 1. Dependencies Added (pom.xml)
- `spring-boot-starter-security` - Spring Security framework
- `jjwt-api` (0.11.5) - JWT API
- `jjwt-impl` (0.11.5) - JWT implementation
- `jjwt-jackson` (0.11.5) - JWT JSON processing

### 2. Security Components

#### a. UserDetailsImpl (`security/UserDetailsImpl.java`)
- Implements Spring Security's `UserDetails` interface
- Wraps the User entity for authentication
- Provides user authorities based on roles (STUDENT, TEACHER, ADMIN)

#### b. UserDetailsServiceImpl (`security/UserDetailsServiceImpl.java`)
- Implements `UserDetailsService` interface
- Loads user from database by email
- Used by Spring Security for authentication

#### c. JwtUtils (`security/JwtUtils.java`)
- Generates JWT tokens from authenticated users
- Validates JWT tokens
- Extracts username (email) from tokens
- Configurable secret key and expiration time

#### d. AuthTokenFilter (`security/AuthTokenFilter.java`)
- Intercepts HTTP requests
- Extracts JWT from Authorization header (Bearer token)
- Validates token and sets authentication in SecurityContext
- Runs before every request to protected endpoints

#### e. AuthEntryPointJwt (`security/AuthEntryPointJwt.java`)
- Handles unauthorized access attempts
- Returns 401 Unauthorized error

#### f. WebSecurityConfig (`config/WebSecurityConfig.java`)
- Configures Spring Security filter chain
- Permits `/api/auth/**` endpoints without authentication
- Requires authentication for all other endpoints
- Disables CSRF (using JWT instead)
- Stateless session management

### 3. Authentication Controller (`controller/AuthController.java`)

#### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "STUDENT",
  "mobile": "1234567890",
  "grade": "10th"
}
```

#### POST /api/auth/register
**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "mobile": "1234567890",
  "grade": "10th",
  "role": "student"
}
```

**Response:**
```json
{
  "message": "User registered successfully!"
}
```

### 4. User Controller Enhancement

#### GET /api/users/me
- Returns current authenticated user's details
- Requires valid JWT token in Authorization header
- Used by frontend to load user profile after login

### 5. Configuration (application.properties)
```properties
# JWT Configuration
Modernistic LMS.app.jwtSecret=Modernistic LMSSecretKeyForJwtAuthenticationShouldBeLongEnoughToBeeSecure1234567890
Modernistic LMS.app.jwtExpirationMs=86400000  # 24 hours
```

### 6. Password Encryption
- Uses BCrypt password encoder
- Passwords are hashed before storing in database
- Demo users have password: `demo123` (pre-hashed in DataSeeder)

## Frontend Implementation

### 1. API Client Updates (`lib/api.js`)

#### Request Interceptor
- Automatically attaches JWT token from localStorage to all API requests
- Adds `Authorization: Bearer <token>` header

#### Response Interceptor
- Handles 401 Unauthorized responses
- Clears invalid/expired tokens
- Redirects to login page

#### Auth API Endpoints
```javascript
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};
```

### 2. AuthContext Updates (`contexts/AuthContext.jsx`)

#### Login Flow
1. Sends email and password to `/api/auth/login`
2. Receives JWT token and user details
3. Stores token in localStorage
4. Loads user profile from `/api/users/me`

#### Registration Flow
1. Sends user data to `/api/auth/register`
2. Automatically logs in after successful registration
3. Redirects to dashboard

#### User Loading
- Fetches current user from `/api/users/me` on app load
- Validates token expiration
- Clears invalid tokens automatically

### 3. Token Storage
- Key: `eduflow-auth-token`
- Stored in browser's localStorage
- Persists across browser sessions
- Automatically cleared on logout or 401 errors

## Security Features

### 1. Role-Based Access Control (RBAC)
- Three roles: STUDENT, TEACHER, ADMIN
- Each role has specific authorities
- Backend endpoints can be protected by role using `@PreAuthorize`

### 2. Token Security
- Tokens are signed with HMAC-SHA256
- Secret key is configurable and should be kept secure
- Tokens expire after 24 hours (configurable)
- Stateless authentication (no server-side sessions)

### 3. Password Security
- BCrypt hashing with salt
- Minimum 6 characters required
- Passwords never stored in plain text

### 4. CORS Protection
- `@CrossOrigin` configured on AuthController
- Can be customized for production environments

## Testing

### Demo Credentials
All demo users have password: `demo123`

1. **Student:**
   - Email: `alex@Modernistic LMS.com`
   - Role: STUDENT

2. **Teacher:**
   - Email: `james@Modernistic LMS.com`
   - Role: TEACHER

3. **Admin:**
   - Email: `admin@Modernistic LMS.com`
   - Role: ADMIN

### Testing Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@Modernistic LMS.com","password":"demo123"}'
```

### Testing Protected Endpoint
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Production Considerations

### 1. Environment Variables
Move sensitive configuration to environment variables:
```properties
Modernistic LMS.app.jwtSecret=${JWT_SECRET}
Modernistic LMS.app.jwtExpirationMs=${JWT_EXPIRATION:86400000}
```

### 2. HTTPS
- Always use HTTPS in production
- Prevents token interception

### 3. Token Refresh
- Consider implementing refresh tokens for better UX
- Current implementation requires re-login after 24 hours

### 4. Rate Limiting
- Implement rate limiting on auth endpoints
- Prevents brute force attacks

### 5. CORS Configuration
- Update CORS settings for production domain
- Remove wildcard `*` origins

### 6. Logging
- Log authentication attempts
- Monitor for suspicious activity
- Implement audit trails

## Architecture Diagram

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         │ 1. POST /api/auth/login
         │    {email, password}
         ▼
┌─────────────────────────────┐
│   AuthController            │
│   - authenticateUser()      │
└────────┬────────────────────┘
         │
         │ 2. Authenticate
         ▼
┌─────────────────────────────┐
│   AuthenticationManager     │
└────────┬────────────────────┘
         │
         │ 3. Load user
         ▼
┌─────────────────────────────┐
│   UserDetailsServiceImpl    │
│   - loadUserByUsername()    │
└────────┬────────────────────┘
         │
         │ 4. Find by email
         ▼
┌─────────────────────────────┐
│   UserRepository            │
│   - findByEmail()           │
└────────┬────────────────────┘
         │
         │ 5. Return User
         ▼
┌─────────────────────────────┐
│   JwtUtils                  │
│   - generateJwtToken()      │
└────────┬────────────────────┘
         │
         │ 6. Return JWT + User Data
         ▼
┌─────────────────────────────┐
│   Frontend                  │
│   - Store token             │
│   - Set Authorization header│
└─────────────────────────────┘
```

## Request Flow for Protected Endpoints

```
┌─────────────────┐
│   Frontend      │
│   GET /api/users│
│   + JWT Token   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   AuthTokenFilter           │
│   - Extract JWT from header │
│   - Validate token          │
│   - Set Authentication      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   UserController            │
│   - Process request         │
│   - Access user from        │
│     SecurityContext         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Response with data        │
└─────────────────────────────┘
```

## Summary

The JWT authentication system provides:
- ✅ Secure, stateless authentication
- ✅ Role-based authorization
- ✅ Password encryption with BCrypt
- ✅ Token-based API access
- ✅ Automatic token validation
- ✅ Frontend-backend integration
- ✅ User session management
- ✅ Protected API endpoints

All authentication and authorization functionality is now properly implemented and ready for use!

