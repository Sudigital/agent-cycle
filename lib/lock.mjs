import { existsSync, lstatSync, readFileSync, readdirSync, rmdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

import { CONTRACT_LOCK, LOCK_NAME, META } from "./meta.mjs";
import { assertNoSymlinkPath, hashFile, isInside, safeJoin, walk, writeNoFollow } from "./paths.mjs";

export function readLock(root, name = LOCK_NAME) {
  const path = join(root, name);
  if (!existsSync(path)) return null;
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`refusing non-file lock: ${path}`);
  let lock;
  try {
    lock = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`cannot parse ${path}: ${error.message}`);
  }
  if (!lock || typeof lock !== "object" || !lock.files || typeof lock.files !== "object") {
    throw new Error(`invalid lock: ${path}`);
  }
  for (const rel of Object.keys(lock.files)) {
    const full = safeJoin(root, rel);
    assertNoSymlinkPath(root, full);
  }
  return lock;
}

export function writeLock(root, files, name = LOCK_NAME) {
  const lock = { source: META.source, ref: META.ref, commit: META.commit, files };
  writeNoFollow(join(root, name), Buffer.from(`${JSON.stringify(lock, null, 2)}\n`), 0o644);
}

export function prune(root, previousFiles, nextFiles) {
  for (const rel of Object.keys(previousFiles ?? {})) {
    if (rel in nextFiles) continue;
    const stale = safeJoin(root, rel);
    assertNoSymlinkPath(root, stale);
    if (!existsSync(stale)) continue;
    const stat = lstatSync(stale);
    if (stat.isSymbolicLink()) {
      rmSync(stale);
      continue;
    }
    if (stat.isDirectory()) throw new Error(`refusing to prune a directory: ${rel}`);
    rmSync(stale);
    let dir = dirname(stale);
    while (dir !== root && isInside(root, dir)) {
      try {
        if (readdirSync(dir).length > 0) break;
        rmdirSync(dir);
      } catch {
        break;
      }
      dir = dirname(dir);
    }
  }
}

export function verify(root, lock, expected, { strict }) {
  const problems = [];
  for (const [rel, want] of Object.entries(expected)) {
    let full;
    try {
      full = safeJoin(root, rel);
      assertNoSymlinkPath(root, full);
    } catch (error) {
      problems.push(error.message);
      continue;
    }
    if (!existsSync(full)) {
      problems.push(`missing: ${rel}`);
      continue;
    }
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) problems.push(`symlink: ${rel}`);
    else if (!stat.isFile()) problems.push(`not a file: ${rel}`);
    else if (hashFile(full) !== want) problems.push(`changed: ${rel}`);
    if (!(rel in lock.files)) problems.push(`untracked: ${rel}`);
    else if (lock.files[rel] !== want) problems.push(`lock hash differs from ${META.ref}: ${rel}`);
  }
  for (const rel of Object.keys(lock.files)) {
    if (!(rel in expected)) problems.push(`removed from ${META.ref}: ${rel}`);
  }
  if (lock.ref !== META.ref || lock.source !== META.source) {
    problems.push(`lock is for ${lock.source}@${lock.ref}, kit is ${META.source}@${META.ref}`);
  }
  if (META.commit && lock.commit && lock.commit !== META.commit) {
    problems.push(`lock commit ${lock.commit} != ${META.commit}`);
  }
  if (strict) {
    const known = new Set([...Object.keys(expected), LOCK_NAME, CONTRACT_LOCK]);
    try {
      for (const rel of walk(root)) {
        if (!known.has(rel)) problems.push(`unexpected: ${rel}`);
      }
    } catch (error) {
      problems.push(error.message);
    }
  }
  return problems;
}
