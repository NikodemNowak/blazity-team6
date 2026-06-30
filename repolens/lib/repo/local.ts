import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { shouldIncludePath } from "./filter";
import type { RepoFile } from "./types";

const LOCAL_REPO = /^[A-Za-z0-9._-]+$/;

async function walk(root: string, dir = root, out: RepoFile[] = [], tree: string[] = []) {
  for (const name of await readdir(dir)) {
    if (name === ".git" || name === "node_modules" || name === ".next") continue;
    const full = path.join(dir, name);
    const entry = await stat(full);
    if (entry.isDirectory()) {
      await walk(root, full, out, tree);
      continue;
    }

    const rel = path.relative(root, full).split(path.sep).join("/");
    tree.push(rel);
    if (entry.size < 100_000 && shouldIncludePath(rel)) {
      out.push({ path: rel, content: await readFile(full, "utf8") });
    }
  }
  return { files: out, fileTree: tree.sort() };
}

export async function fetchLocalRepoFiles(name: string): Promise<{
  branch: string;
  files: RepoFile[];
  fileTree: string[];
  treeTruncated: boolean;
  owner: string;
  repo: string;
}> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Local test repositories are disabled in production");
  }
  if (!LOCAL_REPO.test(name) || name === "." || name === "..") {
    throw new Error("Invalid local test repository name");
  }

  const testRoot = path.resolve(process.cwd(), "..", "test_repos");
  const repoRoot = path.resolve(testRoot, name);
  if (!repoRoot.startsWith(testRoot + path.sep)) {
    throw new Error("Invalid local test repository path");
  }

  const { files, fileTree } = await walk(repoRoot);
  return {
    branch: "local",
    files,
    fileTree,
    treeTruncated: false,
    owner: "local",
    repo: name,
  };
}
