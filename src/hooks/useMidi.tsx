import React, { Ref, useCallback, useEffect, useRef, useState } from "react";
import { WebMidi } from "webmidi";

export interface Midi {
  port: any;
}

function useMidi(): any {
  const [port, setPort] = useState<any>();
  useEffect(() => {
    WebMidi.enable()
      .then(onEnabled)
      .catch((err) => alert(err));

    function onEnabled() {
      setPort(WebMidi.getOutputByName("01. Internal MIDI"));
    }
  }, []);

  return {
    port,
  };
}

export default useMidi;
