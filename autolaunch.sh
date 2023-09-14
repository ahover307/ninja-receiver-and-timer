#!/bin/bash
# This script is run at boot to start the application automatically

# Wait for the network to be connected
max_retries=5
retries=0

while [ $retries -lt $max_retries ]; do
    if ping -c 1 google.com &>/dev/null; then
        # Network is connected, proceed with your script
        echo "Network is connected. Starting your script."
        # Add your script logic here
        break
    else
        retries=$((retries+1))
        echo "Network not connected. Retry $retries/$max_retries."
        sleep 10
    fi
done

if [ $retries -eq $max_retries ]; then
    echo "Max retries reached. Exiting without running the script."
fi

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
