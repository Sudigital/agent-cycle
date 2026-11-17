# Agent skills

Reference for `CLAUDE.md`. The contract wins where this file and the contract
disagree.

`skills/` holds thirteen portable skills. `provenance.json` classifies each as
`repo-owned`, `adapted`, or `vendored`; `UPSTREAM.md` records the source pin for
the adapted and vendored ones.

| Skill                           | Stage                    | Context         | Written by                                                                   |
| ------------------------------- | ------------------------ | --------------- | ---------------------------------------------------------------------------- |
| `grill-with-docs`               | Plan + Task              | one session     | user (`/skill:grill-with-docs`)                                              |
| `grilling`                      | Plan                     | same session    | agent, called from `grill-with-docs`                                         |
| `notion-cli`                    | Plan + Task              | same session    | agent loads it by default from `grill-with-docs`; one worked tracker adapter |
| `tdd`                           | Build                    | **fresh**       | agent reads `skill://tdd`                                                    |
| `code-review-and-quality`       | Verify                   | **fresh**       | agent reads `skill://code-review-and-quality`                                |
| `handoff`                       | Reset                    | **fresh**       | user (`/skill:handoff`); canonical boundary writer                           |
| `diagnosing-bugs`               | On demand — debugging    | current session | user or agent reads it                                                       |
| `improve-codebase-architecture` | On demand — audits       | current session | user (`/skill:improve-codebase-architecture`)                                |
| `codebase-design`               | On demand — vocabulary   | current session | agent reads `skill://codebase-design`                                        |
| `security-audit`                | On demand — security     | current session | agent reads `skill://security-audit` (guidance); user requests a full audit  |
| `pentest`                       | On demand — dynamic test | current session | user, on an authorized local or staging target                               |
| `shadcn`                        | On demand — frontend     | current session | agent, only when a frontend workspace changes                                |
| `frontend-design`               | On demand — frontend     | current session | agent, only when a frontend workspace changes                                |

**Context resets at phase boundaries.** Plan and Task run in one session;
Build, Verify, and Reset each start fresh. A fresh phase reads
`$TMPDIR/<ticket>-handoff.md`, compares its `HEAD` with `git rev-parse HEAD`,
and overwrites the file when it ends; `skill://handoff` owns the format. A phase
that continues the same context writes nothing.

**The tracker is a skill, not a script.** `docs/agents/tracker.md` is the
interface; an adapter skill is the only transport. `grill-with-docs` loads the
adapter before round one and every board call in the cycle goes through it. The
worked Notion adapter is `adapters/notion/`, with the agent skill at
`skills/notion-cli/`.

**Frontend skills are scoped.** `shadcn` and `frontend-design` load only when
the task changes a frontend workspace, never for backend-only or docs work.

## Invocation

- `grill-with-docs`, `handoff`, and `improve-codebase-architecture` are
  `disable-model-invocation`: the user types them.
- `grill-with-docs` reads `skill://grilling` and runs the interview; it then
  writes the paper trail, opens the Task stage, and closes the session with the
  Build handoff.
- `tdd` and `code-review-and-quality` are read by the agent to drive Build and
  Verify; each states its start (read the handoff, check `HEAD`) and finish
  (overwrite it for the next phase).
- `handoff` is the canonical writer of the boundary file: path, 40-line cap,
  fields, `HEAD` guard, and the rule never to commit it.
- `diagnosing-bugs` runs on demand for hard bugs; it requires a failing
  reproduction command before any code edit.
- `improve-codebase-architecture` reads `skill://codebase-design` and
  `skill://grilling`; scope each audit to one workspace and suppress the HTML
  report unless the user asks for it.
- `security-audit` is model-invocable for security questions and focused
  reviews; full audit mode runs only on an explicit audit or pen-test request
  and writes artifacts outside the repo.
- `pentest` runs the Strix CLI headless against an authorized local or staging
  target only; it never replaces `security-audit`'s source-first review.
- Interviews are always interactive: one form per round, one field per
  question, recommendation pre-selected.

## Review policy

`docs/agents/review.md` carries the CI gate, the human risk lane, and the
generated-artefact rules that `code-review-and-quality` reads.

## Editing

Change the skill's `SKILL.md` in place on the ticket that needs the change.
There is no override layer and no re-vendor step: a repo rule lives next to the
text it corrects, and `CLAUDE.md` holds the cross-cutting contract. `skills/` is
excluded from the formatter so a pass never rewraps the prose.

## Layout

One level only: `skills/<name>/SKILL.md`. Companion files (`mocking.md`,
`tests.md`, `rules/`) sit inside the same skill directory. A skill nested deeper
is invisible to the installer and to most hosts.
