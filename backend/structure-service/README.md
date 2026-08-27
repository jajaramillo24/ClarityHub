# structure-service

Owns the backlog hierarchy: epics/stories (`ProjectCard`) and their
`Subtask`s. Pure persistence — it never talks to requirement-refiner-service
or RabbitMQ directly. Whoever generated content via AI (api-gateway, after
calling requirement-refiner-service) hands the *already generated* result to
this service through its own REST API, matching the brief's "consumes
results already generated; does not depend on the refiner being up".

## Data model

- `ProjectCard`: `id`, `title`, `description`, `acceptanceCriteria[]`,
  `totalStoryPoints`, `justification`, `labels[]`, `risks[]`,
  `status` (`Draft`/`Ready`/`Exported`), `subtasks[]`
- `Subtask`: `id`, `title`, `type` (`Backend`/`Frontend`/`Testing`/`DevOps`/`Docs`),
  `storyPoints`, `completed`, belongs to one `ProjectCard` (cascade delete)

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

## Local development

```bash
cp .env.example .env
npm install
npm run start:dev
```

Requires a reachable PostgreSQL instance matching `.env`. Via the
repo-root `docker-compose.yml`, provisioned automatically as `structure-db`.
