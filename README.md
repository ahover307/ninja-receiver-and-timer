This project came from a desire at my gym to have a so-called 'buzzer' system. 
A set of buttons that can be placed around the course that can be used to start and stop a timer that is hosted on the wall.
Then, in classic form, I might have over-engineered this bit.

![Completed boxes](https://github.com/ahover307/Ninja-Receiver-and-timer/blob/master/Pictures/Completed%20Pair.jpg?raw=true)

What I ended up having was a raspberry pi with a NRF24L01+ radio module
that can communicate with arduinos that have buttons attached to them.
The raspberry pi will build a few docker images on boot that will create a backend, a frontend,
as well as boot a python script that interfaces with the NRF24L01+ module before calling back to the backend

The rest of this readme will include a tutorial on how to set this up yourself,
as well as some links to other projects that helped me along the way, and some of the history that I went through.

**Walkthrough of the folder structure of this project:**
If all you want to do is boot up this project, there is very little you should need to actually change in this section. 
1. 3D Print Files - Contains all the 3d print files that I used to create the case for the arudinos and raspberry pi.
   I tried to label them in ways that make sense.
Something to note, in the "large button" folder, there is a stretched version and a normal version.
   I had to use the stretched version, the normal one was not quite tall enough to fit the button I was using.
2. Arduino Code - This is the script I uploaded onto the arduinos. Check in that folder for more information on how to set that up, including a wire diagram.
3. Backend - This is the backend of the project. It is a Node.js server that uses express and socket.io to communicate with the frontend and the python script (the one listening for the radio).
4. Frontend - This is the frontend of the project. It is a React app that uses socket.io to communicate with the backend.
5. Nginx - To serve the frontend, as well as route the backend, I used nginx. This is the config file I used for that. You shouldn't need to touch this, the docker-compose.yml will mount that folder as a volume and pull in that config automatically
6. autolaunch.sh - This is the script that will be run on boot. It will build the docker images and start the containers, as well as opening the browser to the correct page in kiosk mode. You shouldn't need to touch this, but if you want to change the url that it opens to, you can change it in this file.

**Hardware Requirements** I don't know how to use affiliate links so there aren't any lmao
1. raspberry pi - im using a 2b
2. arudino - [I am using a nano](https://www.amazon.com/gp/product/B01HCXMBOU), but any arduino should work (You can skip this if you don't care about having physical buttons). I bought that listing back in 2018, and the pins on mine were pre-soldered, if you can use jumper cables and not have to solder things together onto the board itself that makes life so much easier.
3. [NRF24L01+ radio modules](https://www.amazon.com/gp/product/B00O9O868G) for the arduinos and raspberry pi (Again, you can skip this if you don't care about having physical buttons)
4. 3d printer to print the case for the arduinos and pi, check the 3d print folder for the files I used. (You can still skip most of this if you don't care about having physical buttons)
5. Buttons - I used [these buttons](https://www.amazon.com/dp/B00XRC9URW). You can use any buttons you want, but you will need to change the 3d print files to fit them.
6. Rocker Switches - I used [these switches](https://www.amazon.com/dp/B0CC1SLQDZ). This is used to flip the target for the arduino (start or stop)
7. Various other wires and shit - I had an old button lying around that I ended up using as a power button for the Pi for example.

**Software Requirements**
On a desktop, you will need to set up the Arduino IDE,
as well as a fresh installation of raspian onto a card for the pi. 

To set up the arduinos,
all you should need to do is open the IDE to the correct folder and upload the script onto the board.
Make sure you have your settings in the IDE correct.

On the Pi, you need to do a bunch of shit to get this thing running,
but the docker launch sequence should help you out a ton.
Once Raspian is installed, you need to flip a bunch of settings
1. First, I recommend you enable SSH on the pi to make connecting to it much easier. 
2. You will need to install the following tools to make building and kick-starting this project possible.
    [Docker, Docker-compose](https://dev.to/elalemanyo/how-to-install-docker-and-docker-compose-on-raspberry-pi-1mo), [Node.js](https://www.hackster.io/kamaluddinkhan/installing-nodejs-on-a-raspberry-pi-in-easy-steps-62d455), and [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable).
    In addition, you need [pigpio installed if you want to make use of the nrf24 buttons](https://pypi.org/project/pigpio/), refer [here for making it auto launch](https://raspberrypi.stackexchange.com/questions/70568/how-to-run-pigpiod-on-boot). 

Settings to change on the pi itself
1. [You will need to disable the screen blanking (screen saver)](https://forums.raspberrypi.com/viewtopic.php?t=219854) - NOTE this tutorial is actually wrong. The autostart files are no longer kept in that location. Use the knowledge from this thread, but go down into the next link which has the correct location for the files
2. [To register the script in this repo to autostart on desktop boot](https://forums.raspberrypi.com/viewtopic.php?t=294014) - The correct path is in this link
3. [Disable mouse cursor](https://forums.raspberrypi.com/viewtopic.php?t=234879)
4. [How to build a power button for the pi](https://forums.raspberrypi.com/viewtopic.php?t=217442)
5. By default, sudo mode was not requiring a password on my installation - [Always request password in sudo mode](https://forums.raspberrypi.com/viewtopic.php?t=169212)

**Steps to start the project for development** - This is agnostic to whether we wire anything up.
This is purely for the webserver half of it

Alright sweet!
So now that you're all set up, you can start the project.
Let's start it in development mode first.
This will allow you to make changes to the code and see them reflected in real time.

For development, all you need to do is run the following commands.
We need to install the npm projects (as they are node servers), and then we can run them.
FIRST: We need to create a .env file in the backend folder with the following variables
```
NODE_ENV=development
# NODE_ENV=production
```
And in the frontend folder with the following variables
```
VITE_APP_API_URL=http://localhost:3000
# VITE_APP_API_URL=http://ninjatimer.local:3000 # (That is the hostname I set for my pi, you can use that if you want), or change this to the local ip of your pi
```
Then, returning to the outer directory, run the following commands

1. cd into backend and run `yarn install`, then run `yarn dev`. This will start the backend server on port 3000
2. cd into frontend and run `yarn install`, then run `yarn dev`. This will start the frontend server on port 5173

**For prod**
1. cd into backend and update the .env file to the following variables
```
# NODE_ENV=development
NODE_ENV=production
```
And the same thing for the frontend:
```
# VITE_APP_API_URL=http://localhost:3000
VITE_APP_API_URL=http://ninjatimer.local:3000 # (That is the hostname I set for my pi, you can use that if you want), or change this to the local ip of your pi
```

Now, before being able to run the script, we need to make sure everything is wired up correctly.
Check out the arduino code folder for more information on how to set up the buttons, 
and then go to /rf-receiver-script for information on how to wire up the NRF24L01+ module to the pi.
If this is not set up correctly, the script will not work,
however, the images should still build and run correctly - it just won't be able to communicate with the arduinos.

Then, returning to the outer directory, run the following commands
```
./autolaunch.sh
```

This will build the docker images and start the containers, as well as opening the browser to the correct page in kiosk mode

For more information on any of the components, please read some documentation in the specific modules.
That should help explain some parts.