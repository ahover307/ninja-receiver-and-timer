#!/bin/bash
# This script is run at boot to start the application automatically

# Change directory to the application directory
cd ~/ninja-receiver || exit

# Git pull to update the application
git pull

# Set up the docker containers
docker compose up -d --build

# Open the browser to the application
chromium-browser --kiosk --incognito --disable-session-crashed-bubble --disable-infobars http://localhost

# Exit the script
exit 0
