import useClock, { ClockProps } from "@/hooks/useClock";
import { Midi } from "@/hooks/useMidi";
import React, { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as WAAClock from "waaclock";

// const kickOptions = [
//   [1, 0, 0, 1, 1, 0, 0, 0],
//   [1, 0, 1, 0, 1, 0, 1, 0],
//   [1, 0, 1, 0, 1, 0, 1, 1],
//   [1, 0, 1, 1, 1, 0, 1, 0],
// ];

// const snareOptions = [
//   [0, 0, 1, 0, 0, 0, 1, 0],
//   [1, 0, 1, 0, 1, 0, 1, 0],
//   [0, 1, 0, 0, 0, 1, 0, 0],
//   [0, 0, 1, 1, 0, 0, 1, 0],
// ];

const kickOptions = [
  [1, 1, 1, 1],
  [1, 0, 0, 1],
];
const snareOptions = [
  [0, 1, 0, 1],
  [0, 0, 1, 0],
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

var beats = {},
  tempo = BPM,
  signature = 4,
  beatDur = 60 / tempo,
  barDur = signature * beatDur;

// This function deactivates the beat `beatInd` of `track`.

const initializeGrid = (length) =>
  Array.from({ length: length }, () => null).reduce(
    (prev, beat, index) => ({ ...prev, [index]: null }),
    {}
  );

function SequencerForm({
  midi,
  clock,
  context,
}: {
  midi: Midi;
  clock: ClockProps["clock"];
  context: ClockProps["context"];
}) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const grid = useRef([initializeGrid(signature), initializeGrid(signature)]);

  const nextBeatTime = useCallback(function (beatInd: number) {
    const currentTime = context.current.currentTime;
    console.log(currentTime);
    const currentBar = Math.floor(currentTime / barDur);
    const currentBeat = Math.round(currentTime % barDur);
    if (currentBeat < beatInd) return currentBar * barDur + beatInd * beatDur;
    else return (currentBar + 1) * barDur + beatInd * beatDur;
  }, []);

  const updateGrid = useCallback(() => {
    const { kick, snare } = getValues();

    const tracks = [kickOptions[Number(kick)], snareOptions[Number(snare)]];

    grid.current = tracks.map((option, trackIndex) =>
      option.reduce((prev, step, beatIndex) => {
        if (grid.current[trackIndex][beatIndex]) {
          grid.current[trackIndex][beatIndex].clear();
        }
        console.log("event");
        const event = clock.current.callbackAtTime(function (event) {
          console.log("tick");
          midi.port.channels[1].playNote(noteMap[trackIndex], {
            duration: beatDur - 5,
            time: event.deadline * 1000,
            attack: step,
          });
        }, nextBeatTime(beatIndex));

        event.repeat(barDur);
        event.tolerance({ late: 0.01 });

        return {
          ...prev,
          [beatIndex]: event,
        };
      }, {})
    );
  }, [getValues, midi.port, nextBeatTime, clock]);

  useEffect(() => {
    if (!clock.current) return;
    if (!clock.current._started) {
      console.log(clock);
      clock.current.start();
      updateGrid();
    }
  }, [updateGrid, clock]);

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
