import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export function makeRoot() {
  return mkdtempSync(join(tmpdir(), "agent-cycle-check-"));
}

export function put(root, path, content) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

export function run(script, root, args = []) {
  return spawnSync(process.execPath, [script, "--root", root, ...args], { encoding: "utf8" });
}

export function drop(root) {
  rmSync(root, { recursive: true, force: true });
}
