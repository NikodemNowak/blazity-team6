import { describe, it, expect } from "vitest";
import { sanitizeFindings, githubBlobUrl } from "../drift";
import type { DriftFinding, RepoBundle } from "../types";

const bundle = {
  repoId: "o/r",
  owner: "o",
  repo: "r",
  branch: "main",
  fileTree: ["a.ts"],
  files: [{ path: "a.ts", content: "l1\nl2\nl3\nl4\nl5" }],
  stats: { filesLoaded: 1, filesTotal: 1, totalChars: 0, truncated: false },
} as RepoBundle;

const finding = (over: Partial<DriftFinding> = {}): DriftFinding => ({
  docFile: "README.md",
  claim: "stale claim",
  contradictingCode: { path: "a.ts", startLine: 1, endLine: 2 },
  explanation: "why",
  severity: "medium",
  ...over,
});

describe("sanitizeFindings", () => {
  it("keeps a valid finding for a loaded file", () => {
    const out = sanitizeFindings([finding()], bundle);
    expect(out).toHaveLength(1);
    expect(out[0].contradictingCode).toEqual({ path: "a.ts", startLine: 1, endLine: 2 });
  });

  it("drops findings whose cited file is not in the bundle", () => {
    const out = sanitizeFindings(
      [finding({ contradictingCode: { path: "missing.ts", startLine: 1, endLine: 1 } })],
      bundle,
    );
    expect(out).toHaveLength(0);
  });

  it("clamps out-of-range line numbers to the file bounds", () => {
    const out = sanitizeFindings(
      [finding({ contradictingCode: { path: "a.ts", startLine: 0, endLine: 99 } })],
      bundle,
    );
    expect(out[0].contradictingCode).toMatchObject({ startLine: 1, endLine: 5 });
  });

  it("normalizes an out-of-enum severity to low", () => {
    const out = sanitizeFindings(
      [finding({ severity: "critical" as unknown as DriftFinding["severity"] })],
      bundle,
    );
    expect(out[0].severity).toBe("low");
  });

  it("sorts findings high -> medium -> low", () => {
    const out = sanitizeFindings(
      [finding({ severity: "low" }), finding({ severity: "high" }), finding({ severity: "medium" })],
      bundle,
    );
    expect(out.map((f) => f.severity)).toEqual(["high", "medium", "low"]);
  });

  it("drops findings with no contradictingCode", () => {
    const out = sanitizeFindings(
      [finding({ contradictingCode: undefined as unknown as DriftFinding["contradictingCode"] })],
      bundle,
    );
    expect(out).toHaveLength(0);
  });
});

describe("githubBlobUrl", () => {
  it("builds a single-line anchor when start equals end", () => {
    expect(githubBlobUrl("o/r", "src/a.ts", 5, 5)).toBe(
      "https://github.com/o/r/blob/HEAD/src/a.ts#L5",
    );
  });
  it("builds a range anchor when lines differ", () => {
    expect(githubBlobUrl("o/r", "src/a.ts", 5, 9)).toBe(
      "https://github.com/o/r/blob/HEAD/src/a.ts#L5-L9",
    );
  });
});
