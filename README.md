# agent-cycle

A portable agent skill kit: interview → approval → ticket → TDD → review →
handoff, with tracker adapters and context-reset handoffs.

The kit is prose, not a framework. It ships thirteen skills, a workflow-only
contract, a tracker interface with a worked Notion adapter, and a copy-in
installer that records exactly what it copied. There are no runtime
dependencies, the installer creates no symlinks, and it makes no network access
at install time. It requires Node 20 or newer.

## Quick start

A fresh project installs the skills and the contract they reference:

```bash
npx github:Sudigital/agent-cycle#v0.1.1 install --target . --both --with-docs
```

That writes `.omp/skills/` and `.claude/skills/`, then copies `CLAUDE.md`,
`docs/agents/`, and `adapters/` into the project root. It refuses to overwrite
an existing `CLAUDE.md`, `docs/agents/`, or `adapters/`; merge those manually.

Skills only, into an existing project:

```bash
npx github:Sudigital/agent-cycle#v0.1.1 install --target .omp/skills
npx github:Sudigital/agent-cycle#v0.1.1 install --target .claude/skills
```

The skills reference `docs/agents/` and `adapters/`; copy those from a checkout
or use `--with-docs` on a fresh project. The installer does not create
`AGENTS.md`; add the relative symlink if your host reads that name.

Each skills install writes `.skills-lock.json`; `--with-docs` also writes
`.agent-cycle-contract.json`. Both record the source, ref, the commit when
installed from a git checkout, and a SHA-256 per file. Verify at any time:

```bash
npx github:Sudigital/agent-cycle#v0.1.1 --check --target .omp/skills
npx github:Sudigital/agent-cycle#v0.1.1 --check --target . --both --with-docs
```

`--check` recomputes the hashes and exits non-zero when a file is missing,
changed, or the lock names a different source or tag. It refuses symlinked
targets and paths. `--strict` also fails on files the lock does not name.
Re-run `install` to repair the copy. The npx tarball has no git metadata, so its
lock records the tag and hashes without a commit.

## What is in the box

| Path                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `skills/`                | The thirteen portable skills, one directory per skill.                             |
| `CLAUDE.md`              | The workflow contract: five stages, the approval gate, handoffs, token discipline. |
| `AGENTS.md`              | Relative symlink to `CLAUDE.md` for hosts that read that name.                     |
| `docs/agents/tracker.md` | The tracker interface every adapter implements.                                    |
| `docs/agents/skills.md`  | Which stage loads which skill, and when.                                           |
| `docs/agents/domain.md`  | Glossary and ADR conventions the skills consume.                                   |
| `docs/agents/review.md`  | CI gate, human risk lane, and generated-artefact review policy.                    |
| `adapters/notion/`       | Worked adapter: `ntn` mechanics, schema, and status mapping.                       |
| `provenance.json`        | One row per skill: path, classification, source, commit, license, license file.    |
| `UPSTREAM.md`            | The upstream pins behind the adapted and vendored skills.                          |

Every adapted or vendored skill carries its upstream license text as
`LICENSE.txt` in its skill directory.

## The cycle

1. **Plan** — interview until the work is unambiguous; settle the seams.
2. **Task** — one tracker ticket, then a branch named after it.
3. **Build** — red, green, refactor, in the smallest workspace.
4. **Verify** — one review pass over the diff, findings labeled; the risk lane
   in `docs/agents/review.md` decides who must look.
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
`THIRD-PARTY-NOTICES.md` lists source, commit, license, and license file per
skill. Our own prose is MIT. Every adapted or vendored skill keeps its upstream
license text, including the MIT copyright and permission notices and the full
Apache-2.0 text.

## Contributing and security

Read `CONTRIBUTING.md` before changing a skill, and `SECURITY.md` before
reporting a vulnerability. This project follows the Contributor Covenant 2.1.

## AI credit

The v0.1.1 release was authored with assistance from **omp** running
**deepseek-flash**. Commits carry an `Assisted-by: omp (deepseek-flash)`
trailer when that is true, and no other assistant is credited.

## License

MIT © 2026 Sudigital. See `LICENSE` and `THIRD-PARTY-NOTICES.md`.
