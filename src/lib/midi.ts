import { Midi } from "@tonejs/midi";

export const charToMidi = (char: string) => char.charCodeAt(0) % 127;

export const midiToChar = (midi: number) => String.fromCharCode(midi);

export const createEqualDurationOutput = (output: string, duration: number) =>
  output
    .split("")
    .map((char, index) => ({ char, duration, time: duration * index }));

// interval is a decimal representing step length e.g. 1 is 1 beat / 1 quarter note
export const stepAraryToMidiSequence = (
  array: number[],
  bpm: number,
  interval: number
) => {
  const duration = interval / (bpm / 60);
  return array
    .map((step, index) => ({
      velocity: step * 127,
      time: duration * index,
      duration: duration,
    }))
    .filter((step) => !!step.velocity);
};

// doesn't work in browser
export const midToJson = async (directoryPath: string, file: string) => {
  const fs = require("fs");
  const util = require("util");
  const readFile = util.promisify(fs.readFile);

  // const midiData = await readFile(path, "binary");
  const midiData = await readFile(directoryPath + "/" + file);
  return [file, new Midi(Buffer.from(midiData)).tracks];
};
