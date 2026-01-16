# Session Security

## Goal
- Harden login and session behavior for live users with clear, trusted UX.

## Focus Areas
- Rate limiting and throttling for login.
- Lockout on repeated failures.
- Optional session/device tracking.
- Clear verification and recovery copy to reduce abandonment.

## Files to Inspect
- `backend/src/middleware/rateLimiter.js`
- `backend/src/controllers/authController.js`

## Success Criteria
- Login throttling works without blocking valid users.
- Recovery and verification steps are understandable on mobile.
