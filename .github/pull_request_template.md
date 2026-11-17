## Problem

<!-- What is wrong or missing, and who is affected? -->

## Change

<!-- The smallest change that solves it. Name the files. -->

## Risk

<!-- What can break? Include the rollback, or why none is needed. -->

## Standards

<!-- Which conventions or ADRs does this follow or change? -->

## Spec

<!-- The observable behavior that proves this works, and the command that shows it. -->

## Checklist

- [ ] Skill prose stays harness-neutral (no product names, ticket prefixes, board ids, or package scopes).
- [ ] `provenance.json`, `UPSTREAM.md`, and `THIRD-PARTY-NOTICES.md` agree for every changed skill.
- [ ] `node scripts/check-provenance.mjs` passes.
- [ ] The installer fixture installs and `--check` passes.
- [ ] Formatting check passes; skill prose was not rewrapped.
- [ ] Review verdict is Approve with no Required findings, and the user approved the merge.
