# Third-party notices

This repository's own prose is MIT (see `LICENSE`). The skills below carry the
licenses shown. Apache-2.0 components retain their full license text in their
skill directory (`LICENSE.txt`), and this file records the source, pinned
commit, and license for every skill in `skills/`.

| Skill                           | Source                                             | Commit                                     | License    | Changes                                                                                             |
| ------------------------------- | -------------------------------------------------- | ------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------- |
| `grill-with-docs`               | this repository                                    | `v0.1.0`                                   | MIT        | Original to this kit.                                                                               |
| `handoff`                       | this repository                                    | `v0.1.0`                                   | MIT        | Original to this kit.                                                                               |
| `grilling`                      | https://github.com/mattpocock/skills               | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | Adapted: kit skill names, harness-neutral wording.                                                  |
| `tdd`                           | https://github.com/mattpocock/skills               | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | Adapted: ticket and plan references generalized.                                                    |
| `code-review-and-quality`       | https://github.com/addyosmani/agent-skills         | `301b02b12bff98e4688e6984af6556802322bbde` | MIT        | Adapted: project-specific review references generalized.                                            |
| `notion-cli`                    | https://github.com/makenotion/skills               | `10e976aa591995fd60c75ef13beba1a8aa827fcc` | MIT        | Adapted: data-source query path, placeholder ids, tracker interface.                                |
| `pentest`                       | https://github.com/usestrix/strix                  | `4719329d1c3eb0db796714397551945c514a2301` | Apache-2.0 | Adapted: generic target paths and report destinations. Wraps the Strix CLI; `LICENSE.txt` retained. |
| `diagnosing-bugs`               | https://github.com/mattpocock/skills               | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | Vendored.                                                                                           |
| `improve-codebase-architecture` | https://github.com/mattpocock/skills               | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | Vendored.                                                                                           |
| `codebase-design`               | https://github.com/mattpocock/skills               | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT        | Vendored.                                                                                           |
| `shadcn`                        | https://github.com/shadcn-ui/ui                    | `dd41d19e2f80ff6891951f7ced74c2c9a650b065` | MIT        | Vendored.                                                                                           |
| `frontend-design`               | https://github.com/anthropics/skills               | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | Apache-2.0 | Vendored; `LICENSE.txt` retained.                                                                   |
| `security-audit`                | https://github.com/cloudflare/security-audit-skill | `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` | MIT        | Vendored.                                                                                           |

## Apache License 2.0 texts

- `skills/frontend-design/LICENSE.txt` — from `anthropics/skills`; the file
  carries the unmodified Apache License 2.0 text.
- `skills/pentest/LICENSE.txt` — from `usestrix/strix`, Copyright 2025
  OmniSecure Inc. (see the file for the exact notice).

Both files are distributed unmodified under the Apache License, Version 2.0.
You may obtain a copy of the license at
<https://www.apache.org/licenses/LICENSE-2.0>.

## Strix CLI

`skills/pentest` wraps the Strix command-line tool. Strix itself is not
vendored; install it from its upstream project and comply with its Apache-2.0
terms when you run it.
