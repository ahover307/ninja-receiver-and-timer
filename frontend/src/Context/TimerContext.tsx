import {createContext, useEffect, ReactNode, useContext, useState} from "react";
import {useSocketContext} from "./SocketContext.tsx";
import {useTimer} from "react-use-precision-timer";
import {formatMillisecondsToTimeString} from "../utils/utils.ts";
import {timerSleepDelay} from "../Constants/Env.ts";

interface TimerContextData {
  stopwatchTime: number;
  formattedStopwatchTime: string;
  setStopwatchTime: (stopwatchTime: number) => void;
  startTimer: (elapsedTimeSinceStart: number) => void;
  isTimerRunning: boolean;
}

export const TimerContext = createContext<TimerContextData | undefined>(undefined);

// Define a custom hook for using the context
export function useTimerContext() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("Timer Context must be wrapped within timer provider");
  }
  return context;
}

type TimerProviderProps = {
  children: ReactNode;
}

export const TimerProvider = (props: TimerProviderProps) => {
  const {socket} = useSocketContext();

  const [stopwatchTime, setStopwatchTime] = useState(0);
  const stopwatchHandler = useTimer({delay: timerSleepDelay}, () =>
      setStopwatchTime(stopwatchHandler.getElapsedRunningTime()),
  );

  const startTimer = (elapsedTimeSinceStart: number) => {
    stopwatchHandler.start(Date.now() - elapsedTimeSinceStart);
  };

  // Set up socket listeners
  useEffect(() => {
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
    });
  }, [socket]);

  return (
      <TimerContext.Provider value={
        {
          stopwatchTime,
          formattedStopwatchTime: formatMillisecondsToTimeString(stopwatchTime),
          setStopwatchTime,
          startTimer,
          isTimerRunning: stopwatchHandler.isRunning()
        }
      }>
        {props.children}
      </TimerContext.Provider>
  );
};
