// NOTE This function runs in a separate context, so does not have access to
// instance variables!
let _workerTimerId;
onmessage = (e) => {
  const action = e.data.action;
  if (action === "start") {
    // Run first tick on next event loop
    setTimeout(() => {
      postMessage({ action: "tick" });
    });
    // Run subsequent ticks every e.data.interval seconds
    _workerTimerId = setInterval(() => {
      postMessage({ action: "tick" });
    }, e.data.interval * 1000);
  }

  if (action === "stop") {
    clearInterval(_workerTimerId);
    _workerTimerId = null;
  }
};
