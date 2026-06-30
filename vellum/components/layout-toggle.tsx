"use client";

import { useLayoutMode } from "./layout-mode";

export function LayoutToggle() {
  const { mode, setMode } = useLayoutMode();
  return (
    <div className="seg" role="group" aria-label="Layout">
      <button
        type="button"
        className="seg-btn"
        aria-pressed={mode === "topnav"}
        onClick={() => setMode("topnav")}
      >
        Top nav
      </button>
      <button
        type="button"
        className="seg-btn"
        aria-pressed={mode === "split"}
        onClick={() => setMode("split")}
      >
        Split
      </button>
    </div>
  );
}
