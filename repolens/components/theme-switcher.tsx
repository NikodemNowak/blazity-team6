"use client";

import { THEMES } from "@/lib/themes";
import { useTheme } from "./theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switch" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className="theme-swatch"
          aria-pressed={theme === t.id}
          aria-label={t.name}
          title={t.name}
          onClick={() => setTheme(t.id)}
          style={{
            background: t.bg,
            // inner accent ring so the swatch hints at both bg + accent
            boxShadow: `inset 0 0 0 6px ${t.accent}`,
          }}
        />
      ))}
    </div>
  );
}
