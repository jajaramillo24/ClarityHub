# api-gateway

Single entry point the frontend talks to. It holds no business logic of
its own beyond two things — login and projects — plus two proxy jobs:

0. **Authentication & projects** (`src/auth/`, `src/projects/`) — its own
   `users` and `projects` tables (Prisma/MySQL, the only database this
   service owns). `POST /auth/register` and `POST /auth/login` return a
   JWT; `JwtAuthGuard` is registered globally (`APP_GUARD` in
   `app.module.ts`), so every route below requires
   `Authorization: Bearer <token>` by default, with `@Public()` opting out
   individually (`/auth/register`, `/auth/login`, `/health*`). A user can
   own several projects (`POST /projects`, `GET /projects`); the frontend
   picks one and sends it as `X-Project-Id` on every domain request, and
   `ProjectGuard` (`src/projects/project.guard.ts`, applied to the proxy
   controllers in point 1 — not `/projects` or `/auth` themselves) checks
   that project actually belongs to the caller before anything gets
   proxied downstream. See "Autenticación / autorización" in
   `ARCHITECTURE.md`.
1. **Transparent reverse proxy** (`src/proxy/`) for the three REST-backed
   services — `/ideas*` and `/attachments*` → idea-board-service, `/cards*`
   and `/nfrs*` → structure-service, `/exports*` → jira-exporter-service. Same path,
   same method, same body, plus the verified `X-Project-Id` header (from
   step 0); the response (status, content-type, body) is piped straight
   back, which is what lets jira-exporter-service's CSV download pass
   through unchanged.
2. **Protocol translation** (`src/ai/`) for requirement-refiner-service:
   `/ai/*` HTTP requests become RabbitMQ RPC calls
   (`requirement_refiner_queue`), bounded by a 45s timeout
   (`RefinerClientService`). This is the isolation boundary the brief
   requires — if the refiner or RabbitMQ is down or too slow, callers get a
   clean `503`/`504` instead of a hang, and every other route (idea-board,
   structure, jira-exporter) is completely unaffected since they're plain
   HTTP proxies with no dependency on RabbitMQ at all.

## API

| Path                | Forwards to                        |
|----------------------|-------------------------------------|
| `POST /auth/register` | Creates a user, returns `{ accessToken, user }` — public |
| `POST /auth/login`    | Verifies credentials, returns `{ accessToken, user }` — public |
| `GET /auth/me`        | Current user from the bearer token |
| `GET /projects`       | Lists the caller's own projects |
| `POST /projects`      | `{ name }` — creates a project owned by the caller |
| `/ideas*`            | idea-board-service (requires `X-Project-Id`) |
| `/attachments*`      | idea-board-service (requires `X-Project-Id`) |
| `/cards*`             | structure-service (requires `X-Project-Id`) |
| `/nfrs*`              | structure-service (requires `X-Project-Id`) |
| `/exports*`           | jira-exporter-service (requires `X-Project-Id`) |
| `POST /ai/summarize`  | requirement_refiner.summarize_ideas |
| `POST /ai/risks`      | requirement_refiner.analyze_risks   |
| `POST /ai/nfrs`       | requirement_refiner.generate_nfrs   |
| `POST /ai/cards`      | requirement_refiner.generate_cards  |
| `POST /ai/smart-card` | requirement_refiner.generate_smart_card |
| `GET /health`         | Gateway's own liveness              |
| `GET /health/services`| Pings every downstream service's `/health` and reports up/down per service — built for the "stop one container, show the rest still work" demo |

## Local development

```bash
cp .env.example .env
npm install
npm run start:dev
```

Requires the other four services (or at least the ones you're exercising)
and RabbitMQ reachable at the URLs in `.env`. Via the repo-root
`docker-compose.yml`, all of it is wired automatically.
