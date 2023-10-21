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
      toleranceEarly: 0.1,
    });
  }, []);

  return {
    clock,
    context,
  };
}

export default useClock;
