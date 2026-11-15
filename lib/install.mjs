import { existsSync } from "node:fs";
import { join } from "node:path";

import { prune, readLock, verify, writeLock } from "./lock.mjs";
import { CONTRACT_LOCK, CONTRACT_PATHS, LOCK_NAME, META, ROOT, SKILLS_DIR } from "./meta.mjs";
import { assertNoSymlinkPath, hashFile, installFile, openTarget, safeJoin, walk } from "./paths.mjs";

function listTree(dir, prefix) {
  const files = {};
  for (const rel of walk(dir)) files[prefix ? `${prefix}/${rel}` : rel] = hashFile(join(dir, rel));
  return files;
}

function buildSkillMap() {
  return listTree(SKILLS_DIR);
}

function buildContractMap() {
  const files = { "CLAUDE.md": hashFile(join(ROOT, "CLAUDE.md")) };
  for (const dir of ["docs/agents", "adapters"]) {
    const full = join(ROOT, dir);
    if (existsSync(full)) Object.assign(files, listTree(full, dir));
  }
  return files;
}

function install(target) {
  const root = openTarget(target, { create: true });
  const files = buildSkillMap();
  const previous = readLock(root);
  for (const rel of Object.keys(files)) installFile(root, rel, join(SKILLS_DIR, rel));
  prune(root, previous?.files, files);
  writeLock(root, files);
  console.log(`installed ${Object.keys(files).length} files into ${root} (${META.ref})`);
}

function check(target, { strict }) {
  const root = openTarget(target, { create: false });
  const lock = readLock(root);
  if (!lock) throw new Error(`no ${LOCK_NAME} in ${root}; run install first`);
  const expected = buildSkillMap();
  const problems = verify(root, lock, expected, { strict });
  if (problems.length > 0) {
    for (const problem of problems) console.error(`drift: ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log(`verified ${Object.keys(expected).length} files in ${root} (${lock.ref})`);
}

function installContract(root) {
  for (const rel of CONTRACT_PATHS) {
    if (existsSync(safeJoin(root, rel))) {
      throw new Error(`refusing to overwrite existing ${rel}; merge the contract manually`);
    }
  }
  const files = buildContractMap();
  for (const rel of Object.keys(files)) installFile(root, rel, join(ROOT, rel));
  writeLock(root, files, CONTRACT_LOCK);
  console.log(`installed ${Object.keys(files).length} contract files into ${root}`);
}

function checkContract(root) {
  const lock = readLock(root, CONTRACT_LOCK);
  if (!lock) throw new Error(`no ${CONTRACT_LOCK} in ${root}; install with --with-docs first`);
  const problems = verify(root, lock, buildContractMap(), { strict: false });
  if (problems.length > 0) {
    for (const problem of problems) console.error(`drift: ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log(`verified ${Object.keys(lock.files).length} contract files in ${root} (${lock.ref})`);
}

export function run(args) {
  if (args.withDocs && !args.both) throw new Error("--with-docs requires --both (project layout)");

  const root = openTarget(args.target, { create: !args.check });
  const targets = args.both ? [join(root, ".omp", "skills"), join(root, ".claude", "skills")] : [root];
  for (const target of targets) {
    if (args.both) assertNoSymlinkPath(root, target);
    if (args.check) check(target, { strict: args.strict });
    else install(target);
  }
  if (args.withDocs) {
    if (args.check) checkContract(root);
    else installContract(root);
  } else if (args.both) {
    console.error("note: skills only; use --with-docs on a fresh project for CLAUDE.md, docs/agents, and adapters");
  }
}
