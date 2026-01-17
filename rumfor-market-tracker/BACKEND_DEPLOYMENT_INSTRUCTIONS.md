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
  -e JWT_SECRET=rumfor-jwt-secret-2024-secure-key-change-this-in-production \
  -e JWT_REFRESH_SECRET=rumfor-refresh-secret-2024-secure-key-change-this-in-production \
  -e NODE_ENV=production \
  -e FRONTEND_URL=https://rumfor.sadoway.ca \
  -e SESSION_SECRET=rumfor-session-secret-2024-secure-key-change-this-in-production \
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

## Environment Variables Used

Backend configured with:
- `MONGODB_URI`: mongodb+srv://sadoway_db_user:Oswald1986!@popcan.yd4d9hs.mongodb.net/?appName=popcan
- `JWT_SECRET`: rumfor-jwt-secret-2024-secure-key-change-this-in-production
- `JWT_REFRESH_SECRET`: rumfor-refresh-secret-2024-secure-key-change-this-in-production
- `NODE_ENV`: production
- `FRONTEND_URL`: https://rumfor.sadoway.ca
- `SESSION_SECRET`: rumfor-session-secret-2024-secure-key-change-this-in-production

## Troubleshooting

- **Database Connection**: Check MongoDB Atlas IP whitelist includes your server IP
- **Port Conflicts**: Ensure port 3001 is available
- **CORS Issues**: Verify FRONTEND_URL matches your GitLab Pages domain
- **Container Logs**: Use `docker logs rumfor-backend` for debugging

The fix is complete - deploy the backend container and update the frontend API URL!