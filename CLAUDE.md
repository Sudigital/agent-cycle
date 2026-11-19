# Agent instructions

> **Portable workflow contract.** Five-stage cycle: Plan → Task → Build →
> Verify → Reset.
>
> **This file is the contract.** `AGENTS.md` is a relative symlink to it; edit
> only here. Never write into the symlink and never replace it with a copy.
> A consumer may replace the placeholder values below with its own overlay,
> add product invariants, and keep this file's cycle intact.

## Configuration

Set these once per consumer. The skills read them from this file and the
environment; no skill hard-codes a board id, a ticket prefix, or a command.

| Placeholder              | Meaning                                                                  | Example                     |
| ------------------------ | ------------------------------------------------------------------------ | --------------------------- |
| `<TICKET_PREFIX>`        | Human-readable ticket prefix                                             | `AC`                        |
| `<TRACKER_DATA_SOURCE>`  | Board or data-source identifier, preferably an environment variable name | `NOTION_TASKS_DATA_SOURCE`  |
| `<BASE_BRANCH>`          | Branch every task branch is cut from                                     | `main`                      |
| `<TEST_COMMAND>`         | Narrow test command for one file                                         | `npm test -- <file>`        |
| `<TYPECHECK_COMMAND>`    | Typecheck command                                                        | `tsc --noEmit`              |
| `<LINT_COMMAND>`         | Scoped lint command                                                      | `npx oxlint <paths>`        |
| `<FORMAT_COMMAND>`       | Format command                                                           | `npx oxfmt --write <paths>` |
| `<FORMAT_CHECK_COMMAND>` | Non-mutating format check                                                | `npx oxfmt --check <paths>` |

## Read first

- **A handoff wins.** When `$TMPDIR/<ticket>-handoff.md` exists, read it first
  and treat it as the whole context for this phase. Read the glossary, ticket,
  ADRs, or source only when the next command or next step needs them.
- Read the project glossary (`GLOSSARY.md`) before exploring source; if it does
  not exist, proceed without it.
- Never read build output, dependency trees, coverage, or lockfiles. They are
  generated state.
- Search the codebase only when the glossary and the diff leave a real gap.

## The 5-stage cycle

One request, five stages, in this order. Do not skip a stage; do not run two at
once.

**Todos are the shared cursor.** Initialize `Plan`, `Task`, `Build`, `Verify`,
`Reset` at session start, with one todo per interview round plus "docs + ADR
approved" inside `Plan`. Print the list at session start and after every status
change, with the active stage first. Do not reprint the full list every turn;
keep a one-line stage marker (`Plan → Task → **Build** → Verify → Reset`) in the
reply so both sides can see where the work is. A phase starts only after the
previous one is marked done.

### Optional pre-coding (before stage 1)

Neither step is a stage and neither replaces the Plan interview. Run one only
when the request benefits, then start the cycle:

- `/skill:product-brainstorming` — honest product feedback and ideation while
  the problem is still open.
- `/skill:llm-wiki` — save research and product decisions into `docs/wiki/`;
  read `docs/wiki/index.md` first so later stages cite one source of truth.

### 1. Plan — `skill://grill-with-docs`

Interview the request until the work is unambiguous. The plan must name:

- the goal and the explicit non-goals;
- the files and workspaces that change;
- the contracts that move (types, routes, queries, components);
- the test that proves it works;
- the rollback, or the reason none is needed.

Every interview round is one interactive form: one field per question, the
recommendation pre-selected, so "yes" accepts it. A host without a form tool
falls back to numbered questions with a recommendation. Prose-only questions
are a bug. Ask the whole frontier of settled-prerequisite questions per round,
then wait.

No code before the plan is agreed. If the request already carries all five,
say so in one line and move on.

### 2. Task — one ticket, then a branch

No Build before the ticket exists; no branch before it either. The tracker
adapter skill is the only transport: search the board, show the candidates, one
form for create-vs-reuse, then create exactly one ticket, set it to the
adapter's planned state, write its body (see **Tracker**), and cut
`<type>/<TICKET_PREFIX>-<n>` from `origin/<BASE_BRANCH>` on a clean tree.
`docs/agents/tracker.md` is the interface, never a script to run.

