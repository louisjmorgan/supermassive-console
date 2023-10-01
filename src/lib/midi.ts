import { Midi } from "@tonejs/midi";

export const charToMidi = (char: string) => char.charCodeAt(0) % 127;

export const midiToChar = (midi: number) => String.fromCharCode(midi);

export const createEqualDurationOutput = (output: string, duration: number) =>
  output
    .split("")
    .map((char, index) => ({ char, duration, time: duration * index }));

// doesn't work in browser
export const midToJson = async (directoryPath: string, file: string) => {
  const fs = require("fs");
  const util = require("util");
  const readFile = util.promisify(fs.readFile);

  // const midiData = await readFile(path, "binary");
  const midiData = await readFile(directoryPath + "/" + file);
  return [file, new Midi(Buffer.from(midiData)).tracks];
};
