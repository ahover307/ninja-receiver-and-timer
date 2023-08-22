This project is a fullstack application that allows users to connect to the server, and enable or disable a hosted time that can display on a projected screen. There are two main views, one with controls, and another without controls for displaying on a large screen like a mounted tv



Steps to start the project

for development
1. cd into backend and run yarn install, then run yarn dev
2. cd into frontend and run yarn install, then run yarn dev


For prod
1. cd into frontend and run yarn install, then run yarn build
2. start up the docker images using docker-compose up -d --build
3. That should automatically build the backend and the receiver script, as well as download nginx to serve the frontend static files.
4. NOTE - you need to make sure the frontend is built first. If you run docker-compose up --build without building the frontend first, well, the frontend wont exist yet.