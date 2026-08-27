# idea-board-service

Owns ideas and file attachments captured during brainstorming. Pure CRUD, no
external AI dependency — this is the one service in ClarityHub's backend
that is expected to keep working even if every other service (including
RabbitMQ and requirement-refiner-service) is down.

## Data model

- `Idea`: `id`, `content`, `category?`, `createdAt`, `updatedAt`
- `Attachment`: `id`, `name`, `mimeType`, raw bytes (decoded from the
  base64 payload the frontend already sends), `createdAt`

## API

| Method | Path              | Notes                                             |
|--------|-------------------|----------------------------------------------------|
| GET    | `/health`         | Liveness check                                     |
| GET    | `/ideas`          | List ideas                                         |
| POST   | `/ideas`          | `{ content, category? }`                           |
| PATCH  | `/ideas/:id`      | Partial update                                      |
| DELETE | `/ideas/:id`      |                                                     |
| GET    | `/attachments`    | List metadata only (no base64, keeps payload small)|
| GET    | `/attachments/:id`| Metadata **and** base64 content                     |
| POST   | `/attachments`    | `{ name, mimeType, base64 }`                        |
| DELETE | `/attachments/:id`|                                                     |

## Local development

```bash
cp .env.example .env
npm install
npm run start:dev
```

Requires a reachable PostgreSQL instance matching the `.env` values
(`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`). Via the
repo-root `docker-compose.yml`, this is provisioned automatically as
`idea-board-db`.
