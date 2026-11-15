# Triage mapping

The engineering skills speak in six canonical triage roles. Notion has no label
field, so this adapter records each role as a `Status` value (plus `Priority`
where a role needs disambiguating). Other adapters map the same roles to their
own labels.

| Role | Notion value | Meaning |
| --- | --- | --- |
| `needs-triage` | `Status: Not started` | Maintainer needs to evaluate this issue |
| `needs-info` | `Status: On Hold` | Waiting on the reporter for more information |
| `ready-for-agent` | `Status: Planning` | Fully specified, ready for an autonomous agent |
| `ready-for-human` | `Status: Quality Assurance` | Requires human implementation or check |
| `block` | `Status: Delayed` | Waiting on another task or a decision |
| `wontfix` | `Status: Archived` | Will not be actioned |

When a skill mentions a role — "apply the AFK-ready triage label" — set the
corresponding tracked value from this table through `skill://notion-cli`.

`Status: Planning` lands a spec or map before work; the approval gate creates a
work task at `Status: Planning`, and Build moves it to `In progress` (see
`CLAUDE.md` → **The 5-stage cycle**). `Priority` distinguishes the agent-ready
and human-ready variants.
