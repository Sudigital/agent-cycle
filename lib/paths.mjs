import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  fchmodSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

export function hashFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function walk(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`refusing symlinked source: ${full}`);
    if (entry.isDirectory()) walk(full, base, out);
    else if (entry.isFile()) out.push(relative(base, full).split(sep).join("/"));
  }
  return out.sort();
}

export function isInside(root, path) {
  return path === root || path.startsWith(root + sep);
}

export function safeRel(rel) {
  if (typeof rel !== "string" || rel.length === 0) throw new Error("lock contains an empty path");
  if (rel.includes("\0") || rel.includes("\\")) throw new Error(`lock path is not portable: ${rel}`);
  if (rel.startsWith("/") || /^[A-Za-z]:/.test(rel)) throw new Error(`lock path is absolute: ${rel}`);
  const parts = rel.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    throw new Error(`lock path escapes the target: ${rel}`);
  }
  return parts.join("/");
}

export function safeJoin(root, rel) {
  const full = resolve(root, safeRel(rel));
  if (!isInside(root, full)) throw new Error(`path escapes the target: ${rel}`);
  return full;
}

export function openTarget(target, { create }) {
  const absolute = resolve(target);
  if (create) mkdirSync(absolute, { recursive: true });
  let stat;
  try {
    stat = lstatSync(absolute);
  } catch {
    throw new Error(`target does not exist: ${absolute}`);
  }
  if (stat.isSymbolicLink()) throw new Error(`refusing symlinked target: ${absolute}`);
  if (!stat.isDirectory()) throw new Error(`target is not a directory: ${absolute}`);
  return realpathSync(absolute);
}

export function assertNoSymlinkPath(root, target) {
  const rel = relative(root, target);
  if (rel === "") return;
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`target escapes the project: ${target}`);
  }
  let dir = root;
  for (const part of rel.split(sep)) {
    dir = join(dir, part);
    if (!existsSync(dir)) return;
    if (lstatSync(dir).isSymbolicLink()) throw new Error(`refusing symlinked path: ${relative(root, dir)}`);
  }
}

export function assertParents(root, rel) {
  let dir = root;
  for (const part of rel.split("/").slice(0, -1)) {
    dir = join(dir, part);
    if (!existsSync(dir)) {
      mkdirSync(dir);
      continue;
    }
    const stat = lstatSync(dir);
    if (stat.isSymbolicLink()) throw new Error(`refusing to write through a symlink: ${relative(root, dir)}`);
    if (!stat.isDirectory()) throw new Error(`not a directory: ${relative(root, dir)}`);
  }
}

export function writeNoFollow(path, data, mode) {
  const flags = constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | (constants.O_NOFOLLOW ?? 0);
  let fd;
  try {
    fd = openSync(path, flags, mode);
  } catch (error) {
    if (error.code === "ELOOP") throw new Error(`refusing to write through a symlink: ${path}`);
    throw error;
  }
  try {
    writeFileSync(fd, data);
    try {
      fchmodSync(fd, mode);
    } catch {
      // Mode preservation is best-effort on platforms without fchmod.
    }
  } finally {
    closeSync(fd);
  }
}

export function installFile(root, rel, from) {
  const to = safeJoin(root, rel);
  assertParents(root, rel);
  if (existsSync(to)) {
    const stat = lstatSync(to);
    if (stat.isSymbolicLink()) throw new Error(`refusing to replace a symlink: ${rel}`);
    if (!stat.isFile()) throw new Error(`refusing to replace a non-file: ${rel}`);
  }
  writeNoFollow(to, readFileSync(from), statSync(from).mode & 0o777);
  if (hashFile(to) !== hashFile(from)) throw new Error(`copy verification failed: ${rel}`);
}
