import useMidi from "@/hooks/useMidi";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MusicalInput from "./MusicalInput";
import MusicalOutput from "./MusicalOutput";
import { TrackJSON } from "@tonejs/midi";
import { createEqualDurationOutput, midiToChar } from "@/lib/midi";
import useSwallowKeys from "@/hooks/useSwallowKeys";

export interface TerminalState {
  current: "outputting" | "awaiting input";
  output: { char: string; duration: number; time: number }[];
  returnIndex: number;
  log: string[];
}

const sequence = [
  {
    getOutput: (input: string) => {
      return createEqualDurationOutput(
        `Hello ${input}, it is great to meet you. How can I help you today?`,
        100
      );
    },
  },
  {
    getOutput: (input: string) => {
      return createEqualDurationOutput(
        `Oh wait, I don't care. Are you \n\tA. Animal\n\tB. Vegetable\n\tC. Mineral`,
        100
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
        100
      );
    },
  },
];

function Terminal({ midiFiles }: { midiFiles: Record<string, TrackJSON[]> }) {
  // capture key and click events to prevent focus leaving input
  useSwallowKeys();

  console.log(midiFiles);

  const midi = useMidi();
  const inputRef = useRef<HTMLSpanElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
  }, []);

  const [state, setState] = useState<TerminalState>({
    current: "outputting",
    // output: midiFiles["maryhadalittlelamb"][0].notes.map((note) => ({
    //   char: midiToChar(note.midi),
    //   time: note.time * 1000,
    //   duration: note.duration * 1000,
    // })),
    output: createEqualDurationOutput(
      `Please start by providing your name.`,
      100
    ),
    returnIndex: 0,
    log: [],
  });

  const onProcessCommand = useCallback(() => {
    if (!inputRef.current) return;
    const newLine = inputRef.current.innerText;

    setState((prev) => ({
      current: "outputting",
      output: sequence[prev.returnIndex].getOutput(newLine),
      returnIndex: prev.returnIndex + 1,
      log: [
        ...prev.log,
        prev.output.map((note) => note.char).join(""),
        newLine,
      ],
    }));

    inputRef.current.innerText = "";
    inputRef.current.focus();
  }, []);

  const onFinishOutput = useCallback(() => {
    setState((prev) => ({ ...prev, current: "awaiting input" }));
  }, []);

  console.log(state);

  return (
    <div className="w-full text-green-600 font-mono text-xl">
      {state.log.map((line, index) => (
        <p key={index} className="w-full">
          <pre className="break-all w-full">{line}</pre>
        </p>
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
