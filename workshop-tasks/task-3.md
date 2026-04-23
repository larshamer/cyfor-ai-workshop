# Task 3: Context engineering and issue refinement

In this task you will focus on context quality instead of raw implementation speed. The goal is to show that when Copilot is doing the implementation work, a strong understanding of the problem space becomes even more important.

## Part 1: Create a "refine issue" skill

Create a minimal skill for turning a lightweight GitHub issue or vague requirement into an implementation-ready brief.

Suggested path:

- `.agents/skills/refine-issue/SKILL.md`

The skill should help Copilot produce things like:

- a short problem statement
- the user or role affected
- a user story
- acceptance criteria
- non-goals
- assumptions
- hidden business rules
- edge cases or validation rules
- impacted parts of the system (`api/`, `web/`, generated client, database, tests)

If the issue is ambiguous, the skill should ask the user targeted follow-up questions before locking in requirements, similar to how plan mode clarifies scope and behavior.

Keep it short and reusable. The goal is not to create a giant template. The goal is to make a vague issue actionable.

## Part 2: Use the skill on a deliberately vague requirement

Use your skill on this requirement:

> We need to evolve this product from a simple list into something that can support scheduling and reservations.

This is intentionally vague. The point is to surface the assumptions hiding inside it.

Use the skill to uncover and clarify things like:

- what a "schedule" actually means in this product
- what kind of thing can be booked or reserved
- what information a reservation needs
- when something should count as reserved
- whether reservations have statuses such as draft, confirmed, cancelled, or completed
- how search/filtering relates to availability and booking state
- what business rules should exist before any implementation starts

Update the issue or write out a refined brief that includes:

- a user story
- acceptance criteria
- business rules
- assumptions
- non-goals
- important follow-up questions

This part should involve real ideation between the user and the AI. The point is to show that before AI writes code, it needs a better problem definition than the original vague request.

### Refined brief

- Problem: The product currently shows a simple list of resources, but users need to understand when a resource can be used and create reservations against defined time slots.
- User: Staff or coordinators managing shared resources.
- User story: As a staff member, I want to reserve a resource for a specific date and time window so I can plan usage without conflicts.
- Acceptance criteria: Users can create a reservation for a resource with date, start time, end time, requester, and notes. Reservations support `draft`, `confirmed`, `cancelled`, and `completed` statuses. `confirmed` and `completed` reservations block availability until the reservation end time. Search continues to focus on resource details, while availability is handled separately in scheduling or reservation views.
- Business rules: Reservations are tied to resources and explicit time slots. End time must be after start time. Overlapping blocking reservations for the same resource are not allowed. `draft` reservations do not block availability. `cancelled` reservations never block availability. `completed` reservations should still count as blocking until their scheduled end time has passed.
- Assumptions: A reservation is always for one resource and one continuous time range. A time slot is meaningful only in relation to a resource and a date. Search and availability remain separate concerns in the first version.
- Non-goals: Payments, approval workflows, recurring reservations, reminders, and combining availability filtering into the existing search experience.
- Edge cases and validation: Prevent zero-length or negative-length reservations. Reject overlaps on the same resource when an existing blocking reservation exists. Clarify timezone handling before implementation. Decide whether edits to an already confirmed reservation should re-run overlap validation.
- Impacted system areas: `api/` reservation and availability endpoints, database schema for reservations and statuses, generated client, `web/` scheduling and reservation UI, and tests covering overlap and status transitions.
- Important follow-up questions: Should users reserve only existing resources, or should empty time slots exist independently first? What should happen if a reservation reaches its end time but is never explicitly marked `completed`? Should completed reservations remain visible in availability history and reporting, even after they stop blocking?

## Done when

- the refine-issue skill exists and is reusable
- the vague requirement has been turned into a much clearer issue or brief
- hidden assumptions and business rules have been surfaced explicitly
- the final result feels ready for implementation by another person or another Copilot session
