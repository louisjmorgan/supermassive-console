import SequencerForm from "@/components/SequencerForm";
import Terminal from "@/components/Terminal";
import useClock from "@/hooks/useClock";
import useMidi, { Midi } from "@/hooks/useMidi";
import useStateRouter from "@/hooks/useStateRouter";
import { midToJson } from "@/lib/midi";
import { TrackJSON } from "@tonejs/midi";
import { Socket } from "socket.io-client";
import { CurrentState } from "./_app";

export default function Home({
  midiFiles,
  currentState,
  socket,
}: {
  midiFiles: Record<string, TrackJSON[]>;
  currentState: CurrentState;
  socket: Socket;
}) {
  const midi = useMidi();
  const { clock, context } = useClock();
  const { CurrentComponent } = useStateRouter({
    currentState,
  });

  return CurrentComponent ? (
    <CurrentComponent
      clock={clock}
      context={context}
      midi={midi}
      midiFiles={midiFiles}
      socket={socket}
    />
  ) : (
    <>N/A</>
  );
}

export async function getStaticProps() {
  const fs = require("fs");
  const path = require("path");

  const directoryPath = path.resolve(process.cwd(), "src/assets/midi/");
  const files = await fs.promises.readdir(directoryPath);

  const midiFilePromises = files.map(
    async (file: string) => await midToJson(directoryPath, file)
  );

  const midiFiles = (await Promise.all(midiFilePromises)).reduce(
    (prev, [file, midi]) => ({
      ...prev,
      [file.replace(".mid", "")]: midi,
    }),
    {}
  );

  return {
    props: {
      midiFiles: JSON.parse(JSON.stringify(midiFiles)),
    },
  };
}
