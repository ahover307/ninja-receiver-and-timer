#!/bin/bash
# This script is run at boot to start the application automatically

# Change directory to the application directory
cd ~/Ninja-Receiver-and-timer || exit

# Git pull to update the application
git pull

# Set up the docker containers
docker compose up -d --build

# Open the browser to the application
chromium-browser --kiosk --incognito --disable-session-crashed-bubble --disable-infobars http://localhost/display

# Exit the script
exit 0
