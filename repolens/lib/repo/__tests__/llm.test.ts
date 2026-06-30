import { describe, it, expect } from "vitest";
import { buildRepoContext } from "../llm";
import type { RepoBundle } from "../types";

const bundle = {
  repoId: "o/r",
  owner: "octo",
  repo: "demo",
  branch: "main",
  fileTree: ["a.ts", "assets/logo.png"],
  files: [{ path: "a.ts", content: "const x = 1;\nexport default x;" }],
  stats: { filesLoaded: 1, filesTotal: 2, totalChars: 0, truncated: false },
} as RepoBundle;

describe("buildRepoContext", () => {
  it("includes the repo header with owner/repo/branch", () => {
    expect(buildRepoContext(bundle)).toContain("Repository: octo/demo (branch main)");
  });

  it("lists the full file tree including unloaded paths", () => {
    const text = buildRepoContext(bundle);
    expect(text).toContain("assets/logo.png");
    expect(text).toContain("FULL FILE TREE");
  });

  it("prefixes file content lines with 1-indexed line numbers", () => {
    const text = buildRepoContext(bundle);
    expect(text).toContain("=== FILE: a.ts ===");
    expect(text).toContain("1\tconst x = 1;");
    expect(text).toContain("2\texport default x;");
  });

  it("marks repository content as untrusted data", () => {
    expect(buildRepoContext(bundle)).toContain("UNTRUSTED DATA");
  });
});
