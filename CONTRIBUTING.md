# Contributing

Thanks for helping make `agent-cycle` better. This repository is prose plus a
small Node CLI and validation scripts; the bar is accuracy, not volume.

## Before you start

- For a typo or a broken link, open a pull request directly.
- For a new skill, a changed contract, or a change to the installer's lock
  format, open an issue first so the interface does not move under consumers.
- By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
  Report vulnerabilities through [SECURITY.md](SECURITY.md), never a public
  issue.

## Workflow

1. Fork and branch from `dev`: `<type>/<short-description>`.
2. Make the smallest change that solves the problem.
3. Run the checks below.
4. Commit with a conventional subject. Add `Assisted-by: <tool> (<model>)` only
   when an AI assistant materially authored the change.
5. Open a pull request against `dev` that names the problem, the change, and how
   you verified it. The body must answer **Risk**, **Standards**, and **Spec**.

## Changing a skill

- Edit `skills/<name>/SKILL.md` in place. There is no override layer.
- Keep the frontmatter accurate: `name`, `description`, and
  `disable-model-invocation` when the user must invoke it.
- Keep the prose harness-neutral. No product names, ticket prefixes, board ids,
  package scopes, or workspace paths from a consumer repository.
- If the skill is adapted or vendored, update its row in `provenance.json`,
  `UPSTREAM.md`, and `THIRD-PARTY-NOTICES.md` together, and add its upstream
  license text as `LICENSE.txt` in the skill directory. A missing license,
  commit, or notice fails CI.
- If you add a skill, add its directory and a provenance row. Adapted or
  vendored skills also need an upstream row, a notice row, a `licenseFile`, and
  the upstream license text; Apache-2.0 material keeps the full text. A
  repo-owned skill needs no source pin, commit, license file, or notice.

## Changing the installer

`bin/agent-cycle.mjs` and `lib/` are dependency-free and must stay that way. The
installer may read the package tree, copy files, and hash them; it must not use
the network, create symlinks, or mutate anything outside `--target`. It refuses
symlinked targets and destination paths, and it validates every lock path
before writing or pruning.

The lock is a contract. Bump the package minor version if you change its shape,
and update `--check`, the contract lock, and the CI fixtures in the same change.

## Upstreaming a consumer change

A consumer copies the prose and may edit its copy in place; that copy is a fork,
not a lock. When the fork carries a generic improvement, port it here first and
reinstall. Never leave the canonical text behind the consumer.

1. Compare: `diff -rq skills <consumer>/.omp/skills`,
   `diff -u CLAUDE.md <consumer>/CLAUDE.md`, and
   `diff -rq docs/agents <consumer>/docs/agents`.
2. Classify every difference as a consumer substitution (ticket prefix, base
   branch, workspace commands, product invariants) or a generic improvement.
   Port only the second kind; a product name here fails
   `check-provenance.mjs`.
3. Reinstall the consumer from the new revision and re-apply its overlay. Its
   `UPSTREAM.md` records the lineage; there is no lock to merge.
4. Run the checks below here; in the consumer, run the installer `--check` and
   its formatter.

## Releasing

1. Bump `version` in `package.json`; add `## [x.y.z] - YYYY-MM-DD` and its
   `/releases/tag/vx.y.z` link to `CHANGELOG.md`; re-pin every
   `npx github:...#vx.y.z` command in `README.md`.
2. Run the checks below, then commit, tag annotated `vx.y.z`, and push both.
3. The `Release` workflow verifies the tag against `package.json`, the README
   pins, and the changelog, then creates the GitHub Release from that changelog
   section. It leaves an existing Release untouched.

## Checks

```bash
node scripts/check-provenance.mjs
node scripts/check-release.mjs
node scripts/check-skill-refs.mjs
node --test scripts/*.test.mjs
node bin/agent-cycle.mjs install --target /tmp/agent-cycle-fixture
node bin/agent-cycle.mjs --check --target /tmp/agent-cycle-fixture
node bin/agent-cycle.mjs install --target /tmp/agent-cycle-project --both --with-docs
node bin/agent-cycle.mjs --check --target /tmp/agent-cycle-project --both --with-docs
npx oxfmt@0.47.0 --check .
```

CI runs the same commands. A formatter pass must never rewrap skill prose:
`skills/` and `adapters/` are excluded in `.oxfmtrc.json`.

## Commit and pull request style

- Subject: `type(scope): description` (Conventional Commits).
- One logical change per commit; do not mix a skill rewrite with installer or
  CI changes.
- Explain the trade-off in the body when a reviewer could reasonably disagree.
- Do not add generated documents, lockfiles for unrelated tooling, or secrets.

## License

By contributing you agree that your prose is licensed under MIT and that any
vendored component keeps its upstream license. Do not paste code or prose whose
license cannot be represented in `THIRD-PARTY-NOTICES.md`.
