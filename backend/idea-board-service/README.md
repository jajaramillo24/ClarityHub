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

## Persistence

Prisma ORM (`prisma/schema.prisma`) against MySQL, via the `@prisma/adapter-mariadb`
driver adapter — Prisma 7 requires an explicit driver adapter rather than
letting `PrismaClient` open the connection straight from the schema's
`datasource` block (see `src/prisma/prisma.service.ts`). `prisma7.config.ts`
is only used by the Prisma CLI itself (`prisma db push`, `prisma generate`),
not by the running application.

`npm install` runs `prisma generate` automatically via a `postinstall`
script, so the generated client is always in sync with `schema.prisma`.

## Local development

```bash
cp .env.example .env
npm install
npx prisma db push   # creates/syncs the ideas and attachments tables
npm run start:dev
```

Requires a reachable MySQL/MariaDB instance matching `DATABASE_URL` in
`.env`. Via the repo-root `docker-compose.yml`, this is provisioned
automatically as `idea-board-db`.

`prisma db push` syncs the schema straight from `schema.prisma`, no migration
history — fine for this PTI's dev/demo scope. Before any real production use,
switch to versioned migrations (`prisma migrate dev` locally to generate
them, `prisma migrate deploy` in CI/deploy).
