# Session Security

## Goal
- Harden login and session behavior for live users.

## Focus Areas
- Rate limiting and throttling for login.
- Lockout on repeated failures.
- Optional session/device tracking.

## Files to Inspect
- `backend/src/middleware/rateLimiter.js`
- `backend/src/controllers/authController.js`

## Success Criteria
- Login throttling works without blocking valid users.

