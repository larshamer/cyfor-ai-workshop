# Write PR

Use this skill when the implementation is complete and a pull request needs a concise, reviewable description.

## Goal

Create a PR description that helps AI review first and human review second.

## Inputs

- GitHub issue
- Approved triage and plan
- Actual code diff
- Validation results

## Check for this repo

- Mention API and frontend changes together when both are touched
- Mention regenerated files when `api/openapi.json` or `web/src/api/generated/` changed
- Call out schema or migration changes explicitly
- Flag any booking or availability rule changes as behavior changes, not implementation detail

## Output

Write a short PR body with:

- What changed
- Why it changed
- How it was validated
- Risks or follow-ups
- Issue reference

## Quality bar

- Keep the PR small enough to review comfortably.
- Do not hide unfinished scope in vague follow-up text.
- If the diff is too large to explain clearly, say the implementation should be split before opening the PR.