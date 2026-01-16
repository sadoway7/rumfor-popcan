# Email Verification

## Goal
- Ensure email verification works for live users.

## Focus Areas
- Token generation, expiry, and storage.
- Verified flags on user records.
- Re-send flow and edge cases.

## Files to Inspect
- `backend/src/controllers/authController.js`
- `backend/src/services/emailService.js`
- `backend/src/models/User.js`

## Success Criteria
- Users can verify successfully and re-send tokens.
- Verified users cannot re-verify.

