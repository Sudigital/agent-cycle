#!/usr/bin/env node
// Provenance and content checks for the agent-cycle skill kit.
// Exits non-zero on any violation so CI can gate the release.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");
const NOTICES = join(ROOT, "THIRD-PARTY-NOTICES.md");
const PROVENANCE = join(ROOT, "provenance.json");
const CLASSIFICATIONS = new Set(["repo-owned", "adapted", "vendored"]);
const LICENSES = new Set(["MIT", "Apache-2.0"]);
const FORBIDDEN = ["SU" + "DI-", "sudi" + "gital", "354" + "db605", "@" + "sudi" + "/"];
const SCANNED_DIRS = ["skills", "adapters", "docs"];
const SCANNED_FILES = ["CLAUDE.md"];
const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".zip",
  ".gz",
]);

const failures = [];
const fail = (message) => failures.push(message);

function walk(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(full, base, out);
    else if (entry.isFile()) out.push(relative(base, full).split(sep).join("/"));
  }
  return out;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`cannot parse ${relative(ROOT, path)}: ${error.message}`);
    return null;
  }
}

function checkProvenance() {
  const data = readJson(PROVENANCE);
  if (!data || !Array.isArray(data.skills)) {
    fail("provenance.json must contain a skills array");
    return;
  }

  const dirs = readdirSync(SKILLS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const rows = new Map();

  for (const row of data.skills) {
    if (!row || typeof row !== "object") {
      fail("provenance.json contains a non-object row");
      continue;
    }
    if (typeof row.path !== "string" || !row.path.startsWith("skills/")) {
      fail(`invalid provenance path: ${JSON.stringify(row.path)}`);
      continue;
    }
    const name = row.path.slice("skills/".length);
    if (name.includes("/")) {
      fail(`provenance path must name one skill directory: ${row.path}`);
      continue;
    }
    if (rows.has(name)) fail(`duplicate provenance row: ${row.path}`);
    rows.set(name, row);

    if (!CLASSIFICATIONS.has(row.classification)) {
      fail(`${row.path}: classification must be repo-owned, adapted, or vendored`);
    }
    for (const field of ["source", "commit", "license"]) {
      if (typeof row[field] !== "string" || row[field].trim() === "") {
        fail(`${row.path}: missing ${field}`);
      }
    }
    if (!LICENSES.has(row.license)) {
      fail(`${row.path}: license must be MIT or Apache-2.0`);
      continue;
    }
    if (row.classification !== "repo-owned") {
      if (typeof row.licenseFile !== "string" || row.licenseFile.trim() === "") {
        fail(`${row.path}: missing licenseFile`);
        continue;
      }
      if (row.licenseFile.includes("/") || row.licenseFile.includes("..")) {
        fail(`${row.path}: licenseFile must be a file in the skill directory`);
        continue;
      }
      const licensePath = join(SKILLS, name, row.licenseFile);
      if (!existsSync(licensePath)) {
        fail(`${row.path}: missing ${row.licenseFile}`);
        continue;
      }
      const text = readFileSync(licensePath, "utf8");
      if (row.license === "MIT") {
        if (!/copyright/i.test(text) || !/permission is hereby granted/i.test(text)) {
          fail(`${row.path}: ${row.licenseFile} is not a complete MIT text`);
        }
      } else if (!/apache license/i.test(text) || !/version 2\.0/i.test(text)) {
        fail(`${row.path}: ${row.licenseFile} is not a complete Apache-2.0 text`);
      }
    }
  }

  for (const name of dirs) {
    const skillFile = join(SKILLS, name, "SKILL.md");
    if (!existsSync(skillFile)) fail(`skills/${name} has no SKILL.md`);
    if (!rows.has(name)) fail(`skills/${name} is not in provenance.json`);
  }
  for (const name of rows.keys()) {
    if (!dirs.includes(name)) fail(`provenance row has no skill directory: skills/${name}`);
  }

  const notices = existsSync(NOTICES) ? readFileSync(NOTICES, "utf8") : "";
  if (!notices) fail("THIRD-PARTY-NOTICES.md is missing or empty");
  const upstreamPath = join(ROOT, "UPSTREAM.md");
  const upstream = existsSync(upstreamPath) ? readFileSync(upstreamPath, "utf8") : "";
  if (!upstream) fail("UPSTREAM.md is missing or empty");

  for (const [name, row] of rows) {
    if (!notices.includes(`\`${name}\``)) fail(`THIRD-PARTY-NOTICES.md does not mention ${name}`);
    if (!notices.toLowerCase().includes(row.license.toLowerCase())) {
      fail(`THIRD-PARTY-NOTICES.md does not state ${row.license} for ${name}`);
    }
    if (upstream && !upstream.includes(`| \`${name}\``)) fail(`UPSTREAM.md does not mention ${name}`);
  }

  return rows;
}

function scanText(path, label) {
  const text = readFileSync(path, "utf8").toLowerCase();
  for (const needle of FORBIDDEN) {
    if (text.includes(needle.toLowerCase())) fail(`forbidden string "${needle}" in ${label}`);
  }
}

function checkForbidden() {
  for (const dir of SCANNED_DIRS) {
    const full = join(ROOT, dir);
    if (!existsSync(full)) continue;
    for (const rel of walk(full)) {
      if (BINARY_EXTENSIONS.has(rel.slice(rel.lastIndexOf(".")))) continue;
      scanText(join(full, rel), `${dir}/${rel}`);
    }
  }
  for (const rel of SCANNED_FILES) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) fail(`${rel} is missing`);
    else scanText(full, rel);
  }
}

function summary(rows) {
  console.log("provenance:");
  for (const [name, row] of rows) {
    const classification = String(row.classification ?? "?");
    const license = String(row.license ?? "?");
    const licenseFile = row.licenseFile ? ` ${row.licenseFile}` : "";
    console.log(`  ${name.padEnd(32)} ${classification.padEnd(11)} ${`${license}${licenseFile}`}`);
  }
  const total = [...walk(SKILLS)].filter((rel) => rel.endsWith("SKILL.md")).length;
  console.log(`skills: ${total}`);
}

const rows = checkProvenance();
checkForbidden();

if (rows) summary(rows);

if (failures.length > 0) {
  console.error("\nprovenance check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("provenance check passed");
}
