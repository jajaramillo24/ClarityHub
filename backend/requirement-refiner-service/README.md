# requirement-refiner-service

The one service in ClarityHub's backend that talks to an external AI
provider (Anthropic Claude). Rate limits, provider outages, and latency
spikes are expected here — that's exactly why this service sits behind
RabbitMQ instead of being called directly over HTTP: api-gateway sends a
message and applies its own timeout, so a slow or dead refiner degrades
gracefully instead of taking idea-board-service (or anything else) down
with it.

No database, no persisted state — pure request/response over the queue.

## Message patterns (RabbitMQ queue `requirement_refiner_queue`)

| Pattern                                    | Payload                                              | Returns                        |
|---------------------------------------------|-------------------------------------------------------|---------------------------------|
| `requirement_refiner.summarize_ideas`       | `{ ideas, attachments }`                              | Markdown summary (string)       |
| `requirement_refiner.analyze_risks`         | `{ nfrs }`                                             | Markdown risk report (string)   |
| `requirement_refiner.generate_nfrs`         | `{ summary, ideas }`                                   | `NFR[]`                          |
| `requirement_refiner.generate_cards`        | `{ summary, ideas, nfrs }`                             | `ProjectCard[]` (title+description only) |
| `requirement_refiner.generate_smart_card`   | `{ title, ideas, nfrs, options }`                      | `Partial<ProjectCard>` (full spec) |

`GET /health` is also exposed over plain HTTP for container healthchecks.

## Design notes

- **Structured outputs**: the three JSON-shaped calls (NFRs, cards, smart
  card) use Claude's structured outputs (`output_config.format` +
  `client.messages.parse()` with a Zod schema) instead of prompting for raw
  JSON and hand-parsing it — this is what the original frontend
  (`services/aiService.ts`, Gemini-based) had to do, and structured outputs
  removes an entire class of "model wrapped the JSON in prose" failures.
- **Retries**: `src/claude/retry.util.ts` retries rate limits, 5xx, and
  connection errors with exponential backoff (3 attempts by default) before
  giving up; 4xx errors fail immediately.
- **Document processing**: `.docx`/`.xlsx` text extraction (via `mammoth`
  and `xlsx`) was moved here from the frontend, since it only exists to feed
  the AI prompt. Images are passed to Claude as inline vision content
  instead.
- Types in `src/types.ts` mirror the frontend's `types.ts` by hand — there's
  no shared package across services yet (each is deployed independently).
  If the contract drifts, this is the file to check first.

## Local development

```bash
cp .env.example .env
npm install
npm run start:dev
```

Requires a reachable RabbitMQ instance (`RABBITMQ_URL`) and a valid
`ANTHROPIC_API_KEY`. Via the repo-root `docker-compose.yml`, RabbitMQ is
provisioned automatically.
