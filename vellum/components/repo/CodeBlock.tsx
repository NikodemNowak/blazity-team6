"use client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { cn } from "@/lib/cn";

// Prism language ids keyed by file extension (used for citation snippets, where
// we only know the path). Anything unmapped falls back to plain "text".
const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript", tsx: "tsx", mts: "typescript", cts: "typescript", d: "typescript",
  js: "javascript", jsx: "jsx", mjs: "javascript", cjs: "javascript",
  json: "json", jsonc: "json",
  py: "python", rb: "ruby", go: "go", rs: "rust", java: "java",
  kt: "kotlin", kts: "kotlin", swift: "swift", dart: "dart",
  c: "c", h: "c", cpp: "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp",
  cs: "csharp", php: "php", scala: "scala", lua: "lua", r: "r",
  css: "css", scss: "scss", sass: "sass", less: "less",
  html: "markup", htm: "markup", xml: "markup", svg: "markup", vue: "markup",
  md: "markdown", mdx: "markdown", tex: "latex",
  sh: "bash", bash: "bash", zsh: "bash", fish: "bash",
  yml: "yaml", yaml: "yaml", toml: "toml", ini: "ini", env: "bash",
  sql: "sql", graphql: "graphql", gql: "graphql", proto: "protobuf",
  ps1: "powershell", bat: "batch", makefile: "makefile",
};

// Fence-info aliases (```ts, ```sh, …) → Prism ids.
const FENCE_ALIAS: Record<string, string> = {
  ts: "typescript", js: "javascript", py: "python", rb: "ruby", rs: "rust",
  sh: "bash", shell: "bash", zsh: "bash", console: "bash",
  yml: "yaml", "c++": "cpp", "c#": "csharp", cs: "csharp", kt: "kotlin",
  html: "markup", xml: "markup", svg: "markup", vue: "markup",
  md: "markdown", "objective-c": "objectivec", golang: "go",
  text: "text", txt: "text", plaintext: "text", plain: "text", "": "text",
};

// Derive a Prism language id from a file path (extension or well-known basename).
export function langFromPath(path: string): string {
  const base = (path.split("/").pop() ?? path).toLowerCase();
  if (base === "dockerfile" || base.startsWith("dockerfile.")) return "docker";
  if (base === "makefile") return "makefile";
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".") + 1) : "";
  return EXT_TO_LANG[ext] ?? "text";
}

function normalizeFence(lang?: string): string {
  if (!lang) return "text";
  const k = lang.toLowerCase();
  return FENCE_ALIAS[k] ?? k;
}

export default function CodeBlock({
  code,
  language,
  fromPath = false,
  showLineNumbers = false,
  startingLineNumber = 1,
}: {
  code: string;
  /** Prism id, fence info string, or — when `fromPath` — a file path. */
  language?: string;
  fromPath?: boolean;
  showLineNumbers?: boolean;
  startingLineNumber?: number;
}) {
  const lang = fromPath ? langFromPath(language ?? "") : normalizeFence(language);
  return (
    <div className={cn("hl", showLineNumbers && "hl-numbered")}>
      <SyntaxHighlighter
        language={lang}
        style={{}}
        useInlineStyles={false}
        PreTag="div"
        CodeTag="code"
        showLineNumbers={showLineNumbers}
        startingLineNumber={startingLineNumber}
        lineNumberStyle={{
          minWidth: "2.4em",
          paddingRight: "1.1em",
          textAlign: "right",
          color: "var(--text-faint)",
          userSelect: "none",
        }}
        codeTagProps={{ className: `language-${lang}` }}
      >
        {code.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}
