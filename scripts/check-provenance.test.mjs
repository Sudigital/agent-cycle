import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { drop, makeRoot, put, run } from "./test-helpers.mjs";

const SCRIPT = fileURLToPath(new URL("./check-provenance.mjs", import.meta.url));
const SKILL = "---\nname: foo\ndescription: Fixture.\n---\n\nFixture.\n";
const MIT =
  "MIT License\n\nCopyright (c) 2026 Fixture\n\nPermission is hereby granted, free of charge, to any person obtaining a copy.\n";

function seed(root) {
  put(root, "skills/foo/SKILL.md", SKILL);
  put(root, "CLAUDE.md", "# Contract\n");
}

test("repo-owned rows need no source pin, commit, or license file", () => {
  const root = makeRoot();
  try {
    seed(root);
    put(root, "provenance.json", JSON.stringify({ skills: [{ path: "skills/foo", classification: "repo-owned" }] }));
    const result = run(SCRIPT, root);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /foo\s+repo-owned\s+MIT/);
  } finally {
    drop(root);
  }
});

test("adapted rows still require a source and commit", () => {
  const root = makeRoot();
  try {
    seed(root);
    put(
      root,
      "provenance.json",
      JSON.stringify({
        skills: [{ path: "skills/foo", classification: "adapted", license: "MIT", licenseFile: "LICENSE.txt" }],
      }),
    );
    put(root, "skills/foo/LICENSE.txt", MIT);
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing source/);
    assert.match(result.stderr, /missing commit/);
  } finally {
    drop(root);
  }
});

test("third-party rows require notices and an upstream entry", () => {
  const root = makeRoot();
  try {
    seed(root);
    put(
      root,
      "provenance.json",
      JSON.stringify({
        skills: [
          {
            path: "skills/foo",
            classification: "vendored",
            source: "https://example.com/foo",
            commit: "abc123",
            license: "MIT",
            licenseFile: "LICENSE.txt",
          },
        ],
      }),
    );
    put(root, "skills/foo/LICENSE.txt", MIT);
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /THIRD-PARTY-NOTICES\.md is missing or empty/);
    assert.match(result.stderr, /UPSTREAM\.md is missing or empty/);
  } finally {
    drop(root);
  }
});

test("repo-owned rows reject a non-MIT license", () => {
  const root = makeRoot();
  try {
    seed(root);
    put(
      root,
      "provenance.json",
      JSON.stringify({ skills: [{ path: "skills/foo", classification: "repo-owned", license: "GPL-3.0" }] }),
    );
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /license must be MIT or Apache-2\.0/);
  } finally {
    drop(root);
  }
});
