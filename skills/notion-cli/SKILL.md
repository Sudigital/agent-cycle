---
name: notion-cli
description: >-
  Use the Notion CLI (`ntn`) as the worked tracker adapter: call the Notion
  API, manage workers, upload files, create pages, and query a data source. Use
  when the user asks to "call the Notion API", "deploy a worker", "upload a
  file to Notion", "create a page", "query a database", or any task involving
  the `ntn` command. The tracker interface is `docs/agents/tracker.md`; this
  adapter's schema is `adapters/notion/schema.md` and its status mapping is
  `adapters/notion/triage.md`.
---

# Notion CLI adapter

The CLI is self-documenting and is this adapter's only transport. The
interface — operations, lifecycle, and the `Plan` block — is
`docs/agents/tracker.md`. This file supplies the Notion mechanics, never the
contract.

## Install

```bash
command -v ntn || curl -fsSL https://ntn.dev | bash
```

The install script runs remote code. If the user has not approved network
installs, stop and report; never hand-roll `curl` calls to the API.

## Authentication

The consumer owns its credentials. A common layout keeps the key in `.env` as
`NOTION_API_KEY`; the CLI reads `NOTION_API_TOKEN`. Read the key by name and
export the alias — never source `.env`, which injects every assignment into the
command.

```bash
nvar() { awk -F= -v k="$1" '$1==k { sub(/^[^=]*=/, ""); print; exit }' .env; }
export NOTION_API_TOKEN="$(nvar NOTION_API_KEY)"
export NOTION_TASKS_DATA_SOURCE="$(nvar NOTION_TASKS_DATA_SOURCE)"  # byte-exact
```

- Check `NOTION_API_TOKEN` first. If it is already set, use it instead of
  `ntn login`.
- `ntn login` / `ntn logout` — only when no token is available; `ntn login`
  requires the user to visit a URL in a browser.

## Look things up before answering

- `ntn api ls` — list every public API endpoint.
- `ntn api <path> --help` — methods, doc links, usage.
- `ntn api <path> --docs` — full official docs for an endpoint.
- `ntn api <path> --spec` — reduced OpenAPI fragment (request/response schemas).
- `ntn pages get <page-id>` — retrieve a page as Markdown. This is how to read a
  ticket body; the page is the whole record.
- `ntn <command> --help` — help for any command or subcommand.

## `ntn api`

```bash
# GET with query param
ntn api v1/users page_size==100

# POST with inline body fields
ntn api v1/pages parent[page_id]=abc123

# POST with JSON body
ntn api v1/pages -d '{"parent":{"page_id":"abc123"}}'
```

The method is inferred (GET by default, POST when a body is present). Override
with `-X METHOD`.

### Task board

The tasks database is a data source. Query it through
`v1/data_sources/<data-source-id>/query`; the legacy
`v1/databases/<id>/query` path is not universal and returns `400` on some
workspaces.

```bash
# by ticket number — the value is a bare number, never an object
ntn api "v1/data_sources/$NOTION_TASKS_DATA_SOURCE/query" -X POST \
  -d '{"filter":{"property":"ID","unique_id":{"equals":123}}}' \
  | jq -c 'if .object=="error" then {error:.message} else .results[] | {id, status:.properties.Status.status.name} end'

# read a page body as Markdown
ntn pages get PAGE_ID

# create a task (properties per adapters/notion/schema.md)
ntn api v1/pages -d "{
  \"parent\": {\"data_source_id\": \"$NOTION_TASKS_DATA_SOURCE\"},
  \"properties\": {
    \"Task name\": {\"title\": [{\"text\": {\"content\": \"Title\"}}]},
    \"Status\": {\"status\": {\"name\": \"Planning\"}},
    \"Task type\": {\"multi_select\": [{\"name\": \"Task\"}]},
    \"Priority\": {\"select\": {\"name\": \"High\"}},
    \"Effort level\": {\"select\": {\"name\": \"Small\"}},
    \"Points\": {\"number\": 3}
  }
}" | jq '{id: .id, url: .url}'

# move status
ntn api v1/pages/PAGE_ID -X PATCH \
  -d '{"properties":{"Status":{"status":{"name":"In progress"}}}}'
```

Lifecycle rules are the contract, not this skill: create exactly one page at
the approval gate, move `Status` as work advances, keep the review status while
the PR is open, and archive rather than hard-delete. See `CLAUDE.md` →
**The cycle**, `docs/agents/tracker.md`, and `adapters/notion/triage.md`.

### Markdown for pages and comments

Prefer `ntn pages create` / `ntn pages update` for Markdown page content. Use
the `markdown` field for comments via `ntn api`.

```bash
# comment with markdown
ntn api v1/comments -d '{"parent":{"page_id":"abc123"},"markdown":"Here is a [link](https://example.com) and **bold text**."}'

# page with markdown body
ntn pages create --parent page:abc123 --content '## Heading\n\nSome *formatted* content.'
```

The `markdown` field supports inline formatting (bold, italic, code, links).
Fall back to `rich_text` only for mentions, custom emoji, or colors.

## `ntn files`

Convenience wrapper around the File Uploads API.

```bash
ntn files create < image.png
ntn files create --external-url https://example.com/photo.png
ntn files list
ntn files get <upload-id>
```

## `ntn workers`

Manage Notion workers (deploy, list, execute). Run `ntn workers --help` for
subcommands.

```bash
ntn workers new my-worker        # scaffold a new project
ntn workers deploy               # deploy from current directory
ntn workers ls                   # list workers
ntn workers exec <capability>    # execute a capability
```

## Adapter rules

- `grill-with-docs` loads a tracker adapter by default: the cycle always
  creates and maintains exactly one page per ticket.
- One page per cycle, created only at the approval gate. Never create a second
  page for the same `<PREFIX>-<n>`.
- Never hard-delete. Archive pages (`"archived": true`); `DELETE` a block only.
- Never commit task content, findings, or generated docs into the repo.
- `page_size` caps at 100; when `.has_more` is true, re-query with
  `{"start_cursor":"<next_cursor>"}`.
- Never fall back to hand-written `curl` in the loop. If `ntn` cannot run, stop
  and report.
