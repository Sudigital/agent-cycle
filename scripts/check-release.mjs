#!/usr/bin/env node
// Release metadata check: package version, README pins, changelog, and the tag.
// Exits non-zero on drift; --print-notes emits GitHub Release notes for the tag.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);

function valueAfter(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    console.error(`${flag} requires a value`);
    process.exit(2);
  }
  return value;
}

const rootValue = valueAfter("--root");
const tag = valueAfter("--tag");
const ROOT = rootValue ? resolve(rootValue) : resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE = join(ROOT, "package.json");
const README = join(ROOT, "README.md");
const CHANGELOG = join(ROOT, "CHANGELOG.md");
const failures = [];
const fail = (message) => failures.push(message);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function read(path, label) {
  if (!existsSync(path)) {
    fail(`${label} is missing`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function readJson(path, label) {
  const text = read(path, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

const pkg = readJson(PACKAGE, "package.json");
const version = pkg?.version;
const validVersion = typeof version === "string" && /^\d+\.\d+\.\d+$/.test(version);
if (!validVersion) fail("package.json version must be X.Y.Z");

let changelog = "";

if (validVersion) {
  const readme = read(README, "README.md");
  const pins = [...readme.matchAll(/npx\s+github:\S*#v(\d+\.\d+\.\d+)/g)].map((match) => match[1]);
  if (pins.length === 0) fail("README.md has no npx github:...#vX.Y.Z install pin");
  for (const pin of new Set(pins)) {
    if (pin !== version) fail(`README.md pins v${pin}, but package.json is ${version}`);
  }

  changelog = read(CHANGELOG, "CHANGELOG.md");
  const heading = new RegExp(`^## \\[${escapeRegex(version)}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m");
  if (!heading.test(changelog)) fail(`CHANGELOG.md has no "## [${version}] - YYYY-MM-DD" section`);
  const link = new RegExp(`^\\[${escapeRegex(version)}\\]:\\s+\\S+/releases/tag/v${escapeRegex(version)}\\s*$`, "m");
  if (!link.test(changelog)) fail(`CHANGELOG.md has no [${version}] release link`);

  if (tag && tag !== `v${version}`) fail(`tag ${tag} does not match package.json ${version}`);
}

function repoSlug(value) {
  const url = value?.repository?.url;
  const match = typeof url === "string" && url.match(/github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/);
  return match ? match[1] : null;
}

function section(value, release) {
  const heading = new RegExp(`^## \\[${escapeRegex(release)}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m");
  const start = heading.exec(value);
  if (!start) return "";
  const rest = value.slice(start.index + start[0].length);
  const next = rest.search(/^## \[/m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

if (failures.length > 0) {
  console.error("\nrelease check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else if (args.includes("--print-notes")) {
  const slug = repoSlug(pkg);
  const body = section(changelog, version);
  if (!slug) {
    console.error("package.json repository.url must name a GitHub repository");
    process.exitCode = 1;
  } else if (!body) {
    console.error(`CHANGELOG.md section for ${version} is empty`);
    process.exitCode = 1;
  } else {
    console.log(
      [
        "## Install",
        "",
        "```bash",
        `npx github:${slug}#v${version} install --target . --both --with-docs`,
        "```",
        "",
        body,
        "",
        `**Full changelog:** https://github.com/${slug}/blob/v${version}/CHANGELOG.md`,
      ].join("\n"),
    );
  }
} else {
  console.log(`release check passed (v${version})`);
}
