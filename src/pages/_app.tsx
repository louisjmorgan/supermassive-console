import useMidi from "@/hooks/useMidi";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useCallback, useState } from "react";
import * as Tone from "tone";

export default function App({ Component, pageProps }: AppProps) {
  const midi = useMidi();
  console.log(midi);
  const [hasStarted, setStarted] = useState(false);

  const onStart = useCallback(() => {
    setStarted(true);
    Tone.start();
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
