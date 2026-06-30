import { describe, it, expect } from "vitest";
import { detectLanguageProfiles, describeLanguageProfiles } from "../docTooling";
import type { RepoBundle } from "../types";

const bundleOf = (paths: string[]): RepoBundle =>
  ({
    repoId: "o/r",
    owner: "o",
    repo: "r",
    branch: "main",
    fileTree: paths,
    files: paths.map((path) => ({ path, content: "" })),
    stats: { filesLoaded: paths.length, filesTotal: paths.length, totalChars: 0, truncated: false },
  }) as RepoBundle;

describe("detectLanguageProfiles", () => {
  it("ranks languages by file-extension counts", () => {
    const profiles = detectLanguageProfiles(
      bundleOf(["a.ts", "b.ts", "c.tsx", "d.py", "e.go"]),
    );
    expect(profiles[0].language).toBe("TypeScript");
    expect(profiles[0].files).toBe(3);
    expect(profiles.map((p) => p.language)).toEqual(["TypeScript", "Go", "Python"]);
  });

  it("attaches tooling metadata for a known language", () => {
    const profiles = detectLanguageProfiles(bundleOf(["main.py"]));
    expect(profiles[0]).toMatchObject({
      language: "Python",
      tooling: "pydoc + docstrings",
      files: 1,
    });
    expect(profiles[0].docTargets).toContain("module overview");
  });

  it("ignores files with unknown extensions", () => {
    expect(detectLanguageProfiles(bundleOf(["data.csv", "notes.txt"]))).toEqual([]);
  });

  it("ranks Markdown last on a count tie", () => {
    const profiles = detectLanguageProfiles(bundleOf(["a.md", "b.go"]));
    expect(profiles.map((p) => p.language)).toEqual(["Go", "Markdown"]);
  });

  it("caps results at five languages", () => {
    const profiles = detectLanguageProfiles(
      bundleOf(["a.py", "b.ts", "c.go", "d.rs", "e.java", "f.kt", "g.cs"]),
    );
    expect(profiles).toHaveLength(5);
  });
});

describe("describeLanguageProfiles", () => {
  it("returns a fallback message when no profiles are detected", () => {
    const text = describeLanguageProfiles([]);
    expect(text).toContain("No dominant programming language");
  });

  it("renders language, tooling, targets and conventions", () => {
    const profiles = detectLanguageProfiles(bundleOf(["main.py"]));
    const text = describeLanguageProfiles(profiles);
    expect(text).toContain("Language: Python (1 loaded files)");
    expect(text).toContain("Documentation tooling: pydoc + docstrings");
    expect(text).toContain("Targets:");
    expect(text).toContain("Conventions:");
  });
});
