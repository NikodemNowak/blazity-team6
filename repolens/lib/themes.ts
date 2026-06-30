// Single source of truth for selectable themes.
// `id` matches a [data-theme="<id>"] block in app/globals.css.
// `swatch` is the dot shown in the switcher (accent colour of that theme).

export interface Theme {
  id: string;
  name: string;
  /** representative colours: [background, accent] for the switcher swatch */
  bg: string;
  accent: string;
  dark?: boolean;
}

export const THEMES: Theme[] = [
  { id: "slate", name: "Slate", bg: "#f5f6f8", accent: "#3a5673" },
  { id: "paper", name: "Paper", bg: "#f3efe7", accent: "#7a5a3a" },
  { id: "ink", name: "Ink", bg: "#ffffff", accent: "#111111" },
  { id: "carbon", name: "Carbon", bg: "#16191d", accent: "#6f8aa6", dark: true },
  { id: "sage", name: "Sage", bg: "#eef1ec", accent: "#4e6b4e" },
  { id: "midnight", name: "Midnight", bg: "#10131c", accent: "#7c8cc4", dark: true },
  { id: "terminal", name: "Terminal", bg: "#0b0f0b", accent: "#6fbf73", dark: true },
  { id: "newsprint", name: "Newsprint", bg: "#f2f0eb", accent: "#3b3b3b" },
  { id: "nord", name: "Nord", bg: "#eceff4", accent: "#5e81ac" },
  { id: "rose", name: "Rose", bg: "#f6eef0", accent: "#8a4a5c" },
  { id: "mocha", name: "Mocha", bg: "#1c1715", accent: "#c8a07a", dark: true },
  { id: "harbor", name: "Harbor", bg: "#eef2f3", accent: "#33697a" },
];

export const DEFAULT_THEME = "slate";
