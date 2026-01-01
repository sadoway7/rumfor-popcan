# Advanced Troubleshooting Rules for Wasp Projects

## General Debugging Approach

1. **Check Logs**: Always start by examining server and client console logs for error messages.
2. **Verify Configuration**: Ensure `main.wasp` is correctly configured with proper imports and declarations.
3. **Database Issues**: Check `schema.prisma` for schema mismatches and run migrations if needed.
4. **Dependencies**: Verify all npm/yarn dependencies are installed and compatible.

## Common Wasp Issues

### Authentication Problems
- Check if auth is properly configured in `main.wasp`
- Verify user entity exists in schema
- Test login/signup flows manually

### Operation Errors
- Ensure operations are declared in `main.wasp`
- Check TypeScript types match between client and server
- Verify database queries are valid

### Frontend Rendering Issues
- Check React component imports
- Verify Tailwind CSS classes
- Inspect network requests in browser dev tools

### Payment Integration
- Confirm webhook endpoints are configured
- Test payment flows in development
- Check environment variables for payment providers

## Browser Tools Usage
- Use React DevTools for component inspection
- Network tab for API call debugging
- Console for runtime errors

## Wasp-Specific Commands
- `wasp clean` to clear build artifacts
- `wasp db migrate-dev` for database issues
- `wasp start` with verbose logging