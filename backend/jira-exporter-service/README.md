# jira-exporter-service

Generates the Jira-import CSV from Ready cards. Fetches the backlog from
structure-service (`GET /cards?status=Ready`) rather than owning it — the
backlog itself is structure-service's data; this service only turns it into
a downloadable file.

## Data model

`ExportJob`: `id`, `ownerId`, `status` (`pending`/`completed`/`failed`),
`delimiter`, `includeSubtasks`, `columns` (JSON config), `cardCount`,
`csvContent` (kept so a completed job re-downloads without hitting
structure-service again), `errorMessage`. Persisted via Prisma ORM against
MySQL.

Persisting jobs (rather than generating and forgetting) is what makes
"retry a failed export without losing the backlog" concrete: the backlog
lives in structure-service regardless of whether this service's last
attempt succeeded, and a failed job here just gets retried — no
regeneration of anything upstream.

## API

Every route below requires an `X-User-Id` header — see "Ownership".

| Method | Path                  | Notes                                                |
|--------|-----------------------|--------------------------------------------------------|
| GET    | `/health`             | Liveness check                                          |
| POST   | `/exports`             | `{ delimiter?, includeSubtasks?, columns? }` — runs immediately, returns the job (completed or failed) |
| GET    | `/exports`             | List past export jobs, newest first                     |
| GET    | `/exports/:id`         | One job's status/detail                                 |
| POST   | `/exports/:id/retry`   | Re-run a failed (or any) job with its original config    |
| GET    | `/exports/:id/download`| Downloads the CSV (`text/csv`) for a `completed` job     |

CSV column semantics (`src/csv/csv-generator.ts`) are a direct port of the
frontend's `ExportManagerView.downloadCsv` — same headers, same
parent-story-then-subtask row layout, same priority-from-story-points rule
— so a Jira import mapping a user already has set up keeps working.

## Ownership

Same model as the other two domain services: api-gateway verifies the JWT
and forwards the user id as `X-User-Id`; `OwnerGuard` (`src/auth/`)
requires that header on every controller here. Every job is scoped to its
`ownerId`, and `run()` forwards the job's own `ownerId` to
structure-client's `fetchReadyCards` so an export only ever pulls that
same user's Ready cards — without this, exporting could mix another
user's backlog into your CSV.

This service trusts whatever `X-User-Id` it's given rather than
re-verifying a JWT — fine behind api-gateway inside a docker-compose
network, not if this port is reachable from outside it.

## Local development

```bash
cp .env.example .env
npm install
npx prisma db push   # creates/syncs the export_jobs table (Prisma ORM, MySQL)
npm run start:dev
```

Requires a reachable MySQL/MariaDB instance (`DATABASE_URL` in `.env`) and
structure-service (`STRUCTURE_SERVICE_URL`, default `http://localhost:3003`).
Via the repo-root `docker-compose.yml`, both are provisioned automatically.

`prisma db push` syncs the schema straight from `schema.prisma`, no migration
history — fine for this PTI's dev/demo scope. Before any real production use,
switch to versioned migrations (`prisma migrate dev` locally to generate
them, `prisma migrate deploy` in CI/deploy).
