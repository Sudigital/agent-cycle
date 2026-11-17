# Notion schema

Properties, enums, and payload notes for the tasks data source. The interface
is `docs/agents/tracker.md`; the lifecycle in `CLAUDE.md` wins where they
disagree.

## Transport

Every call goes through `skill://notion-cli` — the `ntn` CLI. The skill owns
install, auth, and payloads; this page is reference, never a script to run.
Set `NOTION_API_TOKEN`, and keep the data source id in an environment variable
such as `NOTION_TASKS_DATA_SOURCE`.

- Read a ticket with `ntn pages get <page-id>`; the page is the whole record.
- `page_size` caps at 100. When `.has_more` is true, re-query with
  `{"start_cursor":"<next_cursor>"}`.
- Query through `v1/data_sources/<id>/query`, not the legacy database path.

## Enums

**Status:** Not started | Planning | In progress | On Hold | Delayed | Code Review | Quality Assurance | Done | Archived

**Task type (multi_select):** Task | Bug | Feature | Improvement | Polish | Performance | Refactor | Frontend | Backend | Infrastructure | Docs | Spec | Map

**Priority:** Critical | High | Medium | Low | Neutral

**Effort level:** Small | Medium | Large

`Points` is mandatory on every task in the reference board; a consumer may drop
it, but must update this schema and its form defaults together. `Description` is
mandatory: one or two sentences naming the problem and the fix. A `Docs` page is
documentation, not work: `Status: Done`, no branch. A `Spec` or `Map` page keeps
its `<PREFIX>-<n>` id so branches and PRs still resolve.

## Properties

| Property       | Type           |
| -------------- | -------------- |
| `ID`           | `unique_id`    |
| `Task name`    | `title`        |
| `Status`       | `status`       |
| `Task type`    | `multi_select` |
| `Priority`     | `select`       |
| `Points`       | `number`       |
| `Due date`     | `date`         |
| `Description`  | `rich_text`    |
| `Effort level` | `select`       |
| `Assignee`     | `people`       |

## Work marker

The branch `<type>/<PREFIX>-<n>` is the marker; nothing is stamped into `.git`.
A resumed session reads the branch and keys the handoff as
`$TMPDIR/<ticket>-handoff.md`.

## Ticket body

`Description` is a property; the rest is page blocks. The interface and the
ceiling are `docs/agents/tracker.md`; this page maps them to Notion:

- `## Problem` — optional evidence paragraph.
- `## Acceptance criteria` — one bullet per observable condition.
- `## Verify` — the exact command or click path.
- `## Plan` — one `heading_2` titled `Plan`, then one `to_do` block per step.
- `## Decisions` — optional bullets for what did not earn an ADR.
- `## Close` — at merge: PR link, squash SHA, date, branch deleted, follow-ups.

Build ticks each step as it lands; Verify reads the remaining ones.

## Archive

PATCH `{"in_trash": true}`; `archived` is the legacy field and new writes use
`in_trash`. Never hard-delete a page.

## Spec and map pages

A **spec** page and a **map** page are ordinary pages in the same data source
with `Task type` carrying `Spec` or `Map`; both keep the `<PREFIX>-<n>` id.

- **Create** only from the approval gate, through the transport, with
  `Status: Planning` and the document body as the first blocks.
- **Read** `Task name` and `Status`, then the page body; the spec or map lives
  there, never in a file.
- **Close** with `Status: Done`; a throwaway page created to exercise a skill is
  archived instead.

Never infer a task number. A page is created only from the approval gate.
When resuming, detect the number from `<PREFIX>-\d+` in the branch and reuse
that page; never create a second one.

## Map operations

For a multi-session build, the **map** is a single page; its **child tickets**
are its to-do blocks or linked sub-pages.

- **Map**: one page carrying the Notes / Decisions-so-far / Fog body.
- **Child ticket**: a to-do block (or sub-page) on the map, with the ticket type
  recorded in the block text.
- **Blocking**: a `Blocked by: <PREFIX>-<n>, <PREFIX>-<n>` line at the top of
  the block. A ticket is unblocked when every listed blocker is `Done`.
- **Frontier query**: read the map's to-do blocks, drop any with an unchecked
  blocker or an `Assignee`; first in map order wins.
- **Claim**: set `Assignee` on the ticket.
- **Resolve**: append the answer as a block, check the to-do, then note the
  context pointer in the map's Decisions-so-far.