If the adapter cannot run, stop and report: never `curl`, never fabricate a
ticket, never create the branch. Write the approved ADRs and glossary now, then
close this session with the Build handoff.

### 3. Build — `skill://tdd` (fresh context)

Red, green, refactor, in the smallest workspace that owns the change.

- Write the failing test first. No test, no feature.
- Run the one test file, `<TYPECHECK_COMMAND>`, and scoped `<LINT_COMMAND>` /
  `<FORMAT_COMMAND>`; the full suite and the release build belong to the user.
- Watch it fail for the right reason, make the smallest change that passes, then
  refactor with the test green.
- The seams are the ticket's plan; do not re-negotiate them mid-run.
- Do not mock the unit under test.
- Never broaden the ticket: no drive-by refactors, no new abstractions "while
  here".

### 4. Verify — `skill://code-review-and-quality` (fresh context)

One pass over `git diff` only. Do not review the whole repository, and do not
re-run the review to confirm findings.

Check, in order: correctness, readability, architecture, security,
performance. Label each finding Required, Recommended, or Optional. Report the
findings; do not silently rewrite the change. Post them to the pull request when
one exists, otherwise to the handoff document. End with a verdict: **Approve**
or **Request changes**. The verdict is not merge authorization; the merge gate
is in **Pull requests**.

### 5. Reset — `skill://handoff` (fresh context)

Capture the state before context runs out: the active todo, what shipped, what
is open, the exact next command. Then stop. A handoff is a deliverable, not a
failure.

## Maintenance lane

A mechanical, reversible change may land directly on `<BASE_BRANCH>` without a
ticket, branch, or pull request when all of these hold:

- it touches only documentation, checks, CI, version pins, ignore rules, or
  release housekeeping;
- no shipped skill, installer behavior, lock format, adapter interface, stage,
  or gate moves;
- the full check suite is green locally and in CI;
- the commit names the change and its proof.

Anything that changes `skills/`, `lib/`, `bin/`, `adapters/`, or the cycle's
stages and gates takes the full five-stage path. The lane is housekeeping, not a
feature shortcut; when in doubt, run the cycle.

The lane does not weaken the merge gate: a ticket pull request still needs the
review verdict, green checks, and the user's explicit merge approval. On GitHub
the base branch is protected; external changes arrive by pull request, and the
lane uses the repository-admin bypass of the ruleset.

## Context and handoffs

Plan and Task share one session. Build, Verify, and Reset each start in a fresh
session; the only link between them is one handoff per ticket. The tracker is
not part of that chain: the adapter skill is the only transport, and
`docs/agents/tracker.md` is the interface.

1. **Boundaries.** [interview → approval → ticket/branch] is one session.
   Build, Verify, and Reset each start fresh; only those three boundaries write
   a handoff.
2. **File.** `$TMPDIR/<ticket>-handoff.md` (`/tmp` when `TMPDIR` is unset),
   `<ticket>` the `<TICKET_PREFIX>-<n>` in the branch name. One file per
   ticket, overwritten at every boundary — never one per step.
3. **Format.** At most 40 lines, one fact per line: phase and the active todo;
   ticket URL; branch; HEAD (`git rev-parse HEAD`); what landed; the next
   unticked plan step and its seam; one executable next command (or `none`);
   failing test or repro; files touched; open risks; invariants to keep;
   suggested skills. Link the plan, ADRs, and ticket; never copy them. A full
   plan or diff in the handoff is a bug.
4. **Start.** The branch is the task marker. Read the branch and the handoff
   before anything else. Compare the handoff's HEAD with `git rev-parse HEAD`:
   equal means run the next command; different means read
   `git diff --stat <handoff-head>..HEAD` and open only the files it names that
   change the next command. Do not read the previous transcript, re-derive the
   plan from the ticket, or re-run checks to reconstruct state.
5. **Staleness.** A HEAD mismatch makes the handoff stale. Start from the stat
   diff; read a full diff only for the files it names.
6. **No mid-phase write.** If the next phase continues in the same context, skip
   the write; it duplicates context and costs tokens.
