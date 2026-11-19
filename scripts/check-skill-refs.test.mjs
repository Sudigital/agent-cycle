import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { drop, makeRoot, put, run } from "./test-helpers.mjs";

const SCRIPT = fileURLToPath(new URL("./check-skill-refs.mjs", import.meta.url));
const SKILL = "---\nname: foo\ndescription: Fixture.\n---\n";

function seed(root, { reference = "/skill:foo", table = ["foo"], count = "one" } = {}) {
  put(root, "skills/foo/SKILL.md", SKILL);
  put(root, "CLAUDE.md", `# Contract\n\nUse ${reference}.\n`);
  put(root, "README.md", `# Readme\n\nIt ships ${count} skill.\n`);
  put(
    root,
    "docs/agents/skills.md",
    `# Skills\n\n| Skill | Stage |\n| --- | --- |\n${table.map((name) => `| \`${name}\` | Plan |`).join("\n")}\n\nThe kit holds ${count} portable skill.\n`,
  );
}

test("resolves references and keeps the table and count honest", () => {
  const root = makeRoot();
  try {
    seed(root);
    const result = run(SCRIPT, root);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /skill reference check passed \(1 skills\)/);
  } finally {
    drop(root);
  }
});

test("rejects a reference to a missing skill", () => {
  const root = makeRoot();
  try {
    seed(root, { reference: "/skill:bar" });
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /CLAUDE\.md references missing skill bar/);
  } finally {
    drop(root);
  }
});

test("rejects a table row for a missing skill", () => {
  const root = makeRoot();
  try {
    seed(root, { table: ["foo", "bar"] });
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /docs\/agents\/skills\.md lists missing skill bar/);
  } finally {
    drop(root);
  }
});

test("rejects a table that omits a skill", () => {
  const root = makeRoot();
  try {
    seed(root, { table: [] });
    put(
      root,
      "docs/agents/skills.md",
      "# Skills\n\n| Skill | Stage |\n| --- | --- |\n\nThe kit holds one portable skill.\n",
    );
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /docs\/agents\/skills\.md omits foo/);
  } finally {
    drop(root);
  }
});

test("rejects a stated count that does not match skills/", () => {
  const root = makeRoot();
  try {
    seed(root, { count: "two" });
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /README\.md says two skills, but skills\/ holds 1/);
    assert.match(result.stderr, /docs\/agents\/skills\.md says two skills, but skills\/ holds 1/);
  } finally {
    drop(root);
  }
});

test("rejects a frontmatter name that does not match its directory", () => {
  const root = makeRoot();
  try {
    seed(root);
    put(root, "skills/foo/SKILL.md", "---\nname: bar\ndescription: Fixture.\n---\n");
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /skills\/foo\/SKILL\.md is named bar/);
  } finally {
    drop(root);
  }
});

test("rejects a tracked .omp/skills copy", () => {
  const root = makeRoot();
  try {
    seed(root);
    put(root, ".omp/skills/foo/SKILL.md", "---\nname: foo\ndescription: Fixture.\n---\n");
    execFileSync("git", ["init", "-q", root]);
    execFileSync("git", ["-C", root, "add", ".omp/skills"]);
    const result = run(SCRIPT, root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /\.omp\/skills is tracked/);
  } finally {
    drop(root);
  }
});
