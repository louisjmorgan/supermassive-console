import { Midi } from "@/hooks/useMidi";
import React, { useCallback, useEffect, useRef } from "react";
import Sequencer from "@/lib/sequencer";
import { useForm } from "react-hook-form";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { stepAraryToMidiSequence } from "@/lib/midi";
import * as Tone from "tone";

const kickOptions = [
  [1, 0, 0, 1, 1, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 0],
];

const snareOptions = [
  [0, 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 0],
];

const noteMap = [60, 65];

const BPM = 140;
const INTERVAL = 0.5;
const STEPS_COUNT = 8;

export interface Step {
  velocity: number;
  duration: number;
  time: number;
  note: number;
}

function SequencerForm({ midi }: { midi: Midi }) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const beat = useRef(0);

  const grid = useRef([]);

  const sequencerLoop = useCallback(() => {
    // This is our callback function. It will execute repeatedly
    const repeat = (time) => {
      grid.current.forEach((row, index) => {
        let step = row[beat.current];
        var timingOffset = performance.now() / 1000 - Tone.context.currentTime;

        midi.playNoteOn(
          noteMap[index],
          step * 127,
          timingOffset
          // (INTERVAL / (BPM / 60)) * 0.9
        );
      });
      // increment the counter
      beat.current = (beat.current + 1) % 8;
    };

    // set the tempo in beats per minute.
    Tone.Transport.bpm.value = BPM;
    // telling the transport to execute our callback function every eight note.
    Tone.Transport.scheduleRepeat(repeat, "8n");
  }, [midi]);

  const updateGrid = useCallback(() => {
    const { kick, snare } = getValues();

    grid.current = [kickOptions[Number(kick)], snareOptions[Number(snare)]];

    if (Tone.Transport.state !== "started") {
      Tone.Transport.start();
      sequencerLoop();
    }
  }, [getValues, sequencerLoop]);

  return (
    <div>
      <form>
        <select
          {...register("kick", {
            onChange: updateGrid,
          })}
        >
          {kickOptions.map((opt, index) => (
            <option key={index}>{index}</option>
          ))}
        </select>{" "}
        <select
          {...register("snare", {
            onChange: updateGrid,
          })}
        >
          {snareOptions.map((opt, index) => (
            <option key={index}>{index}</option>
          ))}
        </select>
      </form>
    </div>
  );
}

export default SequencerForm;
