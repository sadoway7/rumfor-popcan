# User Login API

## Goal
- Make login reliable and secure with live MongoDB data.

## Focus Areas
- Input validation and normalization.
- Password hash verification.
- Token issuance (access/refresh).
- Consistent API responses and error handling.
- Login UX alignment: remember device, show caps lock warning, and support passwordless fallback.

## Flow Notes
1. Enter email + password
2. Inline validation (email format, required fields)
3. Optional “remember device” checkbox
4. Submit → loading state
5. Success → redirect to role-based landing
6. Failure → safe error + lockout hint

## Files to Inspect
- `backend/src/controllers/authController.js`
- `backend/src/routes/auth.js`
- `backend/src/middleware/auth.js`

## Success Criteria
- Valid users can log in consistently.
- Invalid credentials return clear, safe errors.
- Locked accounts show reset link and cooldown timer.
