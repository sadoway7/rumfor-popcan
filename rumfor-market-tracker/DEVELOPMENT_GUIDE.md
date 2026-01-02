# 🚀 Rumfor Market Tracker - Development Guide

Your full-stack development environment is **already running**! 🎉

## ✅ Currently Running Services

### **Frontend (React Application)**
- **Terminal**: Main application terminal
- **URL**: http://localhost:5173
- **Status**: ✅ Running
- **Technology**: Vite + React + TypeScript

### **Backend (API Server)**
- **Terminals**: 2 backend processes running
- **URL**: http://localhost:3001
- **API Base**: http://localhost:3001/api
- **Status**: ✅ Running
- **Technology**: Node.js + Express + MongoDB

### **Database (MongoDB)**
- **Container**: rumfor-mongodb (Docker)
- **Port**: 27017
- **Status**: ✅ Running
- **Connection**: localhost:27017

## 🌐 Access Your Application

### **Frontend Application**
Open your browser and go to: **http://localhost:5173**

### **Backend API Testing**
You can test API endpoints using:

```bash
# Health check
curl http://localhost:3001/api/health

# Get markets
curl http://localhost:3001/api/markets

# Test authentication
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## 🛠️ Development Commands

### **Starting the Environment (if stopped)**

#### 1. Start MongoDB Database
```bash
# Start MongoDB container
docker run -d --name rumfor-mongodb -p 27017:27017 mongo:latest

# Or restart existing container
docker start rumfor-mongodb
```

#### 2. Start Backend Server
```bash
cd rumfor-market-tracker/backend

# Install dependencies (first time only)
npm install

# Start development server with auto-reload
npm run dev

# OR start without auto-reload
node src/server.js
```

#### 3. Start Frontend Application
```bash
cd rumfor-market-tracker

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### **Stopping Services**

#### Stop Backend
```bash
# In backend terminal, press Ctrl+C
```

#### Stop Frontend
```bash
# In frontend terminal, press Ctrl+C
```

#### Stop Database
```bash
docker stop rumfor-mongodb

# Or remove container entirely
docker rm rumfor-mongodb
```

## 🔧 Development Workflow

### **1. Frontend Development**
- **Location**: `/Users/sadoway/Documents/VS Code/rumfor v2026/rumfor-v2026/rumfor-market-tracker/`
- **Main Files**: `src/` directory
- **Hot Reload**: ✅ Automatic on file changes
- **Build**: `npm run build`

### **2. Backend Development**
- **Location**: `/Users/sadoway/Documents/VS Code/rumfor v2026/rumfor-v2026/rumfor-market-tracker/backend/`
- **Main Files**: `src/` directory
- **Hot Reload**: ✅ Automatic on file changes (with nodemon)
- **API Documentation**: See `/api` routes

### **3. Database Management**
```bash
# Connect to MongoDB
docker exec -it rumfor-mongodb mongosh

# View database contents
use rumfor-market-tracker-dev
show collections

# Check running containers
docker ps
```

## 🎯 Testing Your Application

### **Frontend Testing**
1. Open http://localhost:5173
2. Browse markets
3. Try registering/login (if connected to real APIs)
4. Test responsive design

### **Backend API Testing**
1. Use Postman, curl, or browser tools
2. Test authentication endpoints
3. Test CRUD operations
4. Check error handling

### **End-to-End Testing**
1. Register a new user via frontend
2. Create a market (requires promoter role)
3. Test application workflow
4. Test todo and expense tracking

## 📁 Project Structure

```
rumfor-market-tracker/
├── src/                    # Frontend React application
│   ├── features/          # Feature modules
│   ├── components/        # UI components
│   ├── pages/            # Route components
│   └── ...
├── backend/              # Backend API server
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Database schemas
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation, etc.
│   │   └── server.js     # Main server file
│   └── ...
└── ...
```

## 🚨 Troubleshooting

### **Backend Won't Start**
```bash
# Check MongoDB is running
docker ps | grep mongo

# Check environment variables
cd backend && cat .env

# Check for syntax errors
node src/server.js
```

### **Frontend Won't Start**
```bash
# Check for TypeScript errors
npm run type-check

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Database Connection Issues**
```bash
# Restart MongoDB container
docker restart rumfor-mongodb

# Check MongoDB logs
docker logs rumfor-mongodb
```

## 🎉 Success Indicators

### **Frontend Running**
- Browser shows React app at localhost:5173
- No red errors in browser console
- Hot reload works when you edit files

### **Backend Running**
- Terminal shows "Server running on port 3001"
- Health endpoint responds: http://localhost:3001/api/health
- API endpoints return JSON responses

### **Database Connected**
- Backend terminal shows "MongoDB Connected"
- No connection errors in logs

## 🚀 Ready to Develop!

Your development environment is **fully operational** and ready for:
- ✅ Frontend feature development
- ✅ Backend API development  
- ✅ Database schema modifications
- ✅ End-to-end testing
- ✅ Production deployment preparation

**Happy coding!** 🎯