#!/bin/bash
cd "$(dirname "$0")"

if ! pgrep -f 'node app.js' > /dev/null; then
    echo "[$(date)] Node not running, restarting..." >> keepalive.log
    ./start.sh
    echo "[$(date)] Restart completed" >> keepalive.log
fi
