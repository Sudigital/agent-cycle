# Upstream lineage

This file records where each adapted or vendored skill came from. It is
lineage, not an update procedure: skills are edited in place, and the
installer's lock detects drift in a consumer's copy. Repo-owned skills are
authored here and have no upstream row.

| Skill                           | Classification | Source                                                                                    | Commit                                     | Upstream path                                      |
| ------------------------------- | -------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| `grill-with-docs`               | adapted        | [mattpocock/skills](https://github.com/mattpocock/skills)                                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/engineering/grill-with-docs`               |
| `handoff`                       | adapted        | [mattpocock/skills](https://github.com/mattpocock/skills)                                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/productivity/handoff`                      |
| `grilling`                      | adapted        | [mattpocock/skills](https://github.com/mattpocock/skills)                                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/productivity/grilling`                     |
| `tdd`                           | adapted        | [mattpocock/skills](https://github.com/mattpocock/skills)                                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/engineering/tdd`                           |
| `code-review-and-quality`       | adapted        | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)                     | `301b02b12bff98e4688e6984af6556802322bbde` | `skills/code-review-and-quality`                   |
| `notion-cli`                    | adapted        | [makenotion/skills](https://github.com/makenotion/skills)                                 | `10e976aa591995fd60c75ef13beba1a8aa827fcc` | `skills/notion-cli`                                |
| `pentest`                       | adapted        | [usestrix/strix](https://github.com/usestrix/strix)                                       | `4719329d1c3eb0db796714397551945c514a2301` | `skills/`                                          |
| `diagnosing-bugs`               | vendored       | [mattpocock/skills](https://github.com/mattpocock/skills)                                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/engineering/diagnosing-bugs`               |
| `improve-codebase-architecture` | vendored       | [mattpocock/skills](https://github.com/mattpocock/skills)                                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/engineering/improve-codebase-architecture` |
| `codebase-design`               | vendored       | [mattpocock/skills](https://github.com/mattpocock/skills)                                 | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/engineering/codebase-design`               |
| `shadcn`                        | vendored       | [shadcn-ui/ui](https://github.com/shadcn-ui/ui)                                           | `dd41d19e2f80ff6891951f7ced74c2c9a650b065` | `skills/shadcn`                                    |
| `frontend-design`               | vendored       | [anthropics/skills](https://github.com/anthropics/skills)                                 | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | `skills/frontend-design`                           |
| `security-audit`                | vendored       | [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill)     | `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` | `skills/security-audit`                            |
| `product-brainstorming`         | vendored       | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | `a518709449b0a32276af38c9b2a2f38c3219f5bc` | `product-management/skills/product-brainstorming`  |

`llm-wiki` is repo-owned: the prose is authored here and follows the pattern in
[Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f);
no gist text is copied, so it has no upstream row. `repo-owned` means the prose
was authored for this kit. `adapted` means upstream prose was changed to fit the
harness-neutral loop. `vendored` means the skill is carried with only the path
and packaging adjustments the kit requires. Every adapted or vendored skill
keeps its upstream license text as `LICENSE.txt`; `provenance.json` records the
source, pin, and license file for those skills.

Skills are discovered one level under `skills/` (`<skill>/SKILL.md`). `skills/`
and `adapters/` are excluded from the formatter (`.oxfmtrc.json`
`ignorePatterns`) so a formatter pass cannot rewrap the prose.
