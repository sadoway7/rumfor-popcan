#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Clear screen and show header
clear
echo -e "${BLUE}"
echo "================================================"
echo "   Rumfor Market Tracker - Development Stack"
echo "================================================"
echo -e "${NC}"

# Change to project directory
cd "$SCRIPT_DIR"
echo -e "${YELLOW}Working directory:${NC} $(pwd)"

echo -e "${YELLOW}[1/5]${NC} Checking if MongoDB container exists..."

# Check if MongoDB container is running
if docker ps | grep -q "rumfor-mongodb"; then
    echo -e "${GREEN}✓${NC} MongoDB container already running"
else
    echo -e "${YELLOW}Starting MongoDB container...${NC}"
    
    # Start MongoDB container
    if docker run -d --name rumfor-mongodb -p 27017:27017 mongo:latest > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} MongoDB container started"
        sleep 2  # Give MongoDB a moment to fully start
    else
        echo -e "${RED}✗${NC} Failed to start MongoDB container"
        echo -e "${YELLOW}Please ensure Docker is running and try again${NC}"
        read -p "Press Enter to continue..."
        exit 1
    fi
fi

echo -e "${YELLOW}[2/5]${NC} Installing backend dependencies (if needed)..."
cd backend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓${NC} Backend dependencies already installed"
fi

echo -e "${YELLOW}[3/5]${NC} Installing frontend dependencies (if needed)..."
cd ..

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓${NC} Frontend dependencies already installed"
fi

echo -e "${YELLOW}[4/5]${NC} Starting Backend Server..."
echo -e "${BLUE}Backend will start on http://localhost:3001${NC}"

# Start backend in background
gnome-terminal --tab --title="Backend Server" --working-directory="$(pwd)/backend" -- bash -c "npm run dev" 2>/dev/null || \
xfce4-terminal --tab --title="Backend Server" --working-directory="$(pwd)/backend" --command="npm run dev" 2>/dev/null || \
xterm -T "Backend Server" -e "cd '$(pwd)/backend' && npm run dev" &

sleep 3  # Give backend time to start

echo -e "${YELLOW}[5/5]${NC} Starting Frontend Application..."
echo -e "${BLUE}Frontend will start on http://localhost:5173${NC}"

# Start frontend in background
gnome-terminal --tab --title="Frontend App" --working-directory="$(pwd)" -- bash -c "npm run dev" 2>/dev/null || \
xfce4-terminal --tab --title="Frontend App" --working-directory="$(pwd)" --command="npm run dev" 2>/dev/null || \
xterm -T "Frontend App" -e "cd '$(pwd)' && npm run dev" &

# Show success message
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   🚀 Development Stack Starting!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}Backend API:${NC}   http://localhost:3001"
echo -e "${BLUE}Frontend App:${NC}  http://localhost:5173"
echo -e "${BLUE}Health Check:${NC}  http://localhost:3001/api/health"
echo ""
echo -e "${YELLOW}💡 Your development environment is now running!${NC}"
echo -e "${YELLOW}   Terminal windows will open for backend and frontend.${NC}"
echo ""

# Give user time to read the message
sleep 2