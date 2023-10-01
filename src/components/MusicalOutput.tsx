import { Midi } from "@/hooks/useMidi";
import { charToMidi } from "@/lib/midi";
import React, { SetStateAction, useEffect, useState } from "react";
import { TerminalState } from "./Terminal";

function MusicalOutput({
  state,
  delay,
  midi,
  onFinishOutput,
  onStartOutput,
}: {
  state: TerminalState;
  delay: number;
  midi: Midi;
  onFinishOutput: () => void;
  onStartOutput: () => void;
}) {
  const [typedText, setTypedText] = useState("");
  const [typeIndex, setTypeIndex] = useState(0);

  useEffect(() => {
    if (typeIndex < state.output.length) {
      const timeout = setTimeout(() => {
        setTypedText((prevText) => prevText + state.output[typeIndex]);
        midi.playNoteTime(charToMidi(state.output[typeIndex]), delay);
        setTypeIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [typeIndex, delay, state.output, midi]);

  useEffect(() => {
    if (state.current === "outputting" && typeIndex >= state.output.length) {
      onFinishOutput();
    }
  }, [typeIndex, onFinishOutput, state]);

  useEffect(() => {
    setTypeIndex(0);
    setTypedText("");
    onStartOutput();
  }, [state.returnIndex, onStartOutput]);

  return (
    <div className="h-full w-full">
      <pre>
        {typedText}
        <span
          // className={currentIndex < text.length ? "cursor" : "cursor blinking"}
          className={state.current === "outputting" ? "cursor" : ""}
        >
          &nbsp;
        </span>
      </pre>
    </div>
  );
}

export default MusicalOutput;
