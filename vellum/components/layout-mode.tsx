"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type LayoutMode = "topnav" | "split";

const Ctx = createContext<{
  mode: LayoutMode;
  setMode: (m: LayoutMode) => void;
}>({ mode: "topnav", setMode: () => {} });

const STORAGE_KEY = "vellum-layout";

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LayoutMode>("topnav");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "split" || saved === "topnav") setModeState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setMode = useCallback((m: LayoutMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export function useLayoutMode() {
  return useContext(Ctx);
}
