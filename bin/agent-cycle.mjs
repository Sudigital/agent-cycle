#!/usr/bin/env node
// Copy-in installer for the agent-cycle skill kit.
// Dependency-free: core modules only, no network, no symlinks.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");
const LOCK_NAME = ".skills-lock.json";
const PACKAGE = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

function usage() {
  console.log(`agent-cycle ${PACKAGE.version}

Usage:
  agent-cycle install --target <dir> [--both]
  agent-cycle --check --target <dir> [--both]

Options:
  --target <dir>  Directory that receives skills/, or the project root with --both.
  --both          Install into <target>/.omp/skills and <target>/.claude/skills.
  --check         Verify an existing copy against its .skills-lock.json.
  --help          Show this help.

The installer never uses the network and never creates symlinks.`);
}

function parseArgs(argv) {
  const args = { command: null, check: false, both: false, target: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "install") args.command = "install";
    else if (arg === "--check") args.check = true;
    else if (arg === "--both") args.both = true;
    else if (arg === "--help" || arg === "-h") args.command = "help";
    else if (arg === "--target") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) throw new Error("--target needs a directory");
      args.target = value;
      i += 1;
    } else if (arg.startsWith("--target=")) {
      args.target = arg.slice("--target=".length);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (args.command === "help") return args;
  if (!args.check && args.command !== "install") {
    throw new Error("expected `install` or `--check`");
  }
  if (args.check && args.command === "install") {
    throw new Error("choose `install` or `--check`, not both");
  }
  if (!args.target) throw new Error("--target is required");
  return args;
}

function normalizeSource(url) {
  if (!url) return "agent-cycle";
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?/i);
  if (match) return `github:${match[1]}/${match[2].replace(/\.git$/, "")}`;
  return url;
}

function resolveCommit() {
  if (process.env.AGENT_CYCLE_COMMIT) return process.env.AGENT_CYCLE_COMMIT;
  try {
    return execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return PACKAGE.gitHead || null;
  }
}

const META = {
  source: normalizeSource(PACKAGE.repository?.url),
  ref: process.env.AGENT_CYCLE_REF || `v${PACKAGE.version}`,
  commit: resolveCommit(),
};

function walk(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`refusing to follow a symlink in the kit: ${full}`);
    }
    if (entry.isDirectory()) walk(full, base, out);
    else if (entry.isFile()) out.push(relative(base, full).split(sep).join("/"));
  }
  return out.sort();
}

function hashFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function buildFileMap() {
  const files = walk(SKILLS_DIR);
  if (files.length === 0) throw new Error("the kit has no skill files");
  const map = {};
  for (const rel of files) map[rel] = hashFile(join(SKILLS_DIR, rel));
  return map;
}

function lockPath(target) {
  return join(target, LOCK_NAME);
}

function readLock(target) {
  const path = lockPath(target);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`cannot read ${path}: ${error.message}`);
  }
}

function writeLock(target, files) {
  const lock = {
    source: META.source,
    ref: META.ref,
    commit: META.commit,
    files,
  };
  writeFileSync(lockPath(target), `${JSON.stringify(lock, null, 2)}\n`);
}

function prune(target, previousFiles, nextFiles) {
  for (const rel of Object.keys(previousFiles || {})) {
    if (rel in nextFiles) continue;
    const stale = join(target, rel);
    if (existsSync(stale)) rmSync(stale);
    let dir = dirname(stale);
    while (dir.startsWith(target) && dir !== target) {
      try {
        if (readdirSync(dir).length > 0) break;
        rmSync(dir, { recursive: false });
        dir = dirname(dir);
      } catch {
        break;
      }
    }
  }
}

function install(target) {
  mkdirSync(target, { recursive: true });
  const files = buildFileMap();
  const previous = readLock(target);
  for (const [rel, hash] of Object.entries(files)) {
    const from = join(SKILLS_DIR, rel);
    const to = join(target, rel);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    chmodSync(to, statSync(from).mode & 0o777);
    if (hashFile(to) !== hash) throw new Error(`copy verification failed for ${rel}`);
  }
  prune(target, previous?.files, files);
  writeLock(target, files);
  console.log(`installed ${Object.keys(files).length} files into ${target} (${META.ref})`);
}

function check(target) {
  const lock = readLock(target);
  if (!lock) throw new Error(`no ${LOCK_NAME} in ${target}; run install first`);
  const problems = [];

  if (lock.source !== META.source) {
    problems.push(`source: lock says ${lock.source}, package is ${META.source}`);
  }
  if (lock.ref !== META.ref) {
    problems.push(`ref: lock says ${lock.ref}, package is ${META.ref}`);
  }
  if (lock.commit && META.commit && lock.commit !== META.commit) {
    problems.push(`commit: lock says ${lock.commit}, package is ${META.commit}`);
  }

  const expected = buildFileMap();
  const locked = lock.files || {};
  for (const rel of Object.keys(expected)) {
    if (!(rel in locked)) problems.push(`missing from lock: ${rel}`);
  }
  for (const rel of Object.keys(locked)) {
    if (!(rel in expected)) problems.push(`removed from kit: ${rel}`);
  }
  for (const [rel, hash] of Object.entries(expected)) {
    const path = join(target, rel);
    if (!existsSync(path)) {
      problems.push(`missing: ${rel}`);
      continue;
    }
    if (hashFile(path) !== hash) problems.push(`changed: ${rel}`);
    else if (locked[rel] !== hash) problems.push(`lock hash stale: ${rel}`);
  }

  if (problems.length > 0) {
    console.error(`drift detected in ${target}:`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log(`ok: ${target} matches ${META.source}@${META.ref}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "help") {
    usage();
    return;
  }

  const root = resolve(args.target);
  const targets = args.both ? [join(root, ".omp", "skills"), join(root, ".claude", "skills")] : [root];

  for (const target of targets) {
    if (args.check) check(target);
    else install(target);
  }
}

try {
  main();
} catch (error) {
  console.error(`agent-cycle: ${error.message}`);
  process.exitCode = 1;
}
