"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_THEME } from "@/lib/themes";

interface ThemeCtx {
  theme: string;
  setTheme: (id: string) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: DEFAULT_THEME, setTheme: () => {} });

const STORAGE_KEY = "vellum-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  // Adopt the theme already applied to <html> by the inline boot script.
  useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
    setThemeState(current);
  }, []);

  const setTheme = useCallback((id: string) => {
    setThemeState(id);
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}

// Runs before paint to set the saved theme and avoid a flash of the default.
export const themeBootScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;
