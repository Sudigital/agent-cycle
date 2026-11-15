# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
