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

| Operation    | Input                                       | Result                                        |
| ------------ | ------------------------------------------- | --------------------------------------------- |
| `find`       | a title fragment, or a ticket id            | candidate tickets with id, title, status, url |
| `read`       | ticket id                                   | the ticket body: plan, decisions, comments    |
| `create`     | title, type, priority, effort, points, plan | the created ticket                            |
| `appendPlan` | ticket id, ordered steps                    | the ticket's `Plan` block                     |
| `tick`       | ticket id, step                             | the step marked complete                      |
| `comment`    | ticket id, Markdown                         | a comment appended to the ticket              |
| `setStatus`  | ticket id, canonical status                 | the new status                                |
| `claim`      | ticket id, assignee                         | the ticket assigned                           |
| `archive`    | ticket id                                   | the ticket archived, never deleted            |

`find` is the only read used before the approval gate. `create`, `appendPlan`,
and the first `setStatus` happen only after approval.

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

## Plan block

The ticket carries the plan: one section titled `Plan`, then one checklist item
per step. It is the ticket's plan, not a copy of the conversation. Build ticks
each step as it lands; Verify reads the remaining ones. A ticket with no plan
block is not ready for Build.

## Lifecycle

1. **Approval gate.** The user approves the plan. Nothing is written before it.
2. **Create exactly one ticket.** Search first; reuse a matching open ticket
   rather than duplicating. Set status to `planned`.
3. **Branch.** Cut `<type>/<PREFIX>-<n>` from `origin/<BASE_BRANCH>`.
4. **Build.** Move the ticket to `in-progress` when coding starts.
5. **Review.** Move it to `review` while the change is open.
6. **Done.** The owner of the merge marks it `done`; otherwise it stays in
   `review` with a comment naming the open action.

Never hard-delete a ticket. Archive it. Never create a second ticket for the
same work because the first was hard to find — search by id and title first.

## Publishing from a skill

When a skill says "publish to the tracker", call `create` through the adapter
and report the new `<PREFIX>-<n>` back. When it says "fetch the ticket", call
`read` and its plan. Findings and generated documents go to the ticket or the
pull request, never into the repository.
