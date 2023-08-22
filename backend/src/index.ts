import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : "*",
        methods: ["GET", "POST"],
    }
});

let allowSockets = true;

let api_key = "ucCsHJeM!QqhS2dZH!P3h8A49ocS7&wRzD9%Y9yXTx!Xf4Kegiw6JmHuXnWncZR5!7qXmG";

// TODO Wipe these values before production
let isTimerRunning = false;
let timeTimerStarted: number | undefined;
let timeTimerStopped: number | undefined;

// Set up cors
const corsOptions = {
  origin: process.env.NODE_ENV === "production" ? false : "*",
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));

const calculateElapsedTime = () => {
    if (!timeTimerStarted) {
        return 0;
    }

    if (isTimerRunning) {
        return Date.now() - timeTimerStarted;
    } else if (timeTimerStopped){
        return timeTimerStopped - timeTimerStarted;
    } else {
        return 0;
    }
}

const startTimer = () => {
    if (!isTimerRunning) {
        console.log("Starting timer");
        isTimerRunning = true;
        timeTimerStarted = Date.now();
        io.emit("timerStarted", {elapsedTime: calculateElapsedTime()});
    } else {
        console.log("Timer already running, resetting timer to 0");
        isTimerRunning = false;
        timeTimerStarted = undefined;
        timeTimerStopped = undefined;
        io.emit("timerCancelled");
    }
}

const stopTimer = () => {
    if (isTimerRunning) {
        console.log("Stopping timer");
        isTimerRunning = false;
        timeTimerStopped = Date.now();
        io.emit("timerStopped", {elapsedTime: calculateElapsedTime()});
    } else {
        console.log("Timer already stopped, doing nothing");
    }
}

app.get("/currentStatus", (req, res) => {
    res.send({
        isTimerRunning,
        timeTimerStarted,
        timeTimerStopped,
        elapsedTime: calculateElapsedTime(),
    });
});

app.post("/startTimer", (req, res) => {
    console.log("startTimer");
    if (req.headers.apikey !== api_key) {
        res.sendStatus(401);
        return;
    }
    startTimer();
    res.sendStatus(200);
});

app.post("/stopTimer", (req, res) => {
    console.log("stopTimer");
    if (req.headers.apikey !== api_key) {
        res.sendStatus(401);
        return;
    }
    stopTimer();
    res.sendStatus(200);
});

app.post("/resetTimer", (req, res) => {
    if (req.headers.apikey !== api_key) {
        res.sendStatus(401);
        return;
    }
    stopTimer();
    startTimer();
    res.sendStatus(200);
});

app.post("/toggleTimer", (req, res) => {
    if (req.headers.apikey !== api_key) {
        res.sendStatus(401);
        return;
    }
    if (isTimerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
    res.sendStatus(200);
});

app.post("/allowSockets", (req, res) => {
    if (req.headers.apikey !== api_key) {
        res.sendStatus(401);
        return;
    }
    allowSockets = true;
    res.sendStatus(200);
});

app.post("/disallowSockets", (req, res) => {
    if (req.headers.apikey !== api_key) {
        res.sendStatus(401);
        return;
    }
    allowSockets = false;
    res.sendStatus(200);
});

app.post("/toggleSockets", (req, res) => {
    if (req.headers.apikey !== api_key) {
        res.sendStatus(401);
        return;
    }
    allowSockets = !allowSockets;
    res.sendStatus(200);
});

io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("toggleTimer", () => {
        console.log("toggleTimer");
        if (allowSockets) {
            if (isTimerRunning) {
                stopTimer();
            } else {
                startTimer();
            }
        }
    });

    socket.on("startTimer", () => {
        console.log("startTimer");
        if (allowSockets) {
            startTimer();
        }
    });

    socket.on("stopTimer", () => {
        console.log("stopTimer");
        if (allowSockets) {
            stopTimer();
        }
    });
});

console.log("Starting server in " + process.env.NODE_ENV + " mode");
httpServer.listen(3000, () => {
    console.log("Server started on port 3000");
});
