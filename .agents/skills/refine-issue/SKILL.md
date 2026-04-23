# Refine Issue

Use this skill when a GitHub issue, workshop task, or user request is too vague to implement safely.

## Goal

Turn a lightweight requirement into a compact, implementation-ready brief.

## Clarify first

- If any meaningful ambiguity exists, do not lock in requirements yet.
- Ask 2-3 targeted follow-up questions that resolve behavior, scope, or business rules.
- Prefer questions that change implementation decisions, data shape, validation, or user flow.
- Once the user answers, produce the refined brief in compact bullets.

## Cover

- Problem statement
- Affected user or role
- User story
- Acceptance criteria
- Non-goals
- Assumptions
- Hidden business rules
- Edge cases or validation rules
- Impacted system areas: `api/`, `web/`, generated client, database, tests

## Output

- Keep it short and implementation-oriented.
- Use plain bullets, not long prose.
- Call out unknowns separately if they still block implementation.
- Do not invent business rules unless you mark them as assumptions.

## Tiny example

Issue: "Add reservations to the app."

Questions:

- What can be reserved: a resource, a room, or a time slot?
- When should a reservation count as active: draft, confirmed, or paid?
- Should overlapping reservations be blocked or allowed with warnings?

Refined brief:

- Problem: Users need to reserve a resource for a specific time range.
- User: Staff managing shared resources.
- User story: As a staff member, I want to create and confirm reservations so availability stays accurate.
- Acceptance criteria: Users can create a reservation with resource, date, start time, end time, and status. Overlapping confirmed reservations are rejected. Cancelled reservations no longer block availability.
- Non-goals: Payments, reminders, recurring reservations.
- Assumptions: Reservations are tied to one resource and one continuous time range.
- Business rules: End time must be after start time. Only confirmed reservations block availability.
- Impact: `api/`, `web/`, database, generated client, tests.