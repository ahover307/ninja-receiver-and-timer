This project is a fullstack application that allows users to connect to the server, and enable or disable a hosted time that can display on a projected screen. There are two main views, one with controls, and another without controls for displaying on a large screen like a mounted tv

Requirements
1. Docker
2. Docker-compose
3. Nodejs
4. Yarn
5. raspberry pi - im using a 2b
6. arudinos with buttons if you want to be able to control the time from a physical device
7. NRF24L01+ radio modules for the arudinos and raspberry pi

Steps to start the project

for development
1. cd into backend and run yarn install, then run yarn dev
2. cd into frontend and run yarn install, then run yarn dev


For prod
1. cd into backend and create a .env file with the following variables
```
NODE_ENV=production
```
**This is important** If you forget to build the frontend, there will be no frontend to serve
1. cd into frontend and run yarn install, then run yarn build
2. start up the docker images using docker-compose up -d --build
3. That should automatically build the backend and the receiver script, as well as download nginx to serve the frontend static files.
