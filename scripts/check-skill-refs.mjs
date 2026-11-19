#!/usr/bin/env node
// Resolve skill references and keep the skills table and counts in sync.
// Exits non-zero on any violation so CI can gate the release.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
if (rootIndex !== -1 && !args[rootIndex + 1]) {
  console.error("--root requires a directory");
  process.exit(2);
}
const ROOT = rootIndex === -1 ? resolve(dirname(fileURLToPath(import.meta.url)), "..") : resolve(args[rootIndex + 1]);
const SKILLS = join(ROOT, "skills");
const SKILLS_DOC = join(ROOT, "docs/agents/skills.md");
const REF_PATHS = ["CLAUDE.md", "README.md", "docs/agents"];
const COUNT_PHRASES = [
  ["README.md", /\bships? (\w+) skills?\b/gi],
  ["README.md", /\bthe (\w+) portable skills?\b/gi],
  ["docs/agents/skills.md", /\bholds (\w+) portable skills?\b/gi],
];
const NUMBERS = new Map([
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12],
  ["thirteen", 13],
  ["fourteen", 14],
  ["fifteen", 15],
  ["sixteen", 16],
  ["seventeen", 17],
  ["eighteen", 18],
  ["nineteen", 19],
  ["twenty", 20],
]);

const failures = [];
const fail = (message) => failures.push(message);

function walk(dir, base, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(full, base, out);
    else if (entry.isFile()) out.push(relative(base, full));
  }
  return out;
}

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

const known = new Set();
for (const entry of readdirSync(SKILLS, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const name = entry.name;
  const file = join(SKILLS, name, "SKILL.md");
  if (!existsSync(file)) {
    fail(`skills/${name} has no SKILL.md`);
    continue;
  }
  known.add(name);
  const frontmatter = read(file).match(/^---\n([\s\S]*?)\n---/);
  const declared = frontmatter?.[1].match(/^name:\s*(\S+)\s*$/m)?.[1];
  if (!declared) fail(`skills/${name}/SKILL.md has no name`);
  else if (declared !== name) fail(`skills/${name}/SKILL.md is named ${declared}`);
}

for (const path of REF_PATHS) {
  const full = join(ROOT, path);
  if (!existsSync(full)) continue;
  const candidates = statSync(full).isDirectory() ? walk(full, ROOT) : [relative(ROOT, full)];
  for (const rel of candidates) {
    if (!rel.endsWith(".md")) continue;
    const text = read(join(ROOT, rel));
    for (const match of text.matchAll(/(?:skill:\/\/|\/skill:)([a-z0-9][a-z0-9-]*)/g)) {
      if (!known.has(match[1])) fail(`${rel} references missing skill ${match[1]}`);
    }
  }
}

const doc = read(SKILLS_DOC);
if (!doc) fail("docs/agents/skills.md is missing");
const listed = new Set();
for (const match of doc.matchAll(/^\|\s*`([a-z0-9][a-z0-9-]*)`\s*\|/gm)) {
  const name = match[1];
  if (listed.has(name)) fail(`docs/agents/skills.md repeats ${name}`);
  listed.add(name);
  if (!known.has(name)) fail(`docs/agents/skills.md lists missing skill ${name}`);
}
for (const name of known) if (!listed.has(name)) fail(`docs/agents/skills.md omits ${name}`);

for (const [file, pattern] of COUNT_PHRASES) {
  const text = read(join(ROOT, file));
  if (!text) continue;
  for (const match of text.matchAll(pattern)) {
    const raw = match[1].toLowerCase();
    const value = /^\d+$/.test(raw) ? Number(raw) : NUMBERS.get(raw);
    if (value === undefined) fail(`${file} states an unreadable skill count: ${match[1]}`);
    else if (value !== known.size) fail(`${file} says ${match[1]} skills, but skills/ holds ${known.size}`);
  }
}

try {
  const tracked = execFileSync("git", ["-C", ROOT, "ls-files", "--", ".omp/skills"], { encoding: "utf8" }).trim();
  if (tracked) fail(".omp/skills is tracked; the canonical tree is skills/");
} catch {
  // Not a git worktree.
}

if (failures.length > 0) {
  console.error("\nskill reference check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`skill reference check passed (${known.size} skills)`);
}
