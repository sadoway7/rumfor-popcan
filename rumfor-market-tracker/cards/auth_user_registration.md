# User Registration

## Goal
- Ensure new users are created correctly in the live MongoDB database.

## Focus Areas
- Validation and normalization of user input.
- Unique constraints for email/username.
- Password hashing and default role assignment.
- Duplicate key error handling.

## Files to Inspect
- `backend/src/controllers/authController.js`
- `backend/src/models/User.js`
- `backend/src/routes/auth.js`

## Success Criteria
- Duplicate users are rejected with clear errors.
- New users have valid defaults and hashed passwords.

