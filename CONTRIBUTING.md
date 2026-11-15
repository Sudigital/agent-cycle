# Contributing

Thanks for helping make `agent-cycle` better. This repository is prose plus two
small Node scripts; the bar is accuracy, not volume.

## Before you start

- For a typo or a broken link, open a pull request directly.
- For a new skill, a changed contract, or a change to the installer's lock
  format, open an issue first so the interface does not move under consumers.
- By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
  Report vulnerabilities through [SECURITY.md](SECURITY.md), never a public
  issue.

## Workflow

1. Fork and branch from `main`: `<type>/<short-description>`.
2. Make the smallest change that solves the problem.
3. Run the checks below.
4. Commit with a conventional subject. Add `Assisted-by: <tool> (<model>)` only
   when an AI assistant materially authored the change.
5. Open a pull request that names the problem, the change, and how you verified
   it. The body must answer **Risk**, **Standards**, and **Spec**.

## Changing a skill

- Edit `skills/<name>/SKILL.md` in place. There is no override layer.
- Keep the frontmatter accurate: `name`, `description`, and
  `disable-model-invocation` when the user must invoke it.
- Keep the prose harness-neutral. No product names, ticket prefixes, board ids,
  package scopes, or workspace paths from a consumer repository.
- If the skill is adapted or vendored, update its row in `provenance.json`,
  `UPSTREAM.md`, and `THIRD-PARTY-NOTICES.md` together. A missing license or
  commit fails CI.
- If you add a skill, add its directory, a provenance row, an upstream row, and
  a notice row. Apache-2.0 material keeps its `LICENSE.txt`.

## Changing the installer

`bin/agent-cycle.mjs` is dependency-free and must stay that way. It may read the
package tree, copy files, and hash them; it must not use the network, create
symlinks, or mutate anything outside `--target`.

The lock is a contract. Bump the package minor version if you change its shape,
and update `--check` and the CI fixture in the same change.

## Checks

```bash
node scripts/check-provenance.mjs
node bin/agent-cycle.mjs install --target /tmp/agent-cycle-fixture
node bin/agent-cycle.mjs --check --target /tmp/agent-cycle-fixture
npx oxfmt@0.47.0 --check bin scripts .github package.json .oxfmtrc.json
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
