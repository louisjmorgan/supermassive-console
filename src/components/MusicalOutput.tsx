import { Midi } from "@/hooks/useMidi";
import { charToMidi } from "@/lib/midi";
import React, { useCallback, useEffect, useState } from "react";
import { TerminalState } from "./Terminal";

const MusicalOutput = React.forwardRef<
  HTMLPreElement,
  {
    state: TerminalState;
    midi: Midi;
    onFinishOutput: () => void;
  }
>(({ state, midi, onFinishOutput }, ref) => {
  const [typedText, setTypedText] = useState<typeof state.output>([]);
  useEffect(() => {
    if (state.current !== "outputting") return;
    const timeouts = state.output.map((note, index) => {
      const { time } = note;
      return setTimeout(async () => {
        setTypedText((prev) => [...prev, note]);
        if (index >= state.output.length - 1) {
          onFinishOutput();
        }
      }, time);
    });
    return () =>
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
  }, [state, midi, onFinishOutput]);

  useEffect(() => {
    setTypedText([]);
  }, [state.returnIndex]);

  useEffect(() => {
    if (!typedText || typedText.length === 0) return;
    const { char, duration } = typedText.slice(-1)[0];
    midi.playNoteTime(charToMidi(char), duration);
  }, [typedText, midi]);

  return (
    <span className="h-full w-full break-all" ref={ref}>
      <pre>
        {typedText.map((note) => note.char).join("")}
        {state.current === "outputting" ? (
          <span
            key="cursor"
            className="cursor"
            // className={currentIndex < text.length ? "cursor" : "cursor blinking"}
          >
            &nbsp;
          </span>
        ) : (
          <span key="cursor"></span>
        )}
      </pre>
    </span>
  );
});

MusicalOutput.displayName = "MusicalOutput";

export default MusicalOutput;
