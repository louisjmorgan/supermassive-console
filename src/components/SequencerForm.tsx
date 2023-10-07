import { Midi } from "@/hooks/useMidi";
import React, { useCallback, useEffect, useRef } from "react";
import Sequencer from "@/lib/sequencer";
import { useForm } from "react-hook-form";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { stepAraryToMidiSequence } from "@/lib/midi";

const kickOptions = [
  [1, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

const BPM = 140;
const INTERVAL = 1;

export interface Note {
  velocity: number;
  duration: number;
  time: number;
}

function SequencerForm({ midi }: { midi: Midi }) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const sequencer = useRef<any>();

  useEffect(() => {
    if (sequencer.current?.isPlaying()) return;
    let audioContext = new window.AudioContext();
    sequencer.current = Sequencer(() => audioContext.currentTime, {
      interval: 0.001,
      useWorker: true,
    });
  }, []);

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      //   setValue(value);
      console.log("change");
    },
    // delay in ms
    1000,
    { maxWait: 200 }
  );

  const updateSequence = useCallback(() => {
    const { kick } = getValues();
    const duration = INTERVAL / (BPM / 60);

    const steps = stepAraryToMidiSequence(
      kickOptions[Number(kick)],
      BPM,
      INTERVAL
    );
    const callback = (note: Note, index: number) => () => {
      //   midi.playNoteTime(60, note.velocity, note.duration);
      console.log(note);
    };
    const sequence = steps.map((note, index) => ({
      time: note.time,
      callback: callback(note, index),
    }));

    console.log(sequence, duration * kickOptions.length);

    sequencer.current.play(sequence, {
      loopLength: duration * kickOptions.length,
    });

    console.log(sequence);
  }, [getValues, midi]);

  return (
    <div>
      <form>
        <select
          {...register("kick", {
            onChange: updateSequence,
          })}
        >
          {kickOptions.map((opt, index) => (
            <option key={index}>{index}</option>
          ))}
        </select>
      </form>
    </div>
  );
}

export default SequencerForm;