7. **Never commit the handoff.** Generated docs stay out of the repository.
8. **Token discipline.** Read the handoff, then only what the next command
   names. Prefer `git diff --stat` before a full diff, one test file, scoped
   lint/format, and range reads before whole files. Never re-read content
   already in context, never re-run a check to confirm it, and never paste a
   plan, diff, or prior reply into the next session.
   - **Tool output.** Read failing lines and ranges, not full logs. Never dump
     a full suite, build output, or a long artefact into the transcript.
   - **Round trips.** Batch independent reads, searches, and checks into one
     turn.
   - **Output.** Do not restate the plan, diff, or previous reply. One verdict,
     one handoff, one final answer.
   - **Soft budget.** If a stage grows past roughly 200k input tokens, stop at
     the next safe point, write the handoff, and continue in a fresh session.

## Tracker

- The ticket is the whole record: plan, decisions, ADR links. Later skills
  append comments and move status — planned at creation, in-progress when Build
  starts, review while the change is open, done when it merges.
- **Body.** `Description` is one or two sentences: the problem and the fix.
  The body is `## Problem` (optional), `## Acceptance criteria` (one bullet per
  observable condition; mandatory on feature and bug tickets), `## Plan` (one
  checklist item per step, naming its artifact and proof), `## Verify` (the
  exact command or click path), optional `## Decisions`, and `## Close` at
  merge. Keep it under about 20 blocks / 4 KB; never `Phase N —` sections,
  `Decision record —` chains, `Fix record`, `Execution log`, or `Planning log`.
  Titles are plain: the commit and PR carry the type.
- **`done` gate.** `done` requires every plan step ticked and `## Close`
  naming the merged PR. Tick a step in the session where its proof passes; an
  unchecked box on a done ticket is a defect.
- `<BASE_BRANCH>` is the integration branch and the base of every task change.
- Commit `type(<TICKET_PREFIX>-<n>): description`; one ticket, one commit.
- Run the whole tracker through the adapter skill — page reads, creation,
  comments, and status moves — never a hand-rolled API call. Interface
  `docs/agents/tracker.md`; worked adapter `adapters/notion/`.

## Pull requests

- Base `<BASE_BRANCH>`; title `type(<TICKET_PREFIX>-<n>): description`.
- The body carries `## Risk`, `## Standards`, and `## Spec`.
- The CI gate and the human risk lane are in `docs/agents/review.md`; a
  risk-lane change needs the review it names, not just green checks.
- **Merge gate.** Merge only when all three hold: `code-review-and-quality`
  returns **Approve** with no Required findings, every check is green, and the
  user explicitly approves the merge in this session. "Green" and "LGTM" are
  not approval; a plan approval is not a merge approval. The agent never
  self-merges and never runs the merge command without that explicit "merge".
- When the gate holds, run
  `gh pr merge <n> --squash --delete-branch`. Never `--merge` or `--rebase` for
  ticket pull requests unless the consumer's overlay explicitly allows it.
- If the user has not approved, post the review verdict and the exact merge
  command, then stop.

## Commands

- **Isolate to the active workspace.** Run the package or workspace script, not
  a root-wide task, when one workspace is in scope.
- **Tests run single-run.** Never watch mode.
- **Typecheck:** `<TYPECHECK_COMMAND>`, or the workspace's `typecheck` script.
  Report the exact command you ran.
- A dev server is the user's: hand off the command and the click-path, never
  start it.
- Never declare a change verified from a build artifact or a cached result.
- Run the narrowest check that covers the change: one test file, scoped lint and
  format. A root-wide check dumps context you then pay for on every turn.
- A change that touches only docs or config skips red/green:
  `<FORMAT_CHECK_COMMAND>` and scoped lint on the touched paths are its test.

## Decisions and ADRs

A decision becomes an ADR only when all three hold: hard to reverse, surprising
without context, and the result of a real trade-off. Write
`docs/adr/NNNN-kebab-title.md` (next number, never reused) with `Status`,
`Date`, `Context`, `Decision`, `Alternatives`, `Consequences`, and add a row to
`docs/adr/README.md`. A reversed decision is marked `Superseded by NNNN`, never
deleted.

Everything else decided stays in the plan and the ticket's `## Decisions`
bullets.
`GLOSSARY.md` is vocabulary only: no implementation decisions, no spec, no
notes. Product invariants belong in the consumer's overlay, not in this
portable contract.
