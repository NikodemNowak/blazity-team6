import { describe, it, expect } from "vitest";
import { parseRepoUrl } from "../github";

describe("parseRepoUrl", () => {
  it("parses a standard https github URL", () => {
    expect(parseRepoUrl("https://github.com/facebook/react")).toEqual({
      owner: "facebook",
      repo: "react",
    });
  });
  it("strips a trailing .git suffix", () => {
    expect(parseRepoUrl("https://github.com/facebook/react.git")).toEqual({
      owner: "facebook",
      repo: "react",
    });
  });
  it("parses an scp-style git URL and ignores extra path", () => {
    expect(parseRepoUrl("git@github.com:owner/repo.git/tree/main")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });
  it("trims surrounding whitespace", () => {
    expect(parseRepoUrl("  https://github.com/a-b/c_d  ")).toEqual({
      owner: "a-b",
      repo: "c_d",
    });
  });
  it("throws for a non-github URL", () => {
    expect(() => parseRepoUrl("https://gitlab.com/owner/repo")).toThrow(
      "Not a GitHub repo URL",
    );
  });
  it("rejects traversal segments in owner/repo", () => {
    expect(() => parseRepoUrl("https://github.com/../repo")).toThrow(
      "Invalid repo owner/name",
    );
  });
});
