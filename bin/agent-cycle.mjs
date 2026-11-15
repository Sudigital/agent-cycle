#!/usr/bin/env node
// Copy-in installer for the agent-cycle skill kit.

import { run } from "../lib/install.mjs";

const USAGE = `agent-cycle

Usage:
  agent-cycle install --target <dir> [--both] [--with-docs]
  agent-cycle --check --target <dir> [--both] [--with-docs] [--strict]
  agent-cycle help

Options:
  -t, --target <dir>  skills directory (or project root with --both)
      --both          install into <root>/.omp/skills and <root>/.claude/skills
      --with-docs     also vendor CLAUDE.md, docs/agents, and adapters into a
                      fresh project root (requires --both, refuses to overwrite)
      --check         verify the copy against the lock; writes nothing
      --strict        with --check, fail on any file the lock does not name
`;

function parseArgs(argv) {
  const args = {
    command: "install",
    target: ".",
    both: false,
    check: false,
    withDocs: false,
    strict: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--both") args.both = true;
    else if (arg === "--check") args.check = true;
    else if (arg === "--with-docs") args.withDocs = true;
    else if (arg === "--strict") args.strict = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--target" || arg === "-t") {
      const value = argv[++i];
      if (!value) throw new Error("--target needs a directory");
      args.target = value;
    } else if (arg.startsWith("--target=")) {
      args.target = arg.slice("--target=".length);
    } else if (arg === "install" || arg === "check") {
      args.command = arg;
      args.check = arg === "check";
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return args;
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) console.log(USAGE);
  else run(args);
} catch (error) {
  console.error(`error: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
}
