import { Midi } from "@/hooks/useMidi";
import { charToMidi } from "@/lib/midi";
import React, { KeyboardEventHandler, useCallback, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { TerminalState } from "./Terminal";

const DISALLOWED_KEYS: string[] = ["Control", "Shift", "Alt", "Meta"];
const MusicalInput = React.forwardRef<
  HTMLSpanElement,
  {
    midi: Midi;
    processCommand: (state: TerminalState) => void;
    state: TerminalState;
  }
>(({ midi, processCommand, state }, ref) => {
  const [isTyping, setTyping] = useDebounce(false, 10);

  const onKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (state.current === "outputting") {
      e.preventDefault();
      return;
    }
    setTyping(false);
    const key = e.key;
    if (DISALLOWED_KEYS.includes(key)) return;
    midi.playNoteOff(charToMidi(key));
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (state.current === "outputting") {
        e.preventDefault();
        return;
      }
      const key = e.key;
      console.log(e.key.charCodeAt(0));

      if (DISALLOWED_KEYS.includes(key)) return;

      setTyping(true);

      switch (key) {
        case "Enter":
          if (e.repeat) return;
          e.preventDefault();
          processCommand(state);

          return;

        case "Backspace":
          if (
            !ref ||
            !("current" in ref) ||
            !ref.current ||
            ref.current.innerText.length === 0
          ) {
            return;
          }
          midi.playNoteTime(
            charToMidi(ref.current.innerText.slice(-1)[0]),
            127,
            100
          );
          return;

        default:
          if (e.repeat) {
            e.preventDefault();
            return;
          }
          if (key.length !== 1) return;
          midi.playNoteOn(charToMidi(key));
      }
    },
    [midi, ref, processCommand, setTyping, state]
  );

  useEffect(() => {
    if (state.current === "awaiting input") setTyping(false);
  }, [state, setTyping]);

  return (
    <span className="bg-black text-inherit caret-transparent inline break-all w-full">
      <span
        contentEditable
        ref={ref}
        autoFocus
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      />
      {state.current === "awaiting input" ? (
        <span key="cursor" className={isTyping ? "cursor" : "cursor blinking"}>
          &nbsp;
        </span>
      ) : (
        <span key="cursor"></span>
      )}
    </span>
  );
});

MusicalInput.displayName = "MusicalInput";
export default MusicalInput;
