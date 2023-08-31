import "./App.css";
import { Card } from "reactstrap";
import { useTimer } from "react-use-precision-timer";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const socket = io("http://192.168.1.182");

export const App = () => {
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const stopwatchHandler = useTimer({ delay: 17 }, () =>
    setStopwatchTime(stopwatchHandler.getElapsedRunningTime()),
  );

  const startTimer = (elapsedTimeSinceStart: number) => {
    stopwatchHandler.start(Date.now() - elapsedTimeSinceStart);
  };

  const getTimerStatus = async () => {
    const response = await fetch("http://192.168.1.182/api/currentStatus", {
      method: "GET",
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: { isTimerRunning: boolean; elapsedTime: number } =
      await response.json();
    setStopwatchTime(data.elapsedTime);
    if (data.isTimerRunning) startTimer(data.elapsedTime);
  };

  const formatMillisecondsToTimeString = (milliseconds: number) => {
    const date = new Date(milliseconds);
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const millisecondsPart = date.getUTCMilliseconds();

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${millisecondsPart
      .toString()
      .padStart(3, "0")}`;
  };

  // Set up socket listeners
  useEffect(() => {
    socket.on("connect_error", (err) => {
      toast.error("Failure to connect to server, retrying");
      console.log(`connect_error due to ${err.message}`);
      console.log(err);
    });

    socket.on("error", (err) => {
      toast.error("Socket error occurred");
      console.log(`connect_error due to ${err.message}`);
      console.log(err);
    });

    socket.on("connect", () => {
      toast.success("Connected to server");
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      toast.error("Disconnected from server");
      console.log("Disconnected from server");
    });

    socket.on("timerStarted", (data: { elapsedTime: number }) => {
      console.log("timerStarted");
      startTimer(data.elapsedTime);
    });

    socket.on("timerStopped", (data: { elapsedTime: number }) => {
      console.log("timerStopped");
      stopwatchHandler.stop();
      setStopwatchTime(data.elapsedTime);
    });

    socket.on("timerCancelled", () => {
      console.log("timerCancelled");
      stopwatchHandler.stop();
      setStopwatchTime(0);
    })
  }, [socket]);

  // Get the timer status on page load
  useEffect(() => {
    void getTimerStatus();
  }, []);

  const home = (
    <>
      <h1>Ninja Timer Test</h1>
      <Card>
        <button onClick={() => socket.emit("toggleTimer")}>
          {stopwatchHandler.isRunning() ? "Stop Timer" : "Start Timer"}
        </button>
        <p>stopwatch: {formatMillisecondsToTimeString(stopwatchTime)}</p>
      </Card>
    </>
  );

  const display = <h1>{formatMillisecondsToTimeString(stopwatchTime)}</h1>;

  const router = createBrowserRouter([
    {
      path: "/",
      element: home,
    },
    {
      path: "/display",
      element: display,
    },
  ]);

  return <RouterProvider router={router} />;
};
