# Third-party notices

This repository's own prose is MIT (see `LICENSE`). Every adapted or vendored
skill keeps its upstream license text as `LICENSE.txt` in its skill directory,
and this file records the source, pinned commit, license, and license file for
every adapted or vendored skill in `skills/`. Repo-owned skills are authored
here and have no third-party notice.

| Skill                           | Source                                               | Commit                                     | License    | License file                                       | Changes                                                                     |
| ------------------------------- | ---------------------------------------------------- | ------------------------------------------ | ---------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| `grill-with-docs`               | https://github.com/mattpocock/skills                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | `skills/grill-with-docs/LICENSE.txt`               | Adapted: workflow contract, tracker interface, stage mapping.               |
| `handoff`                       | https://github.com/mattpocock/skills                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | `skills/handoff/LICENSE.txt`                       | Adapted: ticket and handoff-path conventions.                               |
| `grilling`                      | https://github.com/mattpocock/skills                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | `skills/grilling/LICENSE.txt`                      | Adapted: kit skill names, harness-neutral wording.                          |
| `tdd`                           | https://github.com/mattpocock/skills                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | `skills/tdd/LICENSE.txt`                           | Adapted: ticket and plan references generalized.                            |
| `code-review-and-quality`       | https://github.com/addyosmani/agent-skills           | `301b02b12bff98e4688e6984af6556802322bbde` | MIT        | `skills/code-review-and-quality/LICENSE.txt`       | Adapted: project-specific review references generalized.                    |
| `notion-cli`                    | https://github.com/makenotion/skills                 | `10e976aa591995fd60c75ef13beba1a8aa827fcc` | MIT        | `skills/notion-cli/LICENSE.txt`                    | Adapted: data-source query path, placeholder ids, tracker interface.        |
| `pentest`                       | https://github.com/usestrix/strix                    | `4719329d1c3eb0db796714397551945c514a2301` | Apache-2.0 | `skills/pentest/LICENSE.txt`                       | Adapted: generic target paths and report destinations. Wraps the Strix CLI. |
| `diagnosing-bugs`               | https://github.com/mattpocock/skills                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | `skills/diagnosing-bugs/LICENSE.txt`               | Vendored.                                                                   |
| `improve-codebase-architecture` | https://github.com/mattpocock/skills                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | `skills/improve-codebase-architecture/LICENSE.txt` | Vendored.                                                                   |
| `codebase-design`               | https://github.com/mattpocock/skills                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | `skills/codebase-design/LICENSE.txt`               | Vendored.                                                                   |
| `shadcn`                        | https://github.com/shadcn-ui/ui                      | `dd41d19e2f80ff6891951f7ced74c2c9a650b065` | MIT        | `skills/shadcn/LICENSE.txt`                        | Vendored.                                                                   |
| `frontend-design`               | https://github.com/anthropics/skills                 | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | Apache-2.0 | `skills/frontend-design/LICENSE.txt`               | Vendored.                                                                   |
| `security-audit`                | https://github.com/cloudflare/security-audit-skill   | `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` | MIT        | `skills/security-audit/LICENSE.txt`                | Vendored.                                                                   |
| `product-brainstorming`         | https://github.com/anthropics/knowledge-work-plugins | `a518709449b0a32276af38c9b2a2f38c3219f5bc` | Apache-2.0 | `skills/product-brainstorming/LICENSE.txt`         | Vendored: added `disable-model-invocation` frontmatter.                     |

## MIT license texts

Each MIT-licensed skill carries the upstream MIT text verbatim in
`skills/<skill>/LICENSE.txt`. The copyright lines are:

- `grill-with-docs`, `handoff`, `grilling`, `tdd`, `diagnosing-bugs`,
  `improve-codebase-architecture`, `codebase-design` — Copyright (c) 2026 Matt
  Pocock.
- `code-review-and-quality` — Copyright (c) 2025 Addy Osmani.
- `notion-cli` — Copyright (c) 2026 Notion Labs, Inc.
- `shadcn` — Copyright (c) 2023 shadcn.
- `security-audit` — Copyright (c) 2025-2026 Cloudflare, Inc.

The MIT permission notice and warranty disclaimer are reproduced in each file,
as the license requires.

## Apache License 2.0 texts

- `skills/frontend-design/LICENSE.txt` — from `anthropics/skills`; the file
  carries the unmodified Apache License 2.0 text.
- `skills/product-brainstorming/LICENSE.txt` — from
  `anthropics/knowledge-work-plugins`; the file carries the unmodified Apache
  License 2.0 text.
- `skills/pentest/LICENSE.txt` — from `usestrix/strix`, Copyright 2025
  OmniSecure Inc. (see the file for the exact notice).

All three files are distributed unmodified under the Apache License, Version 2.0.
You may obtain a copy of the license at
<https://www.apache.org/licenses/LICENSE-2.0>.

## Strix CLI

`skills/pentest` wraps the Strix command-line tool. Strix itself is not
vendored; install it from its upstream project and comply with its Apache-2.0
terms when you run it.
