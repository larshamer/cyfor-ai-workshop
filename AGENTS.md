# AGENTS.md

This repository is a workshop project for a booking and resource management system.

## Repo shape

- `api/`: Hono API with Prisma + SQLite
- `web/`: React + Vite frontend
- `slides/`: workshop presentation assets
- `workshop-tasks/`: source material for workshop issues and exercises

## Working rules

- Keep changes small, focused, and consistent with the current codebase.
- Prefer the existing npm scripts over adding new tooling or ad hoc commands.
- Use the current domain language: resources, bookings, availability, categories.
- If you change API routes, schemas, or OpenAPI output, regenerate clients before finishing.

## Common commands

- Install dependencies: `npm install`
- Run the full app: `npm run dev`
- Run only the API: `npm run dev:api`
- Run only the web app: `npm run dev:web`
- Regenerate code: `npm run generate`
- Type-check all workspaces: `npm run typecheck`
- Build all workspaces: `npm run build`

## API and client sync

- The API source of truth lives in `api/src/` and `api/prisma/`.
- Generated OpenAPI output is `api/openapi.json`.
- The frontend API client is generated in `web/src/api/generated/`.
- After API or schema changes, run `npm run generate` and include generated artifacts that belong in source control.

## Validation

- For API changes, prefer validating with the relevant workspace script plus `npm run typecheck`.
- For frontend changes, keep the Vite app working against the local API proxy.
- Do not leave the repo with stale generated files.
