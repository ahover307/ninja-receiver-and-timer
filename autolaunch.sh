#!/bin/bash
# This script is run at boot to start the application automatically

# Wait for the network to be connected
max_retries=5
retries=0

# Check for one argument
if [ $# -ne 1 ]; then
    echo "Usage: $0 <display or button>"
    exit 1
fi

# Ingest the argument
display_or_button=$1

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
    echo "Max retries reached, network can not connect. Exiting without running the script."
fi

# Change directory to the application directory
cd ~/Ninja-Receiver-and-timer || exit

# Git pull to update the application
git pull
echo "Finished pulling"

# Set up the docker containers
#docker compose up -d --build
#echo "Finished docker compose"

# Hide the cursor
#unclutter -idle 0.1
#echo "Unclutter was activated"


# Prune old docker images no longer being used
# This came around because of an out of storage error from the images just piling up over weeks
#docker system prune --all --force
#echo "Docker was pruned from old items"

#sleep 3

# If the argument is button, launch python script
# If the argument is display, open the browser
case "$display_or_button" in
  "button")
    echo "Launching button script"
    python3 button-scripts/button.py &
    ;;
  "display")
    echo "Launching display"
    # Open the browser to the application
    chromium-browser --kiosk --incognito --disable-session-crashed-bubble --disable-infobars http://localhost/display/paramount
    ;;
  *)
    echo "Usage: $0 <display or button>"
    exit 1
    ;;
esac

# Exit the script
exit 0
