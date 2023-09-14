import React from "react";
import ReactDOM from "react-dom/client";
import {App} from "./App.tsx";
import "./index.css";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {SocketProvider} from "./Context/SocketContext.tsx";
import {TimerProvider} from "./Context/TimerContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ToastContainer
          position="bottom-center"
          autoClose={10000}
          theme="dark"
      />
      <SocketProvider>
        <TimerProvider>
          <App/>
        </TimerProvider>
      </SocketProvider>
    </React.StrictMode>,
);
