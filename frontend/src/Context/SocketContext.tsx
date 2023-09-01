import {createContext, ReactNode, useContext, useEffect} from "react";
import {io, Socket} from "socket.io-client";
import {toast} from "react-toastify";

const socketURL: string = import.meta.env.VITE_SOCKET_URL;
const socket = io(socketURL);

interface SocketContextData {
  socket: Socket;
}

export const SocketContext = createContext<SocketContextData | undefined>(undefined);

// Define a custom hook for using the context
export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("Socket Context must be wrapped within socket provider");
  }
  return context;
}

type SocketProviderProps = {
  children: ReactNode;
}
export const SocketProvider = (props: SocketProviderProps) => {
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
  }, [socket]);

  return (
      <SocketContext.Provider value={{socket}}>
        {props.children}
      </SocketContext.Provider>
  );
};
