# User Management

## Goal
- Ensure user management endpoints are safe and consistent.

## Focus Areas
- Admin-only access for list/update/deactivate.
- Validation and partial updates.
- Audit logging for sensitive changes.

## Files to Inspect
- `backend/src/controllers/usersController.js`
- `backend/src/routes/users.js`
- `backend/src/middleware/auth.js`

## Success Criteria
- RBAC enforced for all user management operations.
- Audit logs and consistent responses.

