import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SKILLS_DIR = resolve(ROOT, "skills");
export const LOCK_NAME = ".skills-lock.json";
export const CONTRACT_LOCK = ".agent-cycle-contract.json";
export const CONTRACT_PATHS = ["CLAUDE.md", "docs/agents", "adapters"];

const PACKAGE = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));

function normalizeSource(url) {
  return url
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git@github\.com:/, "github:")
    .replace(/^https?:\/\/github\.com\//, "github:");
}

function resolveCommit() {
  try {
    const commit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (commit) return commit;
  } catch {
    // Not a checkout (npx tarball): fall through to npm metadata.
  }
  return PACKAGE.gitHead || process.env.npm_package_gitHead || null;
}

export const META = {
  source: normalizeSource(PACKAGE.repository.url),
  ref: `v${PACKAGE.version}`,
  commit: resolveCommit(),
};
