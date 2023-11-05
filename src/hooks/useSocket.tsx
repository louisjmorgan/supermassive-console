import React, { useCallback, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const onConnect = () => {
  console.log("connected to state server");
};

const onDisconnect = () => {
  console.log("disconnected from state server");
};

function useSocket({ setCurrentState }) {
  const [socketInstance, setSocketInstance] = useState<Socket>();

  const onStateChange = useCallback(
    (data) => {
      setCurrentState(data);
    },
    [setCurrentState]
  );

  useEffect(() => {
    const socket = io("localhost:5001/", {
      transports: ["websocket"],
    });

    setSocketInstance(socket);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("state change", onStateChange);

    return function cleanup() {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("state change", onStateChange);
      socket.disconnect();
    };
  }, [onStateChange]);

  return socketInstance;
}

export default useSocket;
