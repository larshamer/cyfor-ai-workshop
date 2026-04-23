# Review PR

Use this skill when reviewing a pull request for this repository.

## Focus

- Find concrete bugs, regressions, risky assumptions, and missing validation.
- Check that API, OpenAPI output, and frontend client stay in sync.
- Check that generated files were regenerated when API routes or schemas changed.
- Check that naming and validation fit the booking/resource-management domain.
- Prefer small, reviewable diffs. If the PR is too large to review in about 10 minutes, call that out.

## Review checks

- For API changes, inspect `api/src/`, `api/prisma/`, and `api/openapi.json` together.
- For frontend changes, inspect `web/src/` and `web/src/api/generated/` together.
- Verify the change uses the existing npm scripts and does not introduce unnecessary tooling.
- Look for missing empty states, validation gaps, stale generated artifacts, and broken create/edit/delete flows.
- Treat AI-generated code with extra suspicion where it invents behavior not grounded in the issue or diff.

## Output

- Lead with findings, ordered by severity.
- Include file paths and the specific behavior at risk.
- Be explicit when something needs a test, regeneration step, or smaller scope.
- If there are no findings, say that directly and mention any residual risk or test gap.
