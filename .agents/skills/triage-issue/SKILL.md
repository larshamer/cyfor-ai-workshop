# Triage Issue

Use this skill when starting work from a GitHub issue.

## Goal

Turn the issue into a small, reviewable implementation target before planning or coding starts.

## Inputs

- GitHub issue content
- Relevant comments
- Nearby code or generated artifacts only if needed to resolve scope

## Triage flow

- Read the issue from GitHub with `gh issue view`.
- If behavior, scope, or business rules are ambiguous, ask targeted follow-up questions before finalizing triage.
- Keep the scope small enough for a PR that a human can review in about 10 minutes.
- Call out when the issue is too large and propose a smaller first slice.

## Check for this repo

- Whether API and frontend both change
- Whether `api/openapi.json` and `web/src/api/generated/` must be regenerated
- Whether booking, scheduling, availability, or status rules are affected
- Whether database or migration changes are required
- Whether tests need updates for the changed behavior

## Output

Produce a compact triage note with:

- Problem summary
- In scope
- Out of scope
- Acceptance criteria
- Risks or unknowns
- Impacted areas: `api/`, `web/`, generated client, database, tests
- Recommended first slice

## GitHub handoff

- Post the final triage note back to the issue with `gh issue comment`.
- Make it explicit that human approval is expected before planning or implementation starts.