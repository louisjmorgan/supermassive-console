import { Midi } from "@/hooks/useMidi";
import { charToMidi } from "@/lib/midi";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Note, TerminalState } from "./Terminal";
import Sequencer from "um-sequencer";

const MusicalOutput = React.forwardRef<
  HTMLPreElement,
  {
    state: TerminalState;
    midi: Midi;
  }
>(({ state, midi }, ref) => {
  const [cursor] = useState(<>&nbsp;</>);
  return (
    <div className="h-full w-full break-all">
      <pre ref={ref} className="inline"></pre>
      <span></span>
      {state.current === "outputting" ? (
        <span
          key="cursor"
          className="cursor"
          // className={currentIndex < text.length ? "cursor" : "cursor blinking"}
        >
          {cursor}
        </span>
      ) : (
        <span key="cursor"></span>
      )}
    </div>
  );
});

MusicalOutput.displayName = "MusicalOutput";

export default MusicalOutput;
