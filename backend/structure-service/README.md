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

- `ProjectCard`: `id`, `title`, `description`, `acceptanceCriteria[]`,
  `totalStoryPoints`, `justification`, `labels[]`, `risks[]`,
  `status` (`Draft`/`Ready`/`Exported`), `subtasks[]`
- `Subtask`: `id`, `title`, `type` (`Backend`/`Frontend`/`Testing`/`DevOps`/`Docs`),
  `storyPoints`, `completed`, belongs to one `ProjectCard` (cascade delete)
- `Nfr`: `id`, `category`, `title`, `description`, `impactLevel` (`Low`/`Medium`/`High`)

`acceptanceCriteria`/`labels`/`risks` are stored as JSON arrays (MySQL has
no native array type like Postgres does) — the API contract (`string[]`
in/out) is unchanged.

## API

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
