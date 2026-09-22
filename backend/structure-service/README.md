# structure-service

Owns the backlog hierarchy: epics/stories (`ProjectCard`) and their
`Subtask`s — plus Non-Functional Requirements (`Nfr`). Pure persistence —
it never talks to requirement-refiner-service or RabbitMQ directly.
Whoever generated content via AI (api-gateway, after calling
requirement-refiner-service) hands the *already generated* result to this
service through its own REST API, matching the brief's "consumes results
already generated; does not depend on the refiner being up".

NFRs live here rather than in their own service: they're a small,
tightly-coupled input to the backlog hierarchy (estimation and card
generation both read them) with no independent lifecycle of their own, so
a dedicated service + database for one entity wasn't worth the extra
moving part.

## Data model

- `ProjectCard`: `id`, `ownerId`, `title`, `description`, `acceptanceCriteria[]`,
  `totalStoryPoints`, `justification`, `labels[]`, `risks[]`,
  `status` (`Draft`/`Ready`/`Exported`), `subtasks[]`
- `Subtask`: `id`, `title`, `type` (`Backend`/`Frontend`/`Testing`/`DevOps`/`Docs`),
  `storyPoints`, `completed`, belongs to one `ProjectCard` (cascade delete) —
  no `ownerId` of its own, scoped via its parent card's
- `Nfr`: `id`, `ownerId`, `category`, `title`, `description`, `impactLevel` (`Low`/`Medium`/`High`)

`ProjectCard` and `Nfr` each belong to exactly one `ownerId` — see
"Ownership" below.

`acceptanceCriteria`/`labels`/`risks` are stored as JSON arrays (MySQL has
no native array type like Postgres does) — the API contract (`string[]`
in/out) is unchanged.

## API

Every route below requires an `X-User-Id` header — see "Ownership".

| Method | Path                          | Notes                                          |
|--------|-------------------------------|--------------------------------------------------|
| GET    | `/health`                     | Liveness check                                    |
| GET    | `/cards?status=Ready`         | List cards, optional status filter (used by jira-exporter-service) |
| POST   | `/cards`                      | `{ title, description? }` — create a Draft card   |
| POST   | `/cards/bulk`                 | `{ cards: [{ title, description }] }` — batch create (AI-generated epic list) |
| PATCH  | `/cards/:id`                  | Partial update — manual edits or applying AI-generated smart-card fields |
| DELETE | `/cards/:id`                  | Cascades to its subtasks                          |
| POST   | `/cards/:id/subtasks`         | `{ title, type, storyPoints }`                    |
| PATCH  | `/cards/:id/subtasks/:subtaskId` | Partial update, including toggling `completed` |
| DELETE | `/cards/:id/subtasks/:subtaskId` |                                                 |
| GET    | `/nfrs`                       | List NFRs                                          |
| POST   | `/nfrs`                       | `{ category, title, description?, impactLevel }`  |
| POST   | `/nfrs/bulk`                  | `{ nfrs: [...] }` — batch create (AI-generated NFR list) |
| DELETE | `/nfrs/:id`                   |                                                     |

## Ownership

Same model as idea-board-service: api-gateway verifies the JWT and
forwards the user id as `X-User-Id`; `OwnerGuard` (`src/auth/`) requires
that header on every controller here and every query is scoped to it
(lookups by id use `findFirst`, so someone else's card/NFR id 404s).
`jira-exporter-service` also calls this service directly
(`GET /cards?status=Ready`) and forwards the same header it received from
the gateway, so an export only ever sees its own user's Ready cards.

This service trusts whatever `X-User-Id` it's given rather than
re-verifying a JWT — fine behind api-gateway inside a docker-compose
network, not if this port is reachable from outside it.

## Local development

```bash
cp .env.example .env
npm install
npx prisma db push   # creates/syncs the tables (Prisma ORM, MySQL)
npm run start:dev
```

Requires a reachable MySQL/MariaDB instance matching `DATABASE_URL` in
`.env`. Via the repo-root `docker-compose.yml`, provisioned automatically
as `structure-db`.

`prisma db push` syncs the schema straight from `schema.prisma`, no migration
history — fine for this PTI's dev/demo scope. Before any real production use,
switch to versioned migrations (`prisma migrate dev` locally to generate
them, `prisma migrate deploy` in CI/deploy).
