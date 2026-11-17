# Review and merge policy

`skill://code-review-and-quality` is the independent pass over a diff. CI is the
mandatory reviewer: a change merges only after the checks are green. A review
that finds no issues does not replace the checks, and a green check does not
replace the review.

## Risk lane

A human gives the second pair of eyes when a change is hard to reverse: database
migrations and schema, auth and permissions, payments and webhooks, deploy and
key handling, and public contracts (APIs, events, file formats). Everything else
may merge after the checks are green and the review findings are closed.

## Generated artefacts

Mark generated files in `.gitattributes` (`-diff linguist-generated`) and review
the count, not the file. Migration SQL stays in scope: a generated down-migration
can drop data. A snapshot nobody reads is not a review.

## After merge

Smoke the changed surface where one exists. If it fails, revert first and
diagnose after; a broken integration branch blocks every other change.
