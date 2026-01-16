# MongoDB Connection Health

## Goal
- Confirm live MongoDB connectivity for the backend using the production connection string.

## Focus Areas
- Validate env var usage (`MONGODB_URI`/`DATABASE_URL`).
- Ensure Mongoose connects with retry/backoff and timeouts.
- Add a startup health check endpoint and log connection errors.

## Files to Inspect
- `backend/config/database.js`
- `backend/src/server.js`
- `.env` or `.env.example`

## Success Criteria
- Backend logs a successful connection on startup.
- Failed connections provide actionable logs and retry logic.

