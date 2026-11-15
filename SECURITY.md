# Security policy

## Supported versions

The latest tagged release receives fixes. Older tags are snapshots of prose;
fixes land on `main` and in the next tag rather than as backports.

| Version | Supported |
| ------- | --------- |
| `0.1.x` | Yes       |
| `< 0.1` | No        |

## Reporting a vulnerability

Do not open a public issue. Report privately through GitHub's **Report a
vulnerability** flow on the repository's Security tab, or email the maintainers
listed in the repository profile.

Include:

- the affected file or skill and the version or commit;
- the impact and the conditions required to trigger it;
- a minimal reproduction or proof of concept;
- any suggested fix.

You will receive an acknowledgement, an assessment, and a remediation plan. We
will credit you in the advisory unless you ask otherwise.

## Scope

This repository ships prose, a copy-in installer, and validation scripts. The
installer reads the package tree and writes only to `--target`; it performs no
network access. It refuses symlinked targets and destination paths, and rejects
lock entries that are absolute or contain `..`, so a hostile lock cannot escape
the target. The skills instruct agents to run commands, so treat a malicious
skill as code execution: review changes to `skills/` and `adapters/` before
installing a new tag.

`skills/pentest` wraps an external tool and requires explicit authorization for
every target. The repository never authorizes a scan; the operator does.

## Safe harbor

We will not pursue legal action for good-faith research that respects this
policy, avoids privacy violations and service disruption, and gives us
reasonable time to fix the issue before disclosure.
