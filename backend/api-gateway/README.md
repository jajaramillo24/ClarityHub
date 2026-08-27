# api-gateway

Single entry point the frontend talks to. Two jobs only — it holds no
business logic and no database of its own:

1. **Transparent reverse proxy** (`src/proxy/`) for the three REST-backed
   services — `/ideas*` and `/attachments*` → idea-board-service, `/cards*`
   → structure-service, `/exports*` → jira-exporter-service. Same path,
   same method, same body; the response (status, content-type, body) is
   piped straight back, which is what lets jira-exporter-service's CSV
   download pass through unchanged.
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
| `/ideas*`            | idea-board-service                  |
| `/attachments*`      | idea-board-service                  |
| `/cards*`             | structure-service                   |
| `/exports*`           | jira-exporter-service               |
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
