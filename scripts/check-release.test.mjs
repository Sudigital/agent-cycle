import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { drop, makeRoot, put, run } from "./test-helpers.mjs";

const SCRIPT = fileURLToPath(new URL("./check-release.mjs", import.meta.url));
const VERSION = "1.2.3";

function seed(root, { pin = VERSION, heading = true, link = true } = {}) {
  put(
    root,
    "package.json",
    JSON.stringify({ version: VERSION, repository: { url: "git+https://github.com/owner/repo.git" } }),
  );
  put(root, "README.md", `# Readme\n\nnpx github:owner/repo#v${pin} install --target . --both --with-docs\n`);
  const lines = ["# Changelog", "", "## [Unreleased]", ""];
  if (heading) lines.push(`## [${VERSION}] - 2026-11-19`, "", "### Added", "", "- A thing.", "");
  if (link) lines.push(`[${VERSION}]: https://github.com/owner/repo/releases/tag/v${VERSION}`);
  put(root, "CHANGELOG.md", `${lines.join("\n")}\n`);
}

test("accepts a version, README pins, and changelog that agree", () => {
  const root = makeRoot();
  try {
    seed(root);
    const result = run(SCRIPT, root);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /release check passed \(v1\.2\.3\)/);
  } finally {
    drop(root);
  }
});

test("rejects a README pin that drifted from package.json", () => {
  const root = makeRoot();
  try {
    seed(root, { pin: "1.2.2" });
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /README\.md pins v1\.2\.2, but package\.json is 1\.2\.3/);
  } finally {
    drop(root);
  }
});

test("rejects a README with no install pin", () => {
  const root = makeRoot();
  try {
    seed(root);
    put(root, "README.md", "# Readme\n\nNo install command here.\n");
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /README\.md has no npx github:\.\.\.#vX\.Y\.Z install pin/);
  } finally {
    drop(root);
  }
});

test("rejects a changelog without the release section or link", () => {
  const root = makeRoot();
  try {
    seed(root, { heading: false, link: false });
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /CHANGELOG\.md has no "## \[1\.2\.3\] - YYYY-MM-DD" section/);
    assert.match(result.stderr, /CHANGELOG\.md has no \[1\.2\.3\] release link/);
  } finally {
    drop(root);
  }
});

test("rejects a tag that does not match package.json", () => {
  const root = makeRoot();
  try {
    seed(root);
    const result = run(SCRIPT, root, ["--tag", "v1.2.2"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /tag v1\.2\.2 does not match package\.json 1\.2\.3/);
  } finally {
    drop(root);
  }
});

test("prints release notes for the tagged version", () => {
  const root = makeRoot();
  try {
    seed(root);
    const result = run(SCRIPT, root, ["--tag", `v${VERSION}`, "--print-notes"]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^## Install/);
    assert.match(result.stdout, /npx github:owner\/repo#v1\.2\.3 install/);
    assert.match(result.stdout, /### Added/);
    assert.doesNotMatch(result.stdout, /Unreleased/);
    assert.match(
      result.stdout,
      /Full changelog:\*\* https:\/\/github\.com\/owner\/repo\/blob\/v1\.2\.3\/CHANGELOG\.md/,
    );
  } finally {
    drop(root);
  }
});
