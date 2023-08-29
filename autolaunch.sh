#!/bin/bash
# This script is run at boot to start the application automatically

# Change directory to the application directory
cd ~/Ninja-Receiver-and-timer || exit

# Git pull to update the application
git pull

echo "Finished pulling"

# Set up the docker containers
docker compose up -d --build

echo "Finished docker compose"

# Hide the cursor
#unclutter -idle 0.1

# Disable the screen saver
echo "Unclutter was activated"

# Open the browser to the application
chromium-browser --kiosk --incognito --disable-session-crashed-bubble --disable-infobars http://localhost/display

echo "And browser was launched"

# Exit the script
exit 0
