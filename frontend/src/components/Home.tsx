import "./Home.css";
import {Card} from "reactstrap";
import {useTimerContext} from "../Context/TimerContext.tsx";
import {useSocketContext} from "../Context/SocketContext.tsx";

export const Home = () => {
  const {socket} = useSocketContext();
  const {formattedStopwatchTime, isTimerRunning} = useTimerContext();

  return (
      <>
        <h1>Ninja Timer Test</h1>
        <Card>
          <button onClick={() => socket.emit("toggleTimer")}>
            {isTimerRunning ? "Stop Timer" : "Start Timer"}
          </button>
          <p>stopwatch: {formattedStopwatchTime}</p>
        </Card>
      </>
  );
};