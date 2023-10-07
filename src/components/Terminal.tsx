import useMidi, { Midi } from "@/hooks/useMidi";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MusicalInput from "./MusicalInput";
import MusicalOutput from "./MusicalOutput";
import { TrackJSON } from "@tonejs/midi";
import { charToMidi, createEqualDurationOutput, midiToChar } from "@/lib/midi";
import useSwallowKeys from "@/hooks/useSwallowKeys";
import Sequencer from "um-sequencer";

export interface Note {
  char: string;
  duration: number;
  time: number;
}
export interface TerminalState {
  current: "outputting" | "awaiting input";
  returnIndex: number;
  log: string[];
}

const sequence = [
  {
    getOutput: (input: string) => {
      return createEqualDurationOutput(
        `Hello ${input}, it is great to meet you. How can I help you today?`,
        0.1
      );
    },
  },
  {
    getOutput: (input: string) => {
      return createEqualDurationOutput(
        `Oh wait, I don't care. Are you \n\tA. Animal\n\tB. Vegetable\n\tC. Mineral`,
        0.1
      );
    },
  },
  {
    getOutput: (input: string) => {
      const options = { a: "an animal", b: "a vegetable", c: "a mineral" };
      const selected = input[0].toLowerCase();
      return createEqualDurationOutput(
        selected in options
          ? `Yes that is true. You are ${options[selected as unknown as "a"]}.`
          : "That is not a valid response.",
        0.1
      );
    },
  },
];

function Terminal({
  midi,
  midiFiles,
}: {
  midi: Midi;
  midiFiles: Record<string, TrackJSON[]>;
}) {
  console.log("midi", midi);
  // capture key and click events to prevent focus leaving input
  useSwallowKeys();

  console.log(midiFiles);

  const inputRef = useRef<HTMLSpanElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
  }, []);

  const [state, setState] = useState<TerminalState>({
    current: "outputting",
    returnIndex: 0,
    log: [],
  });

  const onFinishOutput = useCallback(() => {
    setState((prev) => ({ ...prev, current: "awaiting input" }));
  }, []);

  const sequencer = useRef<any>();

  const onStartSequence = useCallback(
    (noteList: Note[]) => {
      const callback = (note: Note, index: number) => () => {
        if (!outputRef.current) return;
        outputRef.current.innerText += note.char;
        midi.playNoteTime(charToMidi(note.char), 127, note.duration * 60);
      };
      const sequence = noteList.map((note, index) => ({
        time: note.time,
        callback: callback(note, index),
      }));

      sequencer.current.play(sequence, {
        onStop: onFinishOutput,
      });
    },
    [midi, onFinishOutput]
  );

  const onStart = useCallback(() => {
    let audioContext = new window.AudioContext();
    sequencer.current = Sequencer(() => audioContext.currentTime, {
      useWorker: true,
      interval: 0.01,
    });
    onStartSequence(
      midiFiles["maryhadalittlelamb"][0].notes.map((note) => ({
        char: midiToChar(note.midi),
        time: note.time * 0.6,
        duration: note.duration * 0.6,
      }))
    );
  }, [onStartSequence, midiFiles]);

  useEffect(() => {
    if (sequencer.current?.isPlaying()) return;
    console.log("start");
    onStart();
  }, [onStart]);

  const onProcessCommand = useCallback(
    (prevState: TerminalState) => {
      if (!inputRef.current || !outputRef.current) return;

      const newLine = inputRef.current.innerText;
      const prevOutput = outputRef.current.innerText;
      const newOutput = sequence[prevState.returnIndex].getOutput(newLine);

      setState((prev) => ({
        current: "outputting",
        returnIndex: prev.returnIndex + 1,
        log: [...prev.log, prevOutput, newLine],
      }));

      outputRef.current.innerText = "";
      inputRef.current.innerText = "";

      onStartSequence(newOutput);

      inputRef.current.focus();
    },
    [onStartSequence]
  );

  return (
    <div className="w-full text-green-600 font-mono text-xl">
      {state.log.map((line, index) => (
        <pre key={index} className="break-all w-full">
          {line}
        </pre>
      ))}
      <MusicalOutput
        midi={midi}
        state={state}
        onFinishOutput={onFinishOutput}
        ref={outputRef}
      />
      <MusicalInput
        midi={midi}
        processCommand={onProcessCommand}
        ref={inputRef}
        state={state}
      />
    </div>
  );
}

export default Terminal;
