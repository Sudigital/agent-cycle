# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `scripts/check-release.mjs` and the tag-triggered `Release` workflow: the
  package version, every README install pin, the changelog section and link, and
  the pushed tag must agree before a GitHub Release is created.
- `scripts/check-skill-refs.mjs`: every `skill://` and `/skill:` reference in
  the contract and docs must resolve, the skills table must match `skills/`, the
  stated skill count must match, and `.omp/skills` must not be tracked.
- A maintenance lane in `CLAUDE.md` and the review policy for mechanical,
  reversible housekeeping changes.
- Checker fixtures under `scripts/*.test.mjs` for the release, reference, and
  provenance rules.
- `package-lock.json` for reproducible installs, Dependabot updates, and pinned
  action commits.
- A Node 20/22/24 CI matrix, `.nvmrc`, and README status badges.
- Branch protection on `dev`: pull requests require CI, and force-pushes and
  deletion are blocked.

### Changed

- `provenance.json` no longer requires `source`, `commit`, or `licenseFile` for
  `repo-owned` skills; their license defaults to the repository's MIT.
- `.omp/skills/` is gitignored as an install target, never a second skill tree.
- `LICENSE` is the canonical MIT text, so GitHub detects it; third-party terms
  stay in `THIRD-PARTY-NOTICES.md`.
- `SECURITY.md` tracks `0.2.x` and the `dev` integration branch.
- The `Release` workflow runs the test suite and formatting before it publishes.

## [0.2.0] - 2026-11-19

### Added

- `skills/product-brainstorming`: vendored manual-only ideation sparring
  partner from `anthropics/knowledge-work-plugins`, pinned in `provenance.json`,
  `UPSTREAM.md`, and `THIRD-PARTY-NOTICES.md`.
- `skills/llm-wiki`: repo-owned manual-only wiki maintainer for `docs/wiki/`,
  with `ingest`, `query`, and `lint` under index-first, citation-first token
  rules.
- `CLAUDE.md`: `/skill:product-brainstorming` and `/skill:llm-wiki` as optional
  pre-coding steps that never replace the Plan interview.
- `docs/agents/review.md`: the CI gate, the human risk lane, and the
  generated-artefact review policy.
- Tracker ticket-body contract: mandatory description, acceptance criteria,
  one checklist item per plan step, a verify command, and a close block. The
  `done` gate requires every step ticked and a merged-PR link.
- `appendBody` in the tracker interface, plus the Notion `Description` and
  `in_trash` write paths.
- `docs/agents/prompt.md`: a copy-paste prompt that carries a fresh agent
  session through the full five-stage cycle.

### Changed

- `grill-with-docs`, `tdd`, and `code-review-and-quality` write and verify the
  ticket body and its acceptance criteria.
- `domain.md` places ADR writing on the ticket branch after the ticket exists.
- `CONTRIBUTING.md` documents how a consumer fork upstreams generic changes.
- Handoffs start from the handoff alone: 40-line cap, stat-diff staleness, a
  next-step pointer, and no transcript or plan replay.
- Todos are the shared cursor: printed at session start and after status
  changes, with the active stage in every reply.
- A merge now requires an approving review and explicit user approval; the
  agent never self-merges.
- Context discipline is explicit in the contract and prompt: handoff-only,
  stat-diff and range reads, capped tool output, batched calls, concise answers,
  and a soft stage budget.

## [0.1.1] - 2026-11-15

### Added

- `--with-docs` installs `CLAUDE.md`, `docs/agents/`, and `adapters/` into a
  fresh project root alongside the skills, with a separate
  `.agent-cycle-contract.json` lock. It refuses to overwrite existing paths.
- `--strict` makes `--check` fail on any file the lock does not name.
- Every adapted or vendored skill now carries its upstream license text as
  `LICENSE.txt`; the provenance checker requires a complete MIT or Apache-2.0
  text and a matching notice.
- CI now proves tamper detection, escaping lock rejection, symlink refusal, and
  installation from the packed tarball.

### Fixed

- The installer confines every lock path to `--target`, rejects absolute and
  `..` entries before writing, refuses symlinked targets and destination paths,
  and never follows a symlink when writing or pruning.
- `grill-with-docs` and `handoff` are recorded as adapted from
  `mattpocock/skills` at the pinned commit instead of repo-owned, matching the
  upstream lineage and MIT notice.
- The README quick start installs the contract the skills reference, and the
  commit caveat for tarball installs is documented.

[0.2.0]: https://github.com/Sudigital/agent-cycle/releases/tag/v0.2.0
[0.1.1]: https://github.com/Sudigital/agent-cycle/releases/tag/v0.1.1

## [0.1.0] - 2026-11-15

### Added

- Thirteen portable agent skills under `skills/`, covering the Plan → Task →
  Build → Verify → Reset cycle and on-demand debugging, architecture, security,
  pentest, and frontend work.
- `CLAUDE.md`, the workflow-only contract with placeholders for ticket prefix,
  tracker data source, base branch, and project commands; `AGENTS.md` as a
  relative symlink.
- `docs/agents/tracker.md`, an adapter-neutral tracker interface, plus the
  worked `adapters/notion/` implementation with schema and triage mapping.
- `bin/agent-cycle.mjs`: a dependency-free copy-in installer that writes
  `.skills-lock.json` with source, ref, commit, and SHA-256 per file, and
  `--check` verification.
- `scripts/check-provenance.mjs`: validates every skill's provenance, the
  third-party notices, and the absence of consumer-specific strings.
- CI for provenance, an installer fixture, and formatting; `.oxfmtrc.json`
  excludes skill prose from the formatter.
- Governance: README, MIT `LICENSE`, `THIRD-PARTY-NOTICES.md`, `CONTRIBUTING.md`,
  Contributor Covenant 2.1, `SECURITY.md`, issue templates, and a pull request
  template.

[0.1.0]: https://github.com/Sudigital/agent-cycle/releases/tag/v0.1.0
