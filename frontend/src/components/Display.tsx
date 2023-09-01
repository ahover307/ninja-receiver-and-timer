import {useDvdScreensaver} from "react-dvd-screensaver";
import {useTimerContext} from "../Context/TimerContext.tsx";
import "./Display.css";

const displayScrollSpeed: number = parseInt(import.meta.env.VITE_DISPLAY_SCROLL_SPEED) || 0.0005;

export const Display = () => {
  const {formattedStopwatchTime} = useTimerContext();

  const {containerRef, elementRef} = useDvdScreensaver({speed: displayScrollSpeed});

  return (
      <div className={"display"}>
        {/* @ts-ignore */}
        <div ref={containerRef} className={"display-container"}>
          {/* @ts-ignore */}
          <div ref={elementRef} className={"display-element"}>
            {formattedStopwatchTime}
          </div>
        </div>
      </div>
  );
};