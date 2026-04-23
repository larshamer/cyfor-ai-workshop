# Plan Implementation

Use this skill after triage has been reviewed and the issue scope is accepted.

## Goal

Produce a short implementation plan that keeps scope tight and validation explicit.

## Inputs

- GitHub issue
- Approved triage result
- Local code context only for the touched slice

## Planning rules

- Plan the smallest viable change that satisfies the accepted scope.
- Split work by concrete surfaces such as schema, API route, generated client, UI, and tests.
- Keep the plan short enough that a human can approve it quickly.
- If the work no longer fits a small PR, stop and propose a narrower slice.

## Check for this repo

- API source of truth lives in `api/src/` and `api/prisma/`
- Regenerate `api/openapi.json` and `web/src/api/generated/` when API contracts change
- Preserve booking and availability rules already established in issue triage
- Prefer existing npm scripts for validation

## Output

Produce a compact plan with:

- Goal
- Files or areas likely to change
- Ordered implementation steps
- Validation steps
- Explicit out-of-scope items
- Open questions that still block coding

## Handoff

- Treat the issue and approved triage as the source of truth.
- Ask for human approval before implementation starts.