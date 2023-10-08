import { Midi } from "@/hooks/useMidi";
import React, { useCallback, useEffect, useRef } from "react";
import Sequencer from "@/lib/sequencer";
import { useForm } from "react-hook-form";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { stepAraryToMidiSequence } from "@/lib/midi";

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
    const { kick, snare } = getValues();
    const duration = INTERVAL / (BPM / 60);

    const kickSteps = stepAraryToMidiSequence(
      kickOptions[Number(kick)],
      60,
      duration
    );

    const snareSteps = stepAraryToMidiSequence(
      snareOptions[Number(snare)],
      65,
      duration
    );
    const callback = (step: Step) => () => {
      midi.playNoteTime(step.note, step.velocity, step.duration * 0.9);
      // console.log(note);
    };
    const sequence = [...kickSteps, ...snareSteps].map((step, index) => ({
      time: step.time,
      callback: callback(step),
    }));

    console.log(sequence, duration * STEPS_COUNT);
    if (sequencer.current.isPlaying()) sequencer.current.stop();
    sequencer.current.play(sequence, {
      loopLength: duration * STEPS_COUNT,
    });
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
        </select>{" "}
        <select
          {...register("snare", {
            onChange: updateSequence,
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
