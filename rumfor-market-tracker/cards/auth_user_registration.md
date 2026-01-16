# User Registration

## Goal
- Ensure new users are created correctly in the live MongoDB database.

## Focus Areas
- Validation and normalization of user input.
- Unique constraints for email/username.
- Password hashing and default role assignment.
- Duplicate key error handling.
- Progressive registration with role intent selection (vendor/promoter/community).
- Email verification step gating sensitive actions.

## Flow Notes
1. Choose role intent (vendor/promoter/community)
2. Enter email + password
3. Optional profile fields (business name, market interests)
4. Submit → verification email sent
5. Verified → role-based onboarding checklist

## Files to Inspect
- `backend/src/controllers/authController.js`
- `backend/src/models/User.js`
- `backend/src/routes/auth.js`

## Success Criteria
- Duplicate users are rejected with clear errors.
- New users have valid defaults and hashed passwords.
- Verification required before posting or applying to markets.
