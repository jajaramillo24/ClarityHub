# jira-exporter-service

Generates the Jira-import CSV from Ready cards. Fetches the backlog from
structure-service (`GET /cards?status=Ready`) rather than owning it — the
backlog itself is structure-service's data; this service only turns it into
a downloadable file.

## Data model

`ExportJob`: `id`, `status` (`pending`/`completed`/`failed`), `delimiter`,
`includeSubtasks`, `columns` (jsonb config), `cardCount`, `csvContent`
(kept so a completed job re-downloads without hitting structure-service
again), `errorMessage`.

Persisting jobs (rather than generating and forgetting) is what makes
"retry a failed export without losing the backlog" concrete: the backlog
lives in structure-service regardless of whether this service's last
attempt succeeded, and a failed job here just gets retried — no
regeneration of anything upstream.

## API

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

## Local development

```bash
cp .env.example .env
npm install
npm run start:dev
```

Requires a reachable PostgreSQL instance (`.env`) and structure-service
(`STRUCTURE_SERVICE_URL`, default `http://localhost:3003`). Via the
repo-root `docker-compose.yml`, both are provisioned automatically.
