# idea-board-service

Owns ideas and file attachments captured during brainstorming. Pure CRUD, no
external AI dependency — this is the one service in ClarityHub's backend
that is expected to keep working even if every other service (including
RabbitMQ and requirement-refiner-service) is down.

## Data model

- `Idea`: `id`, `projectId`, `content`, `category?`, `createdAt`, `updatedAt`
- `Attachment`: `id`, `projectId`, `name`, `mimeType`, raw bytes (decoded from
  the base64 payload the frontend already sends), `createdAt`

Every row belongs to exactly one `projectId` (an api-gateway project) and
every query is scoped to it — see "Ownership" below.

## API

Every route below requires an `X-Project-Id` header — see "Ownership".

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

## Ownership

This service never verifies a JWT itself — api-gateway does that
(`JwtAuthGuard`) and also checks the requested project actually belongs to
the caller (`ProjectGuard` in api-gateway) before forwarding it as
`X-Project-Id` on every proxied request (`ProxyService.forward`). The
`ProjectGuard` here (`src/auth/`), applied to every controller in this
service, just requires that header and attaches it as `projectId`; every
service method filters or writes with it, including lookups by id
(`findFirst`, not `findUnique`), so a request for an idea/attachment from
a different project 404s instead of leaking it. A user can own several
projects — see the note in the repo root `ARCHITECTURE.md`.

This also means this service trusts whatever `X-Project-Id` it's given —
it doesn't re-verify anything itself, so anyone who can reach this
service's port directly (not just through api-gateway) can claim any
project id. Fine for local/PTI scope inside a docker-compose network;
don't expose this port publicly beyond that without adding real
verification here too.

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
