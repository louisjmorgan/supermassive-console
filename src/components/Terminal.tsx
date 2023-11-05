import useMidi, { Midi } from "@/hooks/useMidi";
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import MusicalInput from "./MusicalInput";
import MusicalOutput from "./MusicalOutput";
import { TrackJSON } from "@tonejs/midi";
import { charToMidi, createEqualDurationOutput, midiToChar } from "@/lib/midi";
import useSwallowKeys from "@/hooks/useSwallowKeys";
import Sequencer from "@/lib/sequencer";

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
  clock,
  context,
}: {
  midi: Midi;
  midiFiles: Record<string, TrackJSON[]>;
  clock: MutableRefObject<any>;
  context: MutableRefObject<any>;
}) {
  // capture key and click events to prevent focus leaving input
  useSwallowKeys();

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
    console.log("finish");
    setState((prev) => ({ ...prev, current: "awaiting input" }));
  }, []);

  const onStartSequence = useCallback(
    (noteList: Note[]) => {
      console.log("start sequence");
      const currentTime = context.current.currentTime;
      // schedule notes
      noteList.forEach((note: Note, index: number) => {
        clock.current.callbackAtTime(function (event) {
          outputRef.current.innerText += note.char;
          console.log(note);
          midi.port.channels[1].playNote(charToMidi(note.char), {
            duration: note.duration * 1000 * 10,
            time: event.deadline * 1000,
            attack: 1,
          });
        }, currentTime + note.time);
      });

      // schedule finish
      clock.current.callbackAtTime((event) => {
        onFinishOutput();
      }, currentTime + (noteList.slice(-1)[0].time + noteList.slice(-1)[0].duration));
    },

    [midi, onFinishOutput, clock, context]
  );

  const onStart = useCallback(() => {
    clock.current.start();
    onStartSequence(
      midiFiles["maryhadalittlelamb"][0].notes.map((note) => ({
        char: midiToChar(note.midi),
        time: note.time,
        duration: note.duration,
      }))
    );
  }, [onStartSequence, midiFiles, clock]);

  useEffect(() => {
    if (!clock.current || !context.current) return;
    console.log("start");
    onStart();
  }, [onStart, context, clock]);

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
