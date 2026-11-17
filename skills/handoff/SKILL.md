---
name: handoff
description: Write or continue the one-per-ticket phase handoff that connects the fresh agent phases.
disable-model-invocation: true
---

# Handoff

The canonical writer of the boundary file. `CLAUDE.md` sets the contract; this skill is the exact procedure. Build, Verify, and Reset each read or write it once per boundary. If the next phase continues in the same context, write nothing — the transcript already carries the state.

The file is `$TMPDIR/<ticket>-handoff.md` (`/tmp` when `TMPDIR` is unset), `<ticket>` the `<PREFIX>-<n>` in the branch name. One file per ticket, overwritten at every boundary.

## Format

At most 40 lines, in order:

- **Phase** — the phase that just finished and the one that starts; mirror the active todo.
- **Ticket** — the tracker ticket URL.
- **Branch** — `git rev-parse --abbrev-ref HEAD`.
- **HEAD** — `git rev-parse HEAD`; the next phase compares this.
- **What landed** — one line per behavior, not per file.
- **Next step** — the first unticked plan item and its seam; the full plan stays on the ticket.
- **Next command** — one executable command the fresh session runs first, or `none`.
- **Failing test or repro** — the command and its current result, or `none`.
- **Files touched** — the paths the next phase will see in `git diff`.
- **Open risks** — what may break, and why it is not yet fixed.
- **Invariants** — the repo rules this phase must keep (subject scope, soft deletes, no `console.log`).
- **Suggested skills** — `tdd` for Build, `code-review-and-quality` for Verify, `handoff` for Reset.

Reference plans, ADRs, and issues by path or URL. Never restate them. Redact secrets, tokens, and personal data.

## Start

The next phase does this before anything else:

- Read the branch. A branch that names `<PREFIX>-<n>` makes `<ticket>` that id.
- Read `$TMPDIR/<ticket>-handoff.md` before anything else. Absent: start immediately, do not write a summary.
- Print the active todo stage, then compare the handoff's **HEAD** with `git rev-parse HEAD`. Equal means run **Next command**; read nothing beyond what it names. Different means the handoff is stale: read `git diff --stat <handoff-head>..HEAD` and only the files it names that change the next command.
- Never read the previous transcript, the full plan, or the whole ticket to reconstruct context. The handoff plus the next command is the whole context.

## Finish

Overwrite the same file for the next phase, after the phase's own checks pass. Never commit it: it lives in the temp directory, not the repo. When a PR is open and green, write **Next command** as `gh pr checks <n>`, record the review verdict, and stop for the user's explicit merge approval. Do not put `gh pr merge` in the handoff until the user approves; the merge gate is `CLAUDE.md` → **Pull requests**.
