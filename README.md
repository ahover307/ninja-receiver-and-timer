This project is a fullstack application that allows users to connect to the server, and enable or disable a hosted time that can display on a projected screen. There are two main views, one with controls, and another without controls for displaying on a large screen like a mounted tv

Requirements
1. Docker
2. Docker-compose
3. Nodejs
4. Yarn
5. raspberry pi - im using a 2b
6. arudinos with buttons if you want to be able to control the time from a physical device
7. NRF24L01+ radio modules for the arudinos and raspberry pi
8. 3d printer to print the case for the arudinos and pi, i will include my files for this in the 3d print folder

Steps to start the project

for development
1. cd into backend and run yarn install, then run yarn dev
2. cd into frontend and run yarn install, then run yarn dev


For prod
1. cd into backend and create a .env file with the following variables
```
NODE_ENV=production
```
Then, returning to the outer directory, run the following commands
```
./autolaunch.sh
```

This will build the docker images and start the containers, as well as opening the browser to the correct page in kiosk mode 

Other links:

To register script in autolaunch: https://forums.raspberrypi.com/viewtopic.php?t=294014

Disable screen saver / blanking:

Power button: https://forums.raspberrypi.com/viewtopic.php?t=217442

Always request password in sudo mode: https://forums.raspberrypi.com/viewtopic.php?t=169212

Disable mouse cursor: https://forums.raspberrypi.com/viewtopic.php?t=234879