---
name: llm-wiki
description: Maintain a compounding local markdown wiki (docs/wiki/) for research, product specs, and architectural comparisons.
disable-model-invocation: true
---

# LLM Wiki

A persistent, compounding markdown wiki between raw sources and chat. Knowledge is
compiled once and kept current, not re-derived from raw documents on every
question. This follows the LLM Wiki pattern by Andrej Karpathy:
<https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>.

You own `docs/wiki/`: you create, update, cross-reference, and prune it. The user
supplies sources and questions; you do the bookkeeping.

## When to use

Manual invocation only, via one of:

- `/skill:llm-wiki ingest <source>` — file a source into the wiki.
- `/skill:llm-wiki query <question>` — answer from the wiki with citations.
- `/skill:llm-wiki lint` — health-check the wiki.

## Structure

Two layers, flat and small:

```
docs/wiki/
  index.md          # 1-line catalog of every page — always read this first
  concepts/         # ideas, mechanisms, patterns, how things work
  comparisons/      # X vs Y, trade-offs, decision tables
  product/          # specs, decisions, requirements, open questions
```

- `index.md` is the only entry point. Every page appears exactly once, with a
  one-line summary.
- Keep pages flat inside their folder. No nested trees, no `raw/`, no `log.md`.
- One page per topic. Split only when a page covers two independently useful
  subjects.

## Strict token rules

1. **Read `docs/wiki/index.md` first** on every `ingest`, `query`, and `lint`.
   Never create a page before checking the index for an existing one.
2. **Extend, don't duplicate.** If a page already covers the topic, edit it or
   add a section; create a new page only when no page owns the subject. When
   two pages would overlap, merge and leave a pointer in `index.md`.
3. **Concise, bullet-driven, citation-backed.** Every nontrivial claim carries an
   inline citation: a URL, a file path, a commit, or a ticket id. Prefer short
   bullets over prose.
4. **Never dump raw code or giant transcripts** into `docs/wiki/`. Summarize the
   finding, quote at most a few lines when the exact syntax matters, and link to
   the source instead.
5. **Load only what the question needs.** After reading the index, open the
   couple of pages it points to; do not read the whole wiki.

## Page format

```markdown
# Page title

> One sentence: what this page answers.

- Claim or finding — [source](url) or `path/to/file:line`, date.
- Trade-off or constraint — [source](url).
- Open question: what is still unknown.

## Related

- [Other page](../concepts/other.md) — why it matters here.
```

Keep pages under roughly two screens. A page that grows larger is usually two
pages with a weak boundary.

## `index.md` format

Grouped by folder; exactly one line per page:

```markdown
# Wiki index

## Concepts

- [Event sourcing](concepts/event-sourcing.md) — append-only state as the source of truth.

## Comparisons

- [Queue vs. log](comparisons/queue-vs-log.md) — delivery semantics and replay cost.

## Product

- [Sync spec](product/sync-spec.md) — conflict policy and offline behavior.
```

## Commands

### `ingest <source>`

1. Read `docs/wiki/index.md`.
2. Read the source (file, URL, notes, ticket, or transcript).
3. Identify existing pages it touches; update them before creating anything.
4. Write or update topic pages using the page format. Record contradictions with
   older claims explicitly instead of silently overwriting them.
5. Add or revise the page's line in `index.md`.
6. Report the files touched, the claims added, and any contradictions or gaps.

### `query <question>`

1. Read `docs/wiki/index.md`.
2. Open only the pages whose summaries match; follow their links when needed.
3. Answer from the wiki, citing each page and its underlying sources. Say
   plainly when the wiki does not cover something instead of inventing it.
4. If the answer is durable — a comparison, synthesis, or decision — offer to
   file it back as a page and add it to `index.md`. Answers should compound, not
   disappear into chat.

### `lint`

Read `index.md`, then the pages. Report, do not silently rewrite:

- **Contradictions** — pages or claims that disagree, naming both sides.
- **Stale pages** — claims superseded by a newer source or decision.
- **Orphans** — pages missing from `index.md`, or index entries pointing at
  missing files; pages with no inbound links.
- **Gaps** — important concepts mentioned repeatedly without their own page, or
  a question that needs a new source.
- **Bloat** — pages that violate the token rules (raw dumps, long transcripts,
  duplicated topics).

Propose the smallest fix per finding, then apply fixes only after the user
confirms.

## Rules of thumb

- The wiki is a git-tracked directory of markdown: prefer one clear edit over a
  rewrite, so history stays readable.
- Cite the source of a claim, not the wiki page that repeats it.
- When a new source contradicts a filed claim, keep both, label the dates, and
  state which one the evidence favors.
- Never write speculative content as fact; put it under an open question.
