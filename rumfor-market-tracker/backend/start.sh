#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing node app processes
pkill -f 'node app.js' 2>/dev/null
pkill -f 'lsnode' 2>/dev/null
sleep 2

# Start the app with setsid to create new session (persists after SSH closes)
setsid /opt/alt/alt-nodejs20/root/usr/bin/node app.js >> app.log 2>&1 &
disown

sleep 3
echo "App started at $(date)" >> app.log
