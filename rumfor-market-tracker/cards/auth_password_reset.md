# Password Reset

## Goal
- Ensure password reset is secure and works with live users.

## Focus Areas
- Reset token generation and expiry.
- Invalid/expired token handling.
- Session invalidation after reset.

## Files to Inspect
- `backend/src/controllers/authController.js`
- `backend/src/services/emailService.js`

## Success Criteria
- Reset flow works end-to-end.
- Old sessions are invalidated.

