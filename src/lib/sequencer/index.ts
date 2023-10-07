const clockWorkerUrl = () => {
  //   const blob = new Blob([`(${ClockWorker.toString()})()`], {
  //     type: "application/javascript",
  //   });
  //   return URL.createObjectURL(blob);
  return new URL("./clockWorker.ts");
};

export interface SequencerOptions {
  interval?: number;
  lookahead?: number;
  useWorker?: boolean;
  startTime?: number;
}

const Sequencer = (getCurrentTime, options: SequencerOptions = {}) => {
  console.log("sequencer");
  // NOTE
  // All absolute times are in seconds.
  // All musical times are in whole notes.

  //// Setup ///////////////////////////////////////////////////////////////////

  const _interval = options.interval || 0.025; // Time between ticks.
  const _lookahead = options.lookahead || 0.1; // Time to look ahead for events to schedule.
  const _useWorker = options.useWorker === undefined ? true : options.useWorker;

  let _timerId;
  let _isPlaying = false;
  let _tempo;
  let _onStop;
  let _nextEventIndex;
  let _nextEventTime;
  let _events;
  let _deltas;
  let { startTime: _startTime = getCurrentTime() + _lookahead } = options;

  //// Playback ////////////////////////////////////////////////////////////////

  const init = (events, options) => {
    _tempo = options.tempo || 120;
    _onStop = options.onStop || (() => {});

    // Add the loop event if present & sort the events by time.
    _events = events.slice();
    if (options.loopLength) {
      _events.push({ time: options.loopLength, loop: true });
    }
    _events.sort((a, b) => a.time - b.time);
    // For each event, get the delta time since the previous event.
    _deltas = _events.map(({ time, callback }, i, arr) => time);
  };

  // While there are notes that will need to play during the next lookahead period,
  // schedule them and advance the pointer.

  const dispatch = () => {
    const callback = _events[_nextEventIndex].callback;
    if (callback) {
      callback(_nextEventTime);
    }
  };

  // Move the pointer to the next note.
  const advance = () => {
    const loop = _events[_nextEventIndex].loop;
    const isLastEvent = _nextEventIndex === _deltas.length - 1;

    // If we are not looping and this is the end of the sequence, stop.
    if (isLastEvent && !loop) {
      stopInternal("finished");
      return;
    }

    // If we are at the loop point, move it to the first note.
    if (loop) {
      _nextEventIndex = 0;
      _startTime = getCurrentTime() + _lookahead;
    } else {
      _nextEventIndex += 1;
    }
    _nextEventTime = _startTime + _deltas[_nextEventIndex];
  };

  //   const secsFromWholeNotes = (whns) => whns * (240 / _tempo);

  const onTick = () => {
    const horizon = getCurrentTime() + _lookahead;
    while (_isPlaying && _nextEventTime < horizon) {
      dispatch();
      advance();
    }
  };

  const _clockWorker =
    _useWorker &&
    new Worker(new URL("./clockWorker.js", import.meta.url), {
      type: "module",
    });
  if (_clockWorker) {
    _clockWorker.onmessage = onTick;
  }

  //// Clock ///////////////////////////////////////////////////////////////////

  const startClock = () => {
    if (_useWorker) {
      _clockWorker.postMessage({ action: "start", interval: _interval });
    } else {
      // Run first tick on next event loop
      setTimeout(onTick);
      // Run subsequent ticks every _interval seconds
      _timerId = setInterval(onTick, _interval * 1000);
    }
  };

  const stopClock = () => {
    if (_useWorker) {
      _clockWorker.postMessage({ action: "stop" });
    } else {
      clearInterval(_timerId);
      _timerId = null;
    }
  };

  const stopInternal = (reason) => {
    if (_isPlaying) {
      _isPlaying = false;
      stopClock();
    }
    _onStop(reason);
  };

  //// API /////////////////////////////////////////////////////////////////////

  const play = (events, options: SequencerOptions = {}) => {
    console.log("play");
    if (_isPlaying) {
      stop();
    }
    _isPlaying = true;
    init(events, options);

    // Point the sequencer to the first event.
    _nextEventIndex = 0;

    // Schedule the first event.
    _nextEventTime = _startTime + _deltas[0];

    startClock();
  };

  const stop = () => stopInternal("stopped");

  const changeTempo = (tempo) => {
    // Tempo changes may take up to [lookahead] to take effect.
    if (!_isPlaying) {
      return;
    }
    _tempo = tempo;
  };

  const isPlaying = () => _isPlaying;

  return { play, stop, changeTempo, isPlaying };
};

export default Sequencer;
