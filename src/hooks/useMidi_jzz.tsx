import React, { Ref, useCallback, useEffect, useRef } from "react";
import * as JZZ from "jzz";
const navigator: any = JZZ;

const setupJZZ = async () => {
  const midi = await JZZ();
  console.log(midi.info());
  const port = await midi.openMidiOut(1);
  return port;
};

export interface Midi {
  port: Ref<any>;
  playNoteOn: (note: number, velocity?: number, wait?: number) => any;
  playNoteOff: (note: number, velocity?: number) => any;
  playNoteTime: (
    note: number,
    velocity: number,
    duration: number,
    wait: number
  ) => any;
  flushNotes: () => any;
}

function useMidi(): Midi {
  const port = useRef<any>();
  useEffect(() => {
    navigator.requestMIDIAccess().then(
      (e: Event) => console.log("success"),
      (e: Event) => console.log("fail")
    );

    setupJZZ().then(async (p) => (port.current = await p));

    return () => {
      navigator.close();
    };
  }, []);

  const playNoteOn = useCallback(
    (note: number, velocity: number = 127, wait = 0) =>
      port.current?.wait(wait).send([0x90, note, velocity]), // note on
    []
  );

  const playNoteOff = useCallback(
    (note: number, velocity: number = 127) =>
      port.current?.send([0x90, note, 0]), // note on
    []
  );

  const playNoteTime = useCallback(
    (note: number, velocity: number, duration: number, wait: number = 0) => {
      console.log(wait);
      return port.current.wait(wait).note(0, note, velocity, duration);
    },
    []
  );

  const flushNotes = useCallback(() => {
    port.current?.allSoundOff(0);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      flushNotes();
    };

    const onBlur = () => {
      flushNotes();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    onFocus();

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, [flushNotes]);

  return {
    port,
    playNoteOn,
    playNoteOff,
    playNoteTime,
    flushNotes,
  };
}

export default useMidi;
