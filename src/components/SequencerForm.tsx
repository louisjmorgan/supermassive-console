import { Midi } from "@/hooks/useMidi";
import React, { useCallback, useEffect, useRef } from "react";
import Sequencer from "@/lib/sequencer";
import { useForm } from "react-hook-form";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { stepAraryToMidiSequence } from "@/lib/midi";
import * as Tone from "tone";
import { WebMidi } from "webmidi";
import * as WAAClock from "waaclock";

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

var beats = {},
  tempo = BPM,
  signature = 4,
  beatDur = 60 / tempo,
  barDur = signature * beatDur;

// This function deactivates the beat `beatInd` of `track`.
var stopBeat = function (track, beatInd) {
  var event = beats[track][beatInd];
  event.clear();
};

// ---------- Just some helpers ---------- //
// This helper calculates the absolute time of the upcoming `beatInd`.
var nextBeatTime = function SequencerForm({ midi }: { midi: Midi }) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const beat = useRef(0);

  const grid = useRef([]);

  const clock = useRef<any>(null);
  const context = useRef<any>(null);

  useEffect(() => {
    context.current = new AudioContext();
    clock.current = new WAAClock(context, { toleranceEarly: 0.1 });
  }, []);

  const nextBeatTime = useCallback(function (beatInd: number) {
    var currentTime = context.current.currentTime,
      currentBar = Math.floor(currentTime / barDur),
      currentBeat = Math.round(currentTime % barDur);
    if (currentBeat < beatInd) return currentBar * barDur + beatInd * beatDur;
    else return (currentBar + 1) * barDur + beatInd * beatDur;
  }, []);

  const sequencerLoop = useCallback(() => {
    // This is our callback function. It will execute repeatedly
    const repeat = (time) => {
      grid.current.forEach((row, index) => {
        let step = row[beat.current];
        console.log(step);
        const offset = WebMidi.time - Tone.context.currentTime * 1000;
        const offsetTime = time * 1000 + offset;
        const duration = (INTERVAL / (BPM / 60)) * 1000 - 10;
        midi.playNoteTime(
          noteMap[index],
          step,
          (time - Tone.context.currentTime) * 1000,
          duration
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

  const startClock = useCallback(() => {
    clock.current.start();

    // The following code highlights the current beat in the UI by calling the function `uiNextBeat` periodically.
    clock.current
      .callbackAtTime(() => console.log(beat), nextBeatTime(0))
      .repeat(beatDur)
      .tolerance({ late: 100 });
  }, [nextBeatTime]);

  const updateGrid = useCallback(() => {
    const { kick, snare } = getValues();

    grid.current = [kickOptions[Number(kick)], snareOptions[Number(snare)]];

    grid.current.forEach((row, trackIndex) => {
      row.forEach((step, beatIndex) => {
        beats[trackIndex][beatIndex].clear();
        var event = clock.current.callbackAtTime(function (event) {
          midi.playNoteOn(
            noteMap[trackIndex],
            step,
            event.deadline
            // (INTERVAL / (BPM / 60)) * 0.9
          );
        }, nextBeatTime(beatIndex));
        event.repeat(barDur);
        event.tolerance({ late: 0.01 });
        beats[trackIndex][beatIndex] = event;
      });
    });

    if (Tone.Transport.state !== "started") {
      console.log("start sequencer");
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
};

export default SequencerForm;
