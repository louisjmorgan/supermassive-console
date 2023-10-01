import React, { useEffect } from "react";
const allowedKeys = ["Enter", "Backspace"];

function useSwallowKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        (e.key.length !== 1 && !allowedKeys.includes(e.key))
      ) {
        e.preventDefault();
        return;
      }
    };

    const onClick = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKey);
    document.addEventListener("click", onClick);
    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return;
}

export default useSwallowKeys;
