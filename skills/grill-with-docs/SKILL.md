---
name: grill-with-docs
description: A relentless interview that sharpens a plan, writes the paper trail (ADRs and glossary), and creates the tracker ticket before Build.
disable-model-invocation: true
---

# Grill with docs

Stages 1 and 2 of the cycle: **Plan → Task** → Build → Verify → Reset. Run both stages here; never hand a Build anything that has not passed both.

## 0. Start

Read `GLOSSARY.md` and `docs/agents/skills.md`. Load the tracker adapter skill (for the worked example, `skill://notion-cli`) before the first interview round — it is the only tracker transport; `docs/agents/tracker.md` is the interface, and the adapter's schema page holds properties and enums. The branch is the task marker: if it names `<TICKET>` and `$TMPDIR/<ticket>-handoff.md` exists, read it per `skill://handoff` and continue from its next command instead of restarting the interview. Initialize the cycle todos: `Plan`, `Task`, `Build`, `Verify`, `Reset`, with one todo per interview round plus "docs + ADR approved" inside `Plan`.

## 1. Plan — interview

Read `skill://grilling` and run it: design tree, frontier rounds, one `ask` form per round, recommendation pre-selected. Nothing in this skill replaces that discipline.

The plan must name, by the end:

- the goal and the explicit non-goals;
- the files and workspaces that change;
- the contracts that move (types, routes, queries, components);
- the test that proves it works;
- the rollback, or why none is needed.

## 2. Write the paper trail

Write as the tree settles, not in a batch at the end.

- **Vocabulary** → `GLOSSARY.md`, the moment a term resolves. Vocabulary only: no implementation detail, no spec, no scratch notes.
- **Decisions** → `docs/adr/NNNN-kebab-title.md` only when all three hold: hard to reverse, surprising without context, a real trade-off. Next number, never reused. Sections: `Status`, `Date`, `Context`, `Decision`, `Alternatives`, `Consequences`. Add a row to `docs/adr/README.md`.
- **Everything else** stays in the plan and the ticket's `## Decisions` bullets. Most decisions do not earn an ADR, and a session with zero ADRs is a valid outcome.

## 3. Approval gate

One `ask` form carrying the five plan items and the ADR list (number + title + one-line decision). Recommendation: proceed. Nothing is written to disk before the user submits.

## 4. Task — one ticket, then branch

Only after approval, and only through a tracker adapter skill (the worked example is `skill://notion-cli`):

1. **Search.** Query the task database with a `Task name` filter. Show the candidates, including a Done predecessor when one exists.
2. **Ask.** One `ask` form: create a new task, or reuse `<TICKET>`. Never create or reuse without it.
3. **One ticket.** Create or reuse exactly one ticket; set its status to the adapter's planned value; write `Description` and the body sections in `docs/agents/tracker.md` — optional `## Problem`, `## Acceptance criteria` (one bullet per observable condition), `## Verify`, then `## Plan` with one checklist item per step. Each item names its artifact and its proof, and is what Build and Verify tick. Take properties from the adapter's schema page; titles are plain.
4. **Branch.** From a clean tree: `git switch -c <type>/<TICKET> origin/<base-branch>`. Never cut from the checked-out branch.
5. **Write the approved files.** ADRs and glossary land now, on the new branch.

If the tracker skill cannot run, stop and report: no branch, no `curl` fallback, and never a second page for the same work.

## 5. Finish and hand to Build

`skill://tdd` starts only when the task exists, the branch is cut, and the plan block lists the steps. If any of those is missing, the next action is to finish it — not to write code.

Then close the planning session: write the Build handoff exactly as `skill://handoff` specifies — ticket and URL, branch, `HEAD`, the plan's steps and seams, the exact first command. Build starts in a fresh context with that file and nothing else from this session.
