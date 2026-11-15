---
name: notion-adapter
description: Worked tracker adapter for Notion. Implements docs/agents/tracker.md with the `ntn` CLI; schema in schema.md, status mapping in triage.md.
---

# Notion tracker adapter

This is the reference implementation of `docs/agents/tracker.md`, kept as a
worked example rather than a required dependency. The transport is `ntn`; the
agent skill with install, auth, pagination, and payload mechanics is
[`skills/notion-cli`](../../skills/notion-cli/SKILL.md). Read that skill before
the first board call.

## Interface mapping

| Interface operation | Notion implementation |
| --- | --- |
| `find(query)` | Query the tasks data source with a `Task name` contains-filter, or an `ID` equals-filter for one ticket. |
| `read(id)` | `ntn pages get <page-id>`. The page body is the whole record. |
| `create(ticket)` | `POST v1/pages` with the properties in [schema.md](schema.md). |
| `appendPlan(id, steps)` | Append a `Plan` heading and one to-do block per step to the page. |
| `comment(id, markdown)` | `POST v1/comments` with `{"parent":{"page_id":...},"markdown":...}`. |
| `setStatus(id, status)` | `PATCH v1/pages/<id>` with `{"properties":{"Status":{"status":{"name":...}}}}`. |
| `archive(id)` | `PATCH v1/pages/<id>` with `{"archived":true}`. Never hard-delete. |
| `claim(id)` | Set the `Assignee` people property. |

The ticket number is the `ID` unique-id property. The work marker is
`<PREFIX>-<n>`; configure the prefix in the consumer's `CLAUDE.md`.

## Data source

Query through `v1/data_sources/<data-source-id>/query`. The legacy
`v1/databases/<id>/query` path is not portable and returns `400` on some
workspaces. Keep the data source id in the consumer's environment, never in a
committed file.

## Non-negotiables

- One page per ticket, created only at the approval gate.
- `Planning` at creation, `In progress` when Build starts, `Code Review` while
  the PR is open, `Done` on merge. See [triage.md](triage.md).
- Every board read and write goes through `ntn`; there is no `curl` fallback.
- `page_size` caps at 100; follow `has_more` with `start_cursor`.
