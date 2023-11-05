import React, { Ref, useCallback, useEffect, useRef, useState } from "react";
import { WebMidi } from "webmidi";

export interface Midi {
  port: any;
  playNoteOn: (note: number, velocity?: number, wait?: number) => any;
  playNoteOff: (note: number, velocity?: number, wait?: number) => any;
  playNoteTime: (
    note: number,
    velocity: number,
    duration: number,
    wait: number
  ) => any;
  flushNotes: () => any;
}

const createTimeString = (time: number) => `+${time}`;

function useMidi(): any {
  const [port, setPort] = useState<any>();
  useEffect(() => {
    console.log("initialize");
    // navigator.requestMIDIAccess().then(
    //   (e: Event) => console.log("success"),
    //   (e: Event) => console.log("fail")
    // );

    WebMidi.enable()
      .then(onEnabled)
      .catch((err) => alert(err));

    function onEnabled() {
      // Inputs

      setPort(WebMidi.getOutputByName("01. Internal MIDI"));
    }
  }, []);

  console.log(port);

  // const playNoteOn = useCallback(
  //   (note: number, velocity: number = 1, wait = 0) =>
  //     // port.current?.wait(wait).send([0x90, note, velocity]), // note on
  //     {
  //       console.log(wait);
  //       return port.current.playNote(note, {
  //         time: wait,
  //       });
  //     },
  //   []
  // );

  // const playNoteOff = useCallback(
  //   (note: number, velocity: number = 1, wait = 0) =>
  //     // port.current?.send([0x90, note, 0]), // note on
  //     port.current.stopNote(note, { time: createTimeString(wait) }),
  //   []
  // );

  // const playNoteTime = useCallback(
  //   (note: number, velocity: number, duration: number, wait: number = 0) => {
  //     console.log(note, duration, wait);
  //     return port.current.playNote(note, {
  //       duration,
  //       time: wait,
  //     });
  //   },
  //   []
  // );

  const flushNotes = useCallback(() => {
    port.current.sendAllNotesOff();
    port.current.clear();
  }, []);

  // useEffect(() => {
  //   const onFocus = () => {
  //     if (port.current) flushNotes();
  //   };

  //   const onBlur = () => {
  //     if (port.current) flushNotes();
  //   };

  //   window.addEventListener("focus", onFocus);
  //   window.addEventListener("blur", onBlur);

  //   onFocus();

  //   return () => {
  //     window.removeEventListener("focus", onFocus);
  //     window.removeEventListener("blur", onBlur);
  //   };
  // }, [flushNotes]);

  return {
    port,
    flushNotes,
  };
}

export default useMidi;
