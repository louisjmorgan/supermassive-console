import useClock from "@/hooks/useClock";
import Terminal from "./Terminal";
import { TrackJSON } from "@tonejs/midi";
import { Midi } from "@/hooks/useMidi";
import SequencerForm from "./SequencerForm";
import { AnyAudioContext } from "tone/build/esm/core/context/AudioContext";
import { Socket } from "socket.io-client";

export default function TaskRoom({
  midi,
  midiFiles,
  clock,
  context,
  socket,
}: {
  midi: Midi;
  midiFiles: Record<string, TrackJSON[]>;
  clock: any;
  context: AnyAudioContext;
  socket: Socket;
}) {
  return (
    <main>
      <SequencerForm midi={midi} clock={clock} context={context} />
    </main>
  );
}
