import useMidi from "@/hooks/useMidi";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MusicalInput from "./MusicalInput";
import MusicalOutput from "./MusicalOutput";

const allowedKeys = ["Enter", "Backspace"];

export interface TerminalState {
  current: "outputting" | "awaiting input";
  output: string;
  returnIndex: number;
  log: string[];
}

const sequence = [
  {
    getOutput: (input: string) => {
      return `Hello ${input}, it is great to meet you. How can I help you today?`;
    },
  },
  {
    getOutput: (input: string) => {
      return `Oh wait, I don't care. Are you \n\tA. Animal\n\tB. Vegetable\n\tC. Mineral`;
    },
  },
  {
    getOutput: (input: string) => {
      const options = { a: "an animal", b: "a vegetable", c: "a mineral" };
      const selected = input[0].toLowerCase();
      return selected in options
        ? `Yes that is true. You are ${options[selected as unknown as "a"]}.`
        : "That is not a valid response.";
    },
  },
];

function Terminal() {
  // swallow key and click events
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        (e.key.length !== 1 && !allowedKeys.includes(e.key))
      ) {
        e.preventDefault();
        return;
      }
    };

    const onClick = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKey);
    document.addEventListener("click", onClick);
    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const midi = useMidi();
  const inputRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
  }, []);

  const [state, setState] = useState<TerminalState>({
    current: "outputting",
    output: "Please enter your name to get started.",
    returnIndex: 0,
    log: [],
  });

  const onProcessCommand = useCallback(() => {
    if (!inputRef.current) return;
    const newLine = inputRef.current.innerText;

    setState((prev) => ({
      current: "outputting",
      output:
        sequence[prev.returnIndex]?.getOutput(newLine) || "Thanks, goodbye.",
      returnIndex: prev.returnIndex + 1,
      log: [...prev.log, prev.output, newLine],
    }));

    inputRef.current.innerText = "";
    inputRef.current.focus();
  }, []);

  const onStartOutput = useCallback(() => {
    setState((prev) => ({ ...prev, current: "outputting" }));
  }, []);

  const onFinishOutput = useCallback(() => {
    setState((prev) => ({ ...prev, current: "awaiting input" }));
  }, []);

  return (
    <div className="w-full text-green-600 font-mono text-xl">
      {state.log.map((line, index) => (
        <p key={index}>
          <pre>{line}</pre>
        </p>
      ))}
      <MusicalOutput
        midi={midi}
        state={state}
        delay={100}
        onFinishOutput={onFinishOutput}
        onStartOutput={onStartOutput}
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
