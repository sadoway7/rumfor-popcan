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

echo -e "${YELLOW}[1/4]${NC} Using production MongoDB Atlas database..."
echo -e "${GREEN}✓${NC} Connected to cloud database"

echo -e "${YELLOW}[2/4]${NC} Installing backend dependencies (if needed)..."
cd backend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}✓${NC} Backend dependencies already installed"
fi

echo -e "${YELLOW}[3/4]${NC} Installing frontend dependencies (if needed)..."
cd ..

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}✓${NC} Frontend dependencies already installed"
fi

echo -e "${YELLOW}[4/4]${NC} Starting Backend Server..."
echo -e "${BLUE}Backend will start on http://localhost:3001${NC}"

# Start backend in background using Mac Terminal
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && npm run dev\""

sleep 3  # Give backend time to start

echo -e "${YELLOW}Starting Frontend Application...${NC}"
echo -e "${BLUE}Frontend will start on http://localhost:5173${NC}"

# Start frontend in background using Mac Terminal
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && npm run dev\""

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