import React, { useEffect, useRef, useState } from "react";

import * as WAAClock from "waaclock";

export interface ClockProps {
  clock: any;
  context: any;
}

function useClock() {
  // const [clock, setClock] = useState<any>();
  // const [context, setContext] = useState<any>();

  const clock = useRef<any>(null);
  const context = useRef<AudioContext>(null);

  useEffect(() => {
    context.current = new AudioContext();
    clock.current = new WAAClock(context.current, {
      // tickMethod: "manual",
    });

    // const _clockWorker = new Worker(
    //   new URL("../lib/sequencer/clockWorker.js", import.meta.url),
    //   {
    //     type: "module",
    //   }
    // );
    console.log(clock.current);
    // _clockWorker.onmessage = () => {
    //   clock.current._tick();
    // };
    clock.current.start();
    // _clockWorker.postMessage({
    //   action: "start",
    //   interval: (256 * 1000) / context.current.sampleRate,
    // });

    // return () => clock.current.stop();
  }, []);

  return {
    clock,
    context,
  };
}

export default useClock;
