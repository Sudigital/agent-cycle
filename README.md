# agent-cycle

A portable agent skill kit: interview → approval → ticket → TDD → review →
handoff, with tracker adapters and context-reset handoffs.

The kit is prose, not a framework. It ships thirteen skills, a workflow-only
contract, a tracker interface with a worked Notion adapter, and a copy-in
installer that records exactly what it copied. There is no runtime dependency,
no symlink, and no network access at install time.

## Quick start

```bash
# Into the omp layout
npx github:Sudigital/agent-cycle#v0.1.0 install --target .omp/skills

# Into the Claude Code layout
npx github:Sudigital/agent-cycle#v0.1.0 install --target .claude/skills

# Into both layouts under one project root
npx github:Sudigital/agent-cycle#v0.1.0 install --target . --both
```

Each install writes `.skills-lock.json` beside the copied skills with the
source, ref, commit, and a SHA-256 per file. Verify a copy at any time:

```bash
npx github:Sudigital/agent-cycle#v0.1.0 --check --target .omp/skills
```

`--check` recomputes the hashes and exits non-zero when a file is missing,
changed, or the lock names a different source. Re-run `install` to repair the
copy.

## What is in the box

| Path                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `skills/`                | The thirteen portable skills, one directory per skill.                             |
| `CLAUDE.md`              | The workflow contract: five stages, the approval gate, handoffs, token discipline. |
| `AGENTS.md`              | Relative symlink to `CLAUDE.md` for hosts that read that name.                     |
| `docs/agents/tracker.md` | The tracker interface every adapter implements.                                    |
| `docs/agents/skills.md`  | Which stage loads which skill, and when.                                           |
| `docs/agents/domain.md`  | Glossary and ADR conventions the skills consume.                                   |
| `adapters/notion/`       | Worked adapter: `ntn` mechanics, schema, and status mapping.                       |
| `provenance.json`        | One row per skill: path, classification, source, commit, license.                  |
| `UPSTREAM.md`            | The upstream pins behind the adapted and vendored skills.                          |

## The cycle

1. **Plan** — interview until the work is unambiguous; settle the seams.
2. **Task** — one tracker ticket, then a branch named after it.
3. **Build** — red, green, refactor, in the smallest workspace.
4. **Verify** — one review pass over the diff, findings labeled.
5. **Reset** — a 40-line handoff with the exact next command.

Build, Verify, and Reset each run in a fresh context. The only link between
them is one handoff per ticket; the tracker is the record, not the transport
between sessions.

## Skills

| Skill                           | Stage                                  |
| ------------------------------- | -------------------------------------- |
| `grill-with-docs`               | Plan + Task                            |
| `grilling`                      | Plan                                   |
| `notion-cli`                    | Plan + Task (worked tracker adapter)   |
| `tdd`                           | Build                                  |
| `code-review-and-quality`       | Verify                                 |
| `handoff`                       | Reset                                  |
| `diagnosing-bugs`               | On demand — debugging                  |
| `improve-codebase-architecture` | On demand — audits                     |
| `codebase-design`               | On demand — module vocabulary          |
| `security-audit`                | On demand — security review            |
| `pentest`                       | On demand — authorized dynamic testing |
| `shadcn`                        | On demand — frontend                   |
| `frontend-design`               | On demand — frontend                   |

## Adapting the contract

`CLAUDE.md` uses placeholders for the ticket prefix, tracker data source, base
branch, and test/lint/format commands. A consumer fills them in and adds its
product invariants in an overlay. The kit deliberately carries no product
rules: its skills stay useful in any repository.

For a tracker other than Notion, implement the operations in
`docs/agents/tracker.md` as one adapter skill and keep the six canonical status
roles. The Notion adapter is the reference, not a dependency.

## Provenance and licensing

`provenance.json` classifies every skill as `repo-owned`, `adapted`, or
`vendored`; `UPSTREAM.md` records the upstream commit for the latter two.
`THIRD-PARTY-NOTICES.md` lists source, commit, and license per skill. Our own
prose is MIT. Apache-2.0 components keep their `LICENSE.txt` and their notices.

## Contributing and security

Read `CONTRIBUTING.md` before changing a skill, and `SECURITY.md` before
reporting a vulnerability. This project follows the Contributor Covenant 2.1.

## AI credit

The v0.1.0 release was authored with assistance from **omp** running
**deepseek-flash**. Commits carry an `Assisted-by: omp (deepseek-flash)`
trailer when that is true, and no other assistant is credited.

## License

MIT © 2026 Sudigital. See `LICENSE` and `THIRD-PARTY-NOTICES.md`.
