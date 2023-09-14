import "./App.css";
import {useEffect} from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Display} from "./components/Display.tsx";
import {Home} from "./components/Home.tsx";
import {getTimerStatus} from "./API/api.ts";
import {useTimerContext} from "./Context/TimerContext.tsx";

export const App = () => {
  const {setStopwatchTime, startTimer} = useTimerContext();

  const getData = async () => {
    const response = await getTimerStatus();

    setStopwatchTime(response.elapsedTime);
    if (response.isTimerRunning)
      startTimer(response.elapsedTime);
  };

  // Get the timer status on a page load
  useEffect(() => {
    void getData();
  }, []);

  const router = createBrowserRouter([
        {
          path: "/", element: <Home/>,
        }, {
          path: "/display", element: <Display/>,
        }
      ]
  );

  return <RouterProvider router={router}/>;
};
