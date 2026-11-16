# Sentinel — agent guide

Sentinel is a self-hosted gateway in front of AI provider accounts. It pools the accounts of each
kind (OpenAI-compatible chat, Deepgram-compatible voice, Brave-compatible search), fails over
between them, and answers any client that presents one of the API keys it issued. Its web console
configures the providers, issues the keys and shows the traffic live. pnpm monorepo with two apps:

| Package | What it is | Port |
|---|---|---|
| `packages/apps/api` (`@sentinel/api`) | the only backend: the vendor paths clients call (`/v1/...`, `/res/v1/...`), the operator accounts, the `/tower/*` routes the console reads and writes, and the `/tower/live` socket | 8080 |
| `packages/apps/web` (`@sentinel/web`) | the console (React + Vite + HeroUI): overview, providers, models, API keys, operators | 5175 (https) |
| `packages/shared/readable` (`@sentinel/readable`) | the HTTP/WS framework: `Application`, module discovery, decorators, errors, `BaseModel`, JWT and passwords, `SecretCipher`, the Redis event bus | — |
| `packages/shared/contracts` (`@sentinel/contracts`) | every wire type, route table and error table, one folder per domain | — |
| `packages/shared/ui` (`@sentinel/ui`) | the console plumbing and components: api client (`call`), `useQuery`/`useMutation`, socket channel, session and theme stores, route discovery, the chrome | — |

Modules are auto-discovered from the filesystem by folder convention — there is no registry file
to edit. Modules talk to each other through services, models and `eventBus`; nothing in Sentinel
calls itself over HTTP.

## How data flows

```
client ──API key──▶ api /v1/... ──pick a healthy provider──▶ upstream   (next provider on a retryable answer)
                        └──▶ Usage / Failure row ──▶ eventBus ──▶ /tower/live ──▶ web
web ──/api──▶ api /tower/*   (operator JWT, ws /api/tower/live)
```

- The vendor paths sit at the root of the api host, because a client points its SDK's base URL at
  it. Publish the api port; the web is not in the clients' path.
- The web calls the api at `VITE_API_URL`, or at `${origin}/api` when it is empty. In dev the Vite
  proxy maps `/api` → 8080 (stripped, with the websocket); in the self-hosted stack
  `deploy/nginx.conf` does the same.
- Operators are the api's own accounts, email and password. The first one is created at `/setup`,
  which stays open only while no operator exists; the rest join by an invitation link, from the
  console or from the shell (`pnpm --filter @sentinel/api invite <email>`). Every operator can do
  everything.
- A password change or a removal writes `session:cutoff:<operatorId>` in Redis; a token issued
  before it is refused, and an open socket closes with 4403 at its next 30-second check, which
  signs that console out. A socket whose token expires closes with 4401 at the token's `exp`.
- `eventBus` is Redis pub/sub on `sentinel:events`, so every api replica hears it.

## Commands

```
pnpm infra                                    # Postgres :5443, Redis :6390 (compose project sentinel-dev)
pnpm dev                                      # infra + api (:8080) + web (https://localhost:5175)
pnpm --filter @sentinel/api test              # Vitest, inside the package
pnpm typecheck && pnpm lint && pnpm test      # the gates a change must pass
pnpm --filter @sentinel/web build             # tsc -b && vite build
docker compose up -d --build                  # the self-hosted stack: web on :8081, api on :8080
```

`pnpm dev` needs `packages/apps/api/.env`: copy `.env.example` and fill `ENCRYPTION_KEY`
(`openssl rand -hex 32`) and `JWT_SECRET`. The self-hosted stack reads the root `.env`
(`.env.example` beside it).

This file is a router, not a manual. Read the file that matches your task before writing code.

| If you are going to… | Read |
|---|---|
| Work in the api — modules, the proxy contract, failover, accounting, live, accounts | [.agents/api.md](.agents/api.md) |
| Add or change a backend module (controller, model, service, gateway) | [.agents/adding-a-module.md](.agents/adding-a-module.md) |
| Work in the web | [.agents/web.md](.agents/web.md) |
| Write or run tests | [.agents/testing.md](.agents/testing.md) |
| Know the quality bar — what not to write, comments included | [.agents/anti-slop.md](.agents/anti-slop.md) |

## Deploying

- `docker-compose.yml` is the self-hosted stack (Postgres, Redis, api, web behind nginx), configured
  from the root `.env`.
- `ENCRYPTION_KEY` encrypts every provider's key. Moving a database to a new stack means moving the
  key with it; with another key no provider decrypts and the pool serves nothing.
- Until an operator exists, anyone who reaches the api can claim the first account through setup.
  Create the owner right after the first boot.
- `WEB_URL` is where invitation links point.

## Things that will otherwise burn an hour

- **Vitest runs inside the package.** Running it from the repo root picks up every package's config
  at once. `cd packages/apps/api && npx vitest run`.
- **Never `tsc -b` in the api.** It sets no `outDir`; typecheck with `tsc --noEmit`.
  `tsc -b` is correct in `packages/apps/web` (its `build` script) and rebuilds the contracts' and
  ui's declarations the web reads from `packages/shared/{contracts,ui}/dist`.
- **After editing contracts**, clear the api's typia cache
  (`rm -rf packages/apps/api/node_modules/.cache/unplugin_typia`) and restart the web dev server.
- **`BaseModel` ids default to Postgres 18's `uuidv7()`.** The compose image is `postgres:18-alpine`;
  an older Postgres fails at `synchronize`.
- **Timestamps are `timestamp without time zone`.** Run the api in UTC: the api's `.env.example`
  sets `TZ=UTC` and the containers already are. On a laptop at UTC−3 a key used a moment ago
  otherwise reads "Used in 3 hours".
- **The dev api (`vite-node --watch`) can die with `EADDRINUSE`** after a file change. Restart
  `pnpm --filter @sentinel/api dev`.

Code style: 4-space indent, single quotes, semicolons, `if(` / `}else{` / `try{` / `}catch{`
with no space, `class Name extends Base{`, `interface Name{`, private `#fields`, no comments,
English identifiers and copy.
