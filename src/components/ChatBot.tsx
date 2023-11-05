import useClock from "@/hooks/useClock";
import Terminal from "./Terminal";
import { TrackJSON } from "@tonejs/midi";
import { Midi } from "@/hooks/useMidi";
import { Socket } from "socket.io-client";

export default function ChatBot({
  midi,
  midiFiles,
  clock,
  context,
  socket,
}: {
  midi: Midi;
  midiFiles: Record<string, TrackJSON[]>;
  clock: any;
  context: any;
  socket: Socket;
}) {
  return (
    <main>
      <Terminal
        midi={midi}
        midiFiles={midiFiles}
        clock={clock}
        context={context}
      />
    </main>
  );
}
