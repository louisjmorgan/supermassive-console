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
  playNoteOn: (note: number) => Promise<void>;
  playNoteOff: (note: number) => Promise<void>;
  playNoteTime: (note: number, wait: number) => Promise<void>;
  flushNotes: () => Promise<void>;
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

  const playNoteOn = useCallback(async (note: number) => {
    port.current?.send([0x90, note, 127]); // note on
  }, []);

  const playNoteOff = useCallback(async (note: number) => {
    port.current?.send([0x90, note, 0]); // note on
  }, []);

  const playNoteTime = useCallback(async (note: number, wait: number) => {
    port.current.send([0x90, note, 127]).wait(wait).send([0x90, note, 0]); // note on
  }, []);

  const flushNotes = useCallback(async () => {
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
