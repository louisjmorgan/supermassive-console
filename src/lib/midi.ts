export const charToMidi = (char: string) => (char.charCodeAt(0) % 64) + 12;
