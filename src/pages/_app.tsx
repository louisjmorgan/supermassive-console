import useMidi from "@/hooks/useMidi";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useCallback, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export default function App({ Component, pageProps }: AppProps) {
  const midi = useMidi();
  console.log(midi);
  const [hasStarted, setStarted] = useState(false);

  const onStart = useCallback(() => {
    setStarted(true);
  }, []);

  const [socketInstance, setSocketInstance] = useState<Socket>();
  useEffect(() => {
    console.log("connect");
    const socket = io("localhost:5001/", {
      transports: ["websocket"],
      cors: {
        origin: "http://localhost:3000/",
      },
    });

    setSocketInstance(socket);

    socket.on("connect", (data: any) => {
      console.log(data);
    });
    socket.on("state change", (data) => {
      console.log(data);
    });
    // setLoading(false);

    socket.on("disconnect", (data) => {
      console.log(data);
    });

    return function cleanup() {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-full text-green-600 font-mono text-xl">
      {hasStarted ? (
        <Component {...pageProps} midi={midi} />
      ) : (
        <button onClick={onStart}>Click to start</button>
      )}
    </div>
  );
}
