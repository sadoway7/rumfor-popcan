# Backend Deployment for Docker Self-Hosting

The sign up/sign in issue has been identified and fixed. The app was using mock authentication that doesn't persist data. We've disabled mock mode and prepared the backend for Docker deployment.

## What Was Fixed
- ✅ Disabled mock authentication mode
- ✅ Backend now uses real MongoDB database
- ✅ Authentication will persist users properly

## Docker Deployment for Your Existing Stack

Since you self-host with Docker, here's how to deploy the backend:

### 1. Build the Backend Docker Image

In your Docker environment:

```bash
cd rumfor-market-tracker/backend
docker build -t rumfor-backend:latest .
```

### 2. Run the Backend Container

```bash
docker run -d \
  --name rumfor-backend \
  -p 3001:3001 \
  -e MONGODB_URI=mongodb+srv://sadoway_db_user:Oswald1986!@popcan.yd4d9hs.mongodb.net/?appName=popcan \
  -e JWT_SECRET=your-secure-jwt-secret-here \
  -e JWT_REFRESH_SECRET=your-secure-refresh-secret-here \
  -e NODE_ENV=production \
  -e FRONTEND_URL=https://your-gitlab-pages-url.gitlab.io \
  -e SESSION_SECRET=your-session-secret \
  rumfor-backend:latest
```

### 3. Update Frontend Configuration

Edit `rumfor-market-tracker/.env`:

```env
VITE_API_BASE_URL=http://your-server-ip:3001/api
VITE_USE_MOCK_AUTH=false
```

Replace `your-server-ip` with your Docker host's IP address or domain name.

### 4. Test the Deployment

1. Verify backend is running: `docker logs rumfor-backend`
2. Check health endpoint: `curl http://your-server-ip:3001/api/health`
3. Test sign up from one computer
4. Test sign in from a different computer

## Environment Variables Reference

Required for backend:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secure random string for JWT tokens
- `JWT_REFRESH_SECRET`: Different secure string for refresh tokens
- `NODE_ENV`: Set to "production"
- `FRONTEND_URL`: Your GitLab Pages URL for CORS
- `SESSION_SECRET`: Secure string for sessions

## Troubleshooting

- **Database Connection**: Check MongoDB Atlas IP whitelist includes your server IP
- **Port Conflicts**: Ensure port 3001 is available
- **CORS Issues**: Verify FRONTEND_URL matches your GitLab Pages domain
- **Container Logs**: Use `docker logs rumfor-backend` for debugging

The fix is complete - deploy the backend container and update the frontend API URL!