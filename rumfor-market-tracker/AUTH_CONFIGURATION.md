# Authentication System Configuration

This document explains how to configure the authentication system for different environments and authentication providers.

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Development Environment

```env
# Development Configuration
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MOCK_AUTH=true
VITE_ENABLE_DEV_LOGIN=true

# Mock Authentication (for development)
VITE_MOCK_USER_EMAIL=admin@rumfor.com
VITE_MOCK_USER_PASSWORD=password123
```

### Production Environment

```env
# Production Configuration
VITE_APP_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_MOCK_AUTH=false
VITE_ENABLE_DEV_LOGIN=false

# Authentication Provider Configuration
VITE_AUTH_PROVIDER=local
# Optional: OAuth providers
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

### Staging Environment

```env
# Staging Configuration
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://staging-api.your-domain.com/api
VITE_MOCK_AUTH=false
VITE_ENABLE_DEV_LOGIN=false
```

## Authentication Modes

### 1. Mock Authentication (Development)

When `VITE_MOCK_AUTH=true`, the system uses mock data for authentication:

- **Email**: `admin@rumfor.com`
- **Password**: `password123`
- **Roles**: `visitor`, `vendor`, `promoter`, `admin`

**Available Test Users:**
```typescript
// Admin user
{
  email: 'admin@rumfor.com',
  password: 'password123',
  role: 'admin'
}

// Vendor user
{
  email: 'vendor@rumfor.com', 
  password: 'password123',
  role: 'vendor'
}

// Promoter user
{
  email: 'promoter@rumfor.com',
  password: 'password123', 
  role: 'promoter'
}

// Visitor user
{
  email: 'visitor@rumfor.com',
  password: 'password123',
  role: 'visitor'
}
```

### 2. Real API Authentication (Production)

When `VITE_MOCK_AUTH=false`, the system connects to real APIs:

#### Local Authentication
```typescript
// API endpoints
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/refresh-token
```

#### OAuth Providers

**Google OAuth:**
```typescript
// Configure in your OAuth provider
Client ID: VITE_GOOGLE_CLIENT_ID
Redirect URI: https://your-domain.com/auth/callback/google
```

**GitHub OAuth:**
```typescript
// Configure in your OAuth provider
Client ID: VITE_GITHUB_CLIENT_ID  
Redirect URI: https://your-domain.com/auth/callback/github
```

## Configuration Options

### Auth Store Configuration

The authentication store can be configured in `src/features/auth/authStore.ts`:

```typescript
interface AuthConfig {
  // Token settings
  tokenExpirationTime: number // in minutes
  refreshTokenThreshold: number // minutes before expiration to refresh
  
  // Email verification
  requireEmailVerification: boolean
  
  // Session settings
  rememberMeDuration: number // in days
  
  // API settings
  apiTimeout: number // in milliseconds
  maxRetries: number
}
```

### Route Protection Configuration

Routes can be configured with different protection levels:

```typescript
// Public route (no authentication required)
<Route path="/public" element={<MainLayout><PublicPage /></MainLayout>} />

// Protected route (authentication required)
<Route path="/protected" element={
  <ProtectedRoute>
    <MainLayout><ProtectedPage /></MainLayout>
  </ProtectedRoute>
} />

// Protected route (email verification not required)
<Route path="/protected-basic" element={
  <ProtectedRoute requireEmailVerification={false}>
    <MainLayout><BasicProtectedPage /></MainLayout>
  </ProtectedRoute>
} />

// Role-based route (authentication + role required)
<Route path="/admin-only" element={
  <ProtectedRoute>
    <RoleRoute allowedRoles={['admin']}>
      <DashboardLayout role="admin"><AdminPage /></DashboardLayout>
    </RoleRoute>
  </ProtectedRoute>
} />
```

## User Roles and Permissions

### Available Roles

1. **Visitor** (`visitor`)
   - Browse markets
   - View public profiles
   - Basic community features

2. **Vendor** (`vendor`)
   - All visitor permissions
   - Apply to markets
   - Manage business planning
   - Track expenses and todos
   - View calendar

3. **Promoter** (`promoter`)
   - All vendor permissions
   - Create and manage markets
   - Review applications
   - Manage vendors
   - View analytics

4. **Admin** (`admin`)
   - All permissions
   - User management
   - System settings
   - Content moderation
   - Analytics dashboard

### Role Hierarchy

```
Admin > Promoter > Vendor > Visitor
```

## Email Verification

### Configuration

```typescript
// Enable/disable email verification
VITE_REQUIRE_EMAIL_VERIFICATION=true

// Email service configuration
VITE_EMAIL_SERVICE=sendgrid
VITE_EMAIL_API_KEY=your-email-api-key
VITE_FROM_EMAIL=noreply@your-domain.com
```

### Workflow

1. User registers with email
2. System sends verification email
3. User clicks verification link
4. User is redirected to email verification page
5. Email is verified and user can access protected routes

## Password Reset

### Configuration

```typescript
// Password reset settings
VITE_PASSWORD_RESET_EXPIRY=24 // hours
VITE_PASSWORD_MIN_LENGTH=8
VITE_REQUIRE_PASSWORD_COMPLEXITY=true
```

### Workflow

1. User requests password reset
2. System sends reset email with token
3. User clicks reset link
4. User enters new password
5. Password is updated and user can login

## Token Management

### JWT Configuration

```typescript
// Token settings
VITE_JWT_SECRET=your-jwt-secret
VITE_JWT_EXPIRY=60 // minutes
VITE_REFRESH_TOKEN_EXPIRY=7 // days
```

### Automatic Refresh

The system automatically refreshes tokens before expiration:

```typescript
// Refresh threshold (5 minutes before expiration)
const REFRESH_THRESHOLD = 5 * 60 * 1000

// Check every minute
setInterval(checkTokenExpiration, 60 * 1000)
```

## Security Best Practices

### Environment Variables

1. Never commit `.env` files to version control
2. Use different secrets for each environment
3. Rotate secrets regularly
4. Use strong, unique secrets

### Token Security

1. Store tokens securely (httpOnly cookies recommended)
2. Implement proper token expiration
3. Use refresh tokens for long sessions
4. Validate tokens on the server

### API Security

1. Use HTTPS in production
2. Implement rate limiting
3. Validate all inputs
4. Log security events
5. Use CORS properly

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check environment variables
   - Verify API endpoints
   - Check network connectivity

2. **Token refresh failing**
   - Check refresh token validity
   - Verify JWT secret
   - Check server time synchronization

3. **Email verification not working**
   - Check email service configuration
   - Verify email templates
   - Check spam folder

4. **Role-based access not working**
   - Verify user role in database
   - Check route configuration
   - Clear browser storage

### Debug Mode

Enable debug logging:

```env
VITE_DEBUG_AUTH=true
VITE_DEBUG_LEVEL=verbose
```

## Migration from Mock to Real Authentication

When ready to switch from mock to real authentication:

1. Update environment variables:
   ```env
   VITE_MOCK_AUTH=false
   VITE_API_BASE_URL=https://your-api.com/api
   ```

2. Update authentication provider:
   ```env
   VITE_AUTH_PROVIDER=local
   ```

3. Remove mock-specific routes and components

4. Test thoroughly in staging environment

5. Deploy to production

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the code comments
3. Check the browser console for errors
4. Verify environment configuration
5. Test with different user roles