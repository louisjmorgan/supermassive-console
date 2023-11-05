import useMidi from "@/hooks/useMidi";
import useSocket from "@/hooks/useSocket";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useCallback, useEffect, useState } from "react";

type Tree<T> = Record<string, T>;
interface NestedTree extends Tree<NestedTree> {}
interface NestedArray<T> extends Array<NestedArray<T>> {}

export interface CurrentState {
  state_tree: NestedTree;
  state: NestedArray<string>;
  triggers: string[];
}

export default function App({ Component, pageProps }: AppProps) {
  const [hasStarted, setStarted] = useState(false);

  // wait for user input so that audio context works
  const onStart = useCallback(() => {
    setStarted(true);
  }, []);

  const [currentState, setCurrentState] = useState<CurrentState>();
  const socket = useSocket({ setCurrentState });

  return (
    <div className="w-full text-green-600 font-mono text-xl">
      {hasStarted ? (
        <Component {...pageProps} currentState={currentState} socket={socket} />
      ) : (
        <button onClick={onStart}>Click to start</button>
      )}
    </div>
  );
}
