import Terminal from "@/components/Terminal";
import { midToJson } from "@/lib/midi";
import { TrackJSON } from "@tonejs/midi";

export default function Home({
  midiFiles,
}: {
  midiFiles: Record<string, TrackJSON[]>;
}) {
  return (
    <main>
      <Terminal midiFiles={midiFiles} />
    </main>
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

  console.log(midiFiles);

  return {
    props: {
      midiFiles: JSON.parse(JSON.stringify(midiFiles)),
    },
  };
}
