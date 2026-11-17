# Run the cycle from one prompt

Copy the block below into a fresh agent session, replace every `<...>`, and
send it. The agent starts with the Plan interview, pauses at the two approval
gates, and otherwise carries the work through Task, Build, Verify, and Reset.

```text
Read AGENTS.md or CLAUDE.md first; whichever exists is the contract and wins. Then read
GLOSSARY.md if it exists, plus docs/agents/tracker.md, docs/agents/skills.md,
docs/agents/domain.md, and docs/agents/review.md. If your host does not resolve
skill://, read the matching skills/<name>/SKILL.md instead.

Run the five-stage cycle A to Z: Plan -> Task -> Build -> Verify -> Reset. Do not
skip a stage and do not run two at once. Print the five-stage todo list at
session start and after every status change, with the active stage visible in
every reply. A phase starts only after the previous one is marked done.

Inputs:
- Goal: <what to change and why>
- Repo: <path or URL>
- Tracker: <data source>; ticket prefix: <PREFIX>; base branch: <BASE>
- Test: <command>; typecheck: <command>; lint: <command>; format: <command>
- Non-goals: <what is out of scope>

If a handoff exists for this ticket, read it first and compare its HEAD with
`git rev-parse HEAD`; do not replay the previous transcript. If the tracker is
unavailable or the working tree is unclean, stop and report the exact problem;
never invent a ticket, a branch, or a passing check.

## Context budget
Read the handoff first; read only what the next command names. Use
`git diff --stat` before a full diff, and range reads before whole files. Cap
tool output to failing lines and scoped tests; no full suite or watch mode.
Batch independent reads, searches, and checks into one turn. Do not restate the
plan, diff, or previous reply. If a stage grows past roughly 200k input tokens,
write the handoff and continue in a fresh session.

## Plan
Use skill://grill-with-docs. Ask one form per round, one field per question, with
the recommendation pre-selected. Do not write code, a ticket, or a branch until I
approve the plan. The plan must name the goal, non-goals, files and workspaces,
the contracts that move, the test that proves it, and the rollback. Settle the
seams now; do not re-negotiate them during Build.

## Task
After I approve the plan: search the tracker, show the candidates, ask one
create-vs-reuse form, then create exactly one ticket, set it to the adapter's
planned state, write the ticket body (Description, acceptance criteria, Plan,
Verify), and cut `<type>/<PREFIX>-<n>` from `origin/<BASE>` on a clean tree.

## Build
Use skill://tdd. Read the handoff first. Write the failing test first, one
acceptance criterion per slice, then the smallest change that passes it. Tick a
plan step only where its proof exists. Run the narrowest test, typecheck, lint,
and format; do not run the full suite unless I ask.

## Verify
Use skill://code-review-and-quality in a fresh context. Review `git diff` only:
start with `git diff --stat`, read only changed files and ranges, and do not
re-run checks to confirm a finding. Label findings Required/Recommended/Optional,
and end with a verdict: Approve or Request changes. Post the findings to the PR
when one exists, otherwise to the handoff. Do not merge.

## Reset
Use skill://handoff. Write the 40-line handoff with the active todo, HEAD, what
landed, the next unticked step and its seam, one executable next command, files
touched, open risks, and invariants. Never commit the handoff. At a fresh-context
boundary, write it and start the next stage; if the host cannot start a fresh
context, continue here and skip the mid-phase write.

## Completion
Continue automatically from each stage to the next. Do not stop at the plan, the
ticket, the branch, or green tests. Stop only when the change is merged, or when
you are blocked and have reported the exact missing input.

Merge only when all three hold: the review says Approve with no Required
findings, every check is green, and I explicitly say "merge". Use
`gh pr merge <n> --squash --delete-branch`. Never self-merge.

One ticket, one commit, one PR. Commit `type(<PREFIX>-<n>): description`. The PR
body carries `## Risk`, `## Standards`, and `## Spec`. Begin with the Plan
interview now.
```
