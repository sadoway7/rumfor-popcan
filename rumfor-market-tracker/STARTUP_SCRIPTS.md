# 🚀 Cross-Platform Development Startup Scripts

I've created startup scripts for **Windows**, **Mac**, and **Linux** that will launch your entire development stack with a single double-click!

## 📁 Available Scripts

### **Windows**
- **File**: `start-dev-windows.bat`
- **Usage**: Double-click to run
- **Terminal**: Command Prompt windows

### **Mac**
- **File**: `start-dev-mac.command` 
- **Usage**: Double-click to run (or run from Terminal)
- **Terminal**: macOS Terminal windows
- **Executable**: ✅ Already set with proper permissions

### **Linux**
- **File**: `start-dev-linux.sh`
- **Usage**: `./start-dev-linux.sh` or double-click
- **Terminal**: Gnome Terminal, XFCE Terminal, or XTerm
- **Executable**: ✅ Already set with proper permissions

## 🎯 What Each Script Does

### **1. MongoDB Setup**
- Checks if MongoDB container (`rumfor-mongodb`) is already running
- Starts new container if needed (port 27017)
- Uses latest MongoDB image

### **2. Dependency Management**
- Checks for `node_modules` in both frontend and backend
- Installs dependencies only if missing
- Shows progress and confirmation

### **3. Service Startup**
- **Backend**: Starts on http://localhost:3001 (with auto-reload)
- **Frontend**: Starts on http://localhost:5173 (with hot reload)
- Opens separate terminal windows for each service

### **4. User Feedback**
- Colored output (green for success, yellow for progress)
- Clear status messages
- Final summary with URLs

## 🎬 How to Use

### **On Windows:**
1. Navigate to `rumfor-market-tracker` folder
2. Double-click `start-dev-windows.bat`
3. Wait for startup completion

### **On Mac:**
1. Navigate to `rumfor-market-tracker` folder
2. Double-click `start-dev-mac.command`
3. If blocked by security, right-click → "Open"
4. Or run from Terminal: `./start-dev-mac.command`

### **On Linux:**
1. Navigate to `rumfor-market-tracker` folder
2. Run: `./start-dev-linux.sh`
3. Or double-click (if your file manager allows)

## 📋 Expected Output

```
================================================
   Rumfor Market Tracker - Development Stack
================================================

[1/5] Checking if MongoDB container exists...
✓ MongoDB container already running

[2/5] Installing backend dependencies (if needed)...
✓ Backend dependencies already installed

[3/5] Installing frontend dependencies (if needed)...
✓ Frontend dependencies already installed

[4/5] Starting Backend Server...
Backend will start on http://localhost:3001

[5/5] Starting Frontend Application...
Frontend will start on http://localhost:5173

================================================
   🚀 Development Stack Starting!
================================================

Backend API:   http://localhost:3001
Frontend App:  http://localhost:5173
Health Check:  http://localhost:3001/api/health
```

## 🛠️ Features

### **Smart Detection & Directory Handling**
- ✅ Checks if services are already running
- ✅ Avoids duplicate containers
- ✅ Only installs dependencies when needed
- ✅ Automatically navigates to project directory
- ✅ Shows working directory for debugging

### **Error Handling**
- ✅ Docker connectivity checks
- ✅ Permission handling
- ✅ User-friendly error messages

### **Cross-Platform**
- ✅ Windows: `.bat` file with CMD
- ✅ Mac: `.command` file with Terminal
- ✅ Linux: `.sh` file with bash

### **Visual Feedback**
- ✅ Colored terminal output
- ✅ Progress indicators
- ✅ Success/error status

## 🚨 Troubleshooting

### **Docker Not Running**
- Start Docker Desktop first
- Ensure Docker daemon is running
- Check Docker permissions

### **Permission Issues (Mac/Linux)**
```bash
chmod +x start-dev-mac.command
chmod +x start-dev-linux.sh
```

### **Port Already in Use**
- Close existing services first
- Or manually kill processes on ports 3001/5173
- MongoDB will restart automatically

### **Node.js/NPM Missing**
- Install Node.js 18+ from nodejs.org
- Ensure npm is in PATH
- Verify with `node --version` and `npm --version`

## 🎉 Benefits

### **For Windows Users**
- No need to open multiple command prompts
- Visual confirmation of each step
- Automatic dependency installation

### **For Mac Users**
- Opens native Terminal windows
- Works with macOS security settings
- Clean, readable output

### **For Linux Users**
- Works with multiple terminal emulators
- Desktop environment detection
- Bash script compatibility

## 🐛 **FIXED: Directory Issues Resolved**

**Previous Issue:** Scripts were running from wrong directory causing "No such file or directory" errors.

**Solution Applied:** 
- Added automatic directory detection (`SCRIPT_DIR`)
- Scripts now navigate to project folder first
- Added working directory display for debugging
- Fixed both Mac and Linux scripts

## 🎯 Quick Start Summary

1. **Choose your script** based on your OS
2. **Double-click** to run (Mac may need right-click → "Open")
3. **Wait** for automatic setup
4. **Check working directory** is displayed correctly
5. **Open browser** to http://localhost:5173
6. **Start developing!**

Your entire development stack will be running in under 60 seconds! 🚀

## ✅ **Verification Steps**

After running the script, you should see:
```
Working directory: /path/to/your/rumfor-market-tracker
[1/5] Checking if MongoDB container exists...
✓ MongoDB container already running
[2/5] Installing backend dependencies (if needed)...
✓ Backend dependencies already installed
```

If you see the working directory correctly, the script will work perfectly!