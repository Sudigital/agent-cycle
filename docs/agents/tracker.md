# Tracker interface

Work is tracked in one ticket per unit of work. This page is the interface the
skills code against; an adapter supplies the concrete transport. The worked
example is [`adapters/notion/`](../../adapters/notion/SKILL.md). The
implementation is always an agent skill, never a shell script: there is no
`curl` fallback and no second client.

## Configuration

The consumer sets these in `CLAUDE.md` or its environment:

| Name                    | Meaning                              | Example                                          |
| ----------------------- | ------------------------------------ | ------------------------------------------------ |
| `<TICKET_PREFIX>`       | Human-readable ticket prefix         | `AC`                                             |
| `<TRACKER_DATA_SOURCE>` | Board or data-source identifier      | an environment variable name, never a literal id |
| `<BASE_BRANCH>`         | Branch every task branch is cut from | `main` or `dev`                                  |

## Work marker

A ticket is `<PREFIX>-<n>`. The branch is the marker and carries it:
`<type>/<PREFIX>-<n>`, cut from `origin/<BASE_BRANCH>`. There is no stamp file.
A resumed session reads the branch and keys the handoff as
`$TMPDIR/<ticket>-handoff.md`.

## Operations

Every adapter implements these. Names are stable; payload shapes are the
adapter's business.

| Operation    | Input                                              | Result                                        |
| ------------ | -------------------------------------------------- | --------------------------------------------- |
| `find`       | a title fragment, or a ticket id                   | candidate tickets with id, title, status, url |
| `read`       | ticket id                                          | the ticket body: plan, decisions, comments    |
| `create`     | title, type, priority, effort, points, description | the created ticket                            |
| `appendBody` | ticket id, Markdown                                | the section appended to the ticket body       |
| `appendPlan` | ticket id, ordered steps                           | the ticket's `Plan` block                     |
| `tick`       | ticket id, step                                    | the step marked complete                      |
| `comment`    | ticket id, Markdown                                | a comment appended to the ticket              |
| `setStatus`  | ticket id, canonical status                        | the new status                                |
| `claim`      | ticket id, assignee                                | the ticket assigned                           |
| `archive`    | ticket id                                          | the ticket archived, never deleted            |

`find` is the only read used before the approval gate. `create`, `appendBody`,
`appendPlan`, and the first `setStatus` happen only after approval.

## Canonical statuses

The adapter maps these six roles; the label it stores is its own.

| Role          | Used when                                                |
| ------------- | -------------------------------------------------------- |
| `backlog`     | not started or needs triage                              |
| `planned`     | approved, fully specified, ready for Build               |
| `in-progress` | Build has started                                        |
| `review`      | a change is open for review                              |
| `done`        | merged or otherwise complete                             |
| `blocked`     | waiting on a dependency, a decision, or more information |

Adapters may expose extra states (`quality-assurance`, `on-hold`, `archived`).
The cycle only depends on the six roles above. The worked Notion mapping is
[`adapters/notion/triage.md`](../../adapters/notion/triage.md).

## Ticket body

`Description` is one or two sentences: the problem and the fix, never empty.
The page body carries, in order:

- `## Problem` — optional; one paragraph of evidence.
- `## Acceptance criteria` — one bullet per observable condition. Mandatory on
  feature and bug tickets; `N/A` when nothing observable changes.
- `## Plan` — one checklist item per step, each naming its artifact and its
  proof.
- `## Verify` — the exact command or click path.
- `## Decisions` — optional bullets for what did not earn an ADR.
- `## Close` — at merge: PR link, squash SHA, date, branch deleted, and
  follow-ups.

Keep it under about 20 blocks / 4 KB. Never add `Phase N —` sections,
`Decision record —` chains, `Fix record`, `Execution log`, `Planning log`, or a
copy of the PR prose. Titles are plain: no `type(scope):` prefix; the commit
and PR carry the type.

## Plan block

The ticket carries the plan: one section titled `Plan`, then one checklist item
per step. It is the ticket's plan, not a copy of the conversation. Build ticks
each step as it lands; Verify reads the remaining ones. A ticket with no `Plan`
block is not ready for Build.

## Lifecycle

1. **Approval gate.** The user approves the plan. Nothing is written before it.
2. **Create exactly one ticket.** Search first; reuse a matching open ticket
   rather than duplicating. Set status to `planned`, write `Description`, and
   write the body sections above.
3. **Branch.** Cut `<type>/<PREFIX>-<n>` from `origin/<BASE_BRANCH>`.
4. **Build.** Move the ticket to `in-progress` when coding starts.
5. **Review.** Move it to `review` while the change is open.
6. **Done.** The owner of the merge applies the **Done gate**; otherwise it
   stays in `review` with a comment naming the open step.

Never hard-delete a ticket. Archive it. Never create a second ticket for the
same work because the first was hard to find — search by id and title first.

## Done gate

`done` requires every plan step ticked and `## Close` naming the merged PR.
Tick a step in the session where its proof passes, not in a batch at the end; a
fix found in review appends to the same step list. An unchecked box on a `done`
ticket is a defect: move it back to `review` with a comment naming the open
step. `done` follows a merge the user approved; the tracker never authorizes a
merge.

## Recovery

- The branch is gone: find the ticket by title and id before creating one.
- The page was archived: restore it (`in_trash: false`) instead of creating a
  second page.
- The plan is wrong: edit the `Plan` block and comment why; never open a second
  ticket.

## Publishing from a skill

When a skill says "publish to the tracker", call `create` through the adapter
and report the new `<PREFIX>-<n>` back. When it says "fetch the ticket", call
`read` and its plan. Findings and generated documents go to the ticket or the
pull request, never into the repository.
