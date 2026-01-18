# GitLab CI/CD Environment Variables Configuration
# This file documents all environment variables that need to be configured in GitLab

## Required Environment Variables

### API Configuration
VITE_API_BASE_URL=https://your-api-endpoint.com/api
VITE_API_TIMEOUT=30000

### Authentication Configuration
VITE_AUTH_DOMAIN=your-auth-domain.auth0.com
VITE_AUTH_CLIENT_ID=your-auth-client-id
VITE_AUTH_AUDIENCE=your-auth-audience

### Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rumfor-market-tracker
DB_NAME=rumfor-market-tracker

### Backend Security Configuration (Required for Production)
JWT_SECRET=your-256-bit-jwt-secret-here
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-here
SESSION_SECRET=your-256-bit-session-secret-here
FRONTEND_URL=https://rumfor.sadoway.ca

### Third-party Services
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
VITE_ANALYTICS_ID=your-analytics-id

### Deployment Configuration
DEPLOY_ENVIRONMENT=production
DEPLOY_URL=https://your-domain.com

## Optional Environment Variables

### Development/Testing
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
VITE_MOCK_API=false

### Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_OFFLINE_MODE=false

### External Integrations
VITE_SENTRY_DSN=your-sentry-dsn
VITE_INTERCOM_APP_ID=your-intercom-app-id

## GitLab CI/CD Variables Setup Instructions

1. Go to your GitLab project
2. Navigate to Settings > CI/CD > Variables
3. Add the following variables:

### Masked Variables (sensitive data)
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SESSION_SECRET`
- `DEPLOYMENT_TOKEN`
- `DATABASE_URL`
- `VITE_AUTH_SECRET_KEY`

### Protected Variables (production only)
- `VITE_API_BASE_URL`
- `VITE_STRIPE_PUBLIC_KEY`

### Unprotected Variables (available in all environments)
- `VITE_DEBUG_MODE`
- `VITE_LOG_LEVEL`
- `NODE_VERSION`

## Environment-specific Configurations

### Development Environment
- Branch: `develop`
- Variables: Use development endpoints
- Features: Debug mode enabled, mock APIs allowed

### Staging Environment  
- Branch: `staging`
- Variables: Use staging endpoints
- Features: Production-like setup, logging enabled

### Production Environment
- Branch: `main`
- Variables: Use production endpoints
- Features: Optimized, secure, monitored

## Security Best Practices

1. Never commit secrets to the repository
2. Use GitLab's built-in secret management
3. Rotate secrets regularly
4. Use different secrets for each environment
5. Limit access to sensitive variables
6. Enable audit logging for variable access

## Variable Types and Masking

- **Masked**: Variables that contain sensitive data (passwords, API keys)
- **Protected**: Variables available only on protected branches
- **Expanded**: Variables that can be used in job scripts
- **Environment scope**: Limit variables to specific environments