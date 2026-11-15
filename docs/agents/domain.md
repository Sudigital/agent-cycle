# Domain docs

How the engineering skills consume a project's domain documentation when
exploring a codebase. A consumer may replace this page with its own overlay; the
skills only depend on the conventions below.

## Layout: single-context

Use one glossary at the repository root and a numbered ADR log.

```
<repo>/
├── GLOSSARY.md          ← ubiquitous language
├── docs/
│   ├── adr/             ← architecture decisions, numbered
│   └── agents/          ← this interface, plus the consumer's overlay
└── <source trees>/
```

`GLOSSARY.md` lives at the root when the project has one. It grows lazily:
`/skill:grill-with-docs` adds a term when the term is actually resolved, never
upfront as a glossary-writing exercise.

## Decisions live in docs/adr/

Record each architecture decision as `docs/adr/NNNN-kebab-title.md` with
`Status`, `Date`, `Context`, `Decision`, `Alternatives`, and `Consequences`.
Add the row to `docs/adr/README.md`. Write the file after approval and before
the tracker ticket. Never record a decision as a `GLOSSARY.md` bullet.

A superseded decision keeps its file; set `Status: Superseded by NNNN` and link
forward to its replacement.

## Before exploring, read these

- **`GLOSSARY.md`** at the repository root, if it exists.
- **The originating ticket**, when the work came from one.
- **The ADRs in the area you are touching.**

If either the glossary or the ticket is absent, proceed silently. Do not flag
the absence and do not suggest creating them upfront.

## Use the glossary's vocabulary

When output names a domain concept — a ticket title, a refactor proposal, a
hypothesis, a test name — use the term as defined in `GLOSSARY.md`. Do not
drift to synonyms the glossary explicitly avoids.

If the concept you need is not in the glossary yet, treat it as a signal:
either you are inventing language the project does not use (reconsider), or
there is a real gap (note it in the plan).

## Flag decision conflicts

If your output contradicts an existing ADR or glossary entry, surface it
explicitly rather than silently overriding:

> _Contradicts ADR 0001 (agent skill loop), but worth reopening because…_

Write the replacement as a new ADR; never edit the accepted record in place.
Product-specific invariants belong in the consumer's `CLAUDE.md` overlay, never
in this repository.
