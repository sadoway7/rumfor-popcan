# Roles & Permissions

## Goal
- Verify RBAC enforcement across routes.

## Focus Areas
- Role checks in auth middleware.
- Admin-only access enforcement.
- Consistent error responses for unauthorized access.
- Role-based landing routes after login.
- Permissions for community actions (photos, hashtags, comments).

## Files to Inspect
- `backend/src/middleware/auth.js`
- `backend/src/routes/admin.js`
- `backend/src/routes/users.js`

## Success Criteria
- All protected routes are gated by role checks.
- Unauthorized access returns correct status codes.
- Read-only guests cannot vote or upload.
