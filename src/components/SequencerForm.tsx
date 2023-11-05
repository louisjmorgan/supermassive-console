import useClock, { ClockProps } from "@/hooks/useClock";
import { Midi } from "@/hooks/useMidi";
import { charToMidi } from "@/lib/midi";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { WebMidi } from "webmidi";

const sequencerOptions = {
  kick: [
    [1, 0, 0, 1, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 0],
  ],
  snare: [
    [0, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 0],
  ],
};

// const kickOptions = [
//   [1, 1, 1, 1],
//   [1, 0, 0, 1],
// ];
// const snareOptions = [
//   [0, 0, 1, 0],
//   [0, 1, 0, 1],
// ];

const noteMap = {
  kick: 60,
  snare: 65,
};

const channelMap = {
  kick: 1,
  snare: 1,
  bass: 2,
  synth: 3,
};

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
  division = 8,
  beatDur = 60 / tempo,
  barDur = signature * beatDur,
  stepDur = barDur / division;

// This function deactivates the beat `beatInd` of `track`.

const initializeGrid = (length) =>
  Array.from({ length: length }, () => null).reduce(
    (prev, beat, index) => ({ ...prev, [index]: { value: null, event: null } }),
    {}
  );

const nextBeatTime = function (context: AudioContext, beatInd: number) {
  const currentTime = context.currentTime;
  const currentBar = Math.floor(currentTime / barDur);
  const currentBeat = Math.round(currentTime % barDur);
  if (currentBeat < beatInd) return currentBar * barDur + beatInd * stepDur;
  else return (currentBar + 1) * barDur + beatInd * stepDur;
};

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
    formState: { errors },
  } = useForm();

  const grid = useRef(
    Object.keys(channelMap).reduce(
      (prev, key) => ({ ...prev, [key]: initializeGrid(division) }),
      {}
    )
  );

  const generateMidiCallback = useCallback(
    (channel, note, velocity) => {
      return function (event) {
        midi.port.channels[channel].playNote(note, {
          duration: stepDur * 1000 - 5,
          time: WebMidi.time - event.deadline * 1000,
          attack: velocity,
        });
      };
    },
    [midi]
  );

  const scheduleMidiEvent = useCallback(
    (channel: number, note: number, velocity: number, stepIndex) => {
      const event = clock.current.callbackAtTime(function (event) {
        midi.port.channels[channel].playNote(note, {
          duration: stepDur * 1000 - 5,
          time: `+${
            (event.deadline - context.current.currentTime + 0.1) * 1000
          }`,
          attack: velocity,
        });
      }, nextBeatTime(context.current, stepIndex + 1));
      event.repeat(barDur);
      event.tolerance({ late: 0.1, early: 0.001 });
      return event;
    },
    [clock, context, midi.port]
  );

  const updateOptionTrack = useCallback(
    (trackName: string, trackIndex: number) => {
      const option = sequencerOptions[trackName][trackIndex];
      option.forEach((step: number, stepIndex: number) => {
        if (grid.current[trackName][stepIndex].value === step) return;

        if (grid.current[trackName][stepIndex].event) {
          grid.current[trackName][stepIndex].event.clear();
        }

        const event = step
          ? scheduleMidiEvent(
              channelMap[trackName],
              noteMap[trackName],
              step,
              stepIndex
            )
          : null;

        grid.current[trackName][stepIndex] = {
          value: step,
          event,
        };
      });
    },
    [scheduleMidiEvent]
  );

  const onSelectOption: (
    trackName: string
  ) => React.FormEventHandler<HTMLInputElement> = useCallback(
    (trackName: string) => {
      return (e) => {
        updateOptionTrack(trackName, Number(e.currentTarget.value));
      };
    },
    [updateOptionTrack]
  );

  const updateTextTrack = useDebouncedCallback(
    (trackName: string, text: string) => {
      const chars = text.padEnd(division).split("");

      chars.forEach((char: string, stepIndex: number) => {
        if (grid.current[trackName][stepIndex].value === char) return;

        if (grid.current[trackName][stepIndex].event) {
          grid.current[trackName][stepIndex].event.clear();
        }

        const event =
          char !== " "
            ? scheduleMidiEvent(
                channelMap[trackName],
                charToMidi(char),
                1,
                stepIndex
              )
            : null;

        grid.current[trackName][stepIndex] = {
          value: char,
          event,
        };
      });
    },
    200
  );

  const onType: (
    trackName: string
  ) => React.FormEventHandler<HTMLInputElement> = useCallback(
    (trackName: string) => {
      return (e) => {
        updateTextTrack(trackName, e.currentTarget.value);
      };
    },
    [updateTextTrack]
  );

  useEffect(() => {
    if (clock.current && clock.current._started) {
      console.log("update track");
      updateOptionTrack("kick", 0);
      updateOptionTrack("snare", 0);
    }
  }, [updateOptionTrack, clock]);

  return (
    <div>
      <form className="flex items-center gap-5">
        <select
          {...register("kick", {
            onChange: onSelectOption("kick"),
          })}
        >
          {sequencerOptions.kick.map((opt, index) => (
            <option key={index}>{index}</option>
          ))}
        </select>{" "}
        <select
          {...register("snare", {
            onChange: onSelectOption("snare"),
          })}
        >
          {sequencerOptions.snare.map((opt, index) => (
            <option key={index}>{index}</option>
          ))}
        </select>
        <input
          maxLength={8}
          {...register("bass", {
            onChange: onType("bass"),
          })}
        />
        <input
          maxLength={8}
          {...register("synth", {
            onChange: onType("synth"),
          })}
        />
      </form>
    </div>
  );
}

export default SequencerForm;
