# The api

`packages/apps/api` is Sentinel's only backend: a Fastify + TypeORM service (ESM, run with
`vite-node`, no build step) that fronts AI provider accounts behind **pools** and adds failover. It
serves whoever holds one of the API keys it issued, and the operators who configure it from the web.
Read [../AGENTS.md](../AGENTS.md) first for the data flow.

The HTTP host is **[`@pollium/readable`](https://github.com/Pollium/Readable)** from npm — `ModuleDiscovery`,
`BaseController`, `BaseGateway`, `BaseModel`, `SecretCipher`, JWT and passwords. Import it as
`@pollium/readable/...`; never re-declare a second copy here.

## The 10-second model

```
src/core/          # createApp: readable Application + @fastify/websocket
src/shared/        # config (every env read) and cipher (SecretCipher on ENCRYPTION_KEY)
src/modules/
    operators/     # Operator; OperatorRoute / OperatorSocketRoute guards, @CurrentOperator; list, remove
    auth/          # first-operator setup, sign-in, the account under /tower/me (rename, change password)
    invitations/   # Invitation; invite by link, list, revoke, preview and accept
    keys/          # ApiKey; authenticateClient(), the secret helpers (utils/)
    providers/     # the pool: Provider/Usage/Failure, activeProviders(), pickProvider(), ProviderHealth,
                   # ProviderExecutor, UsageRecorder, FailureRecorder, InFlight
    chat/          # POST /v1/chat/completions — OpenAI-compatible, streaming
    voice/         # /v1/speak, /v1/listen, /v1/models — Deepgram-compatible
    search/        # GET /res/v1/llm/context — Brave-compatible
    admin/         # /tower/* — what the web reads and writes — and the /tower/live socket
scripts/invite.ts  # pnpm --filter @sentinel/api invite <email> prints ${WEB_URL}/invitations/<token>
```

Each error table is declared in `@sentinel/contracts/<domain>/errors` and bound in the module that
throws it (`contracts/domain/errors.ts`): `Pool` and `Provider` in providers, `ApiKey` in keys,
`Operator`, `Invitation`, `Auth` in auth; readable's own `AuthError` throws the same `Unauthorized`.
The web's error copy is keyed by the same codes, so a new failure is a new cause in a table, never a
new string.

`GET /health` is mounted by readable `Application`. A new kind is a new module with a
`controllers/` default export — no registry line. A controller mounts under `/<module>`; the
`/tower/*` ones declare `@Controller('/tower')`. Vendor paths live at the root and send the vendor
body from an overridden `register()` (see `chat/controllers/Chat.ts`). The `/tower/*` routes keep
the `{ data }` envelope; the web unwraps it through `@pollium/readable-react`.

**There is no pool entity.** A pool is just "the active providers of a kind", read by
`activeProviders(kind)`. Nobody configures pools; operators configure providers.

## Accounts

- `Operator` is the only account. `OperatorRoute` reads the bearer token (`bearerPrincipal`, which
  checks the session cutoff), then loads the `Operator` row on every request — a removed operator
  answers `Auth::Unauthorized` at once. It sets `req.operator`; read it with `@CurrentOperator()`.
  `OperatorSocketRoute` does the same for `/tower/live`, where the token rides the websocket
  subprotocol.
- Setup creates the first operator inside an advisory lock and answers `Auth::SetupClosed` once
  one exists. Sign-in is limited to 5 a minute per address.
- Changing the password and removing an operator call `sessionCutoffs.cut()`: every older token
  stops working, and an open socket closes with `SocketClose.AccessRevoked` (4403,
  `@pollium/readable-contracts/gateway`) at the next 30-second re-check. A socket whose token reaches
  its `exp` closes with `SocketClose.SessionExpired` (4401) at that moment. A re-check that cannot run (Redis or
  Postgres down) closes with 1011 instead, which the console reconnects on. The password change
  returns a fresh session for the caller.
- Invitations expire after 7 days and only the sha256 of the token is stored. Inviting the same
  email again replaces the pending link; accepting one for an existing operator resets that
  operator's password and cuts their sessions. An expired or used link answers
  `Invitation::NotFound`.
- `passwordHash`, `tokenHash`, `keyHash` and `encryptedApiKey` are `@Hidden`, so no
  response carries them.

## The admin surface the web drives

`AdminController` mounts `/tower/*` behind `OperatorRoute`. A client API key only proxies traffic;
it cannot reconfigure anything. Provider keys are encrypted on the way in. Every `@Body()` is
validated by typia at the edge (`Request::ValidationFailed`), so services trust their input.

## The proxy contract

Every inbound route speaks a **vendor protocol**, so a client needs no special SDK — it points its
base URL at the api:

| Kind | Ingress path | Vendor shape | Client auth | Provider auth |
|---|---|---|---|---|
| chat | `POST /v1/chat/completions` | OpenAI | `Authorization: Bearer <apiKey>` | `Authorization: Bearer <providerKey>` |
| voice | `POST /v1/speak`, `POST /v1/listen`, `GET /v1/models` | Deepgram | `Authorization: Token <apiKey>` | `Authorization: Token <providerKey>` |
| search | `GET /res/v1/llm/context` | Brave | `X-Subscription-Token: <apiKey>` | `X-Subscription-Token: <providerKey>` |

`authenticateClient()` hashes whatever the caller presented and looks for a live `ApiKey` with that
`keyHash` — there is no shared ingress secret, and a revoked or deactivated key answers
`ApiKey::Unauthorized` on the next request. Keys are issued as `snt_…`; any older secret still
authenticates by its hash. The row it returns is what `UsageRecorder` attributes the request to.
Provider keys are decrypted just in time from `Provider.encryptedApiKey`.

Chat is streamed (`runStream` — SSE passes through byte-identical and the final `usage` chunk is
tapped for accounting, cached prompt tokens included). Voice and search are buffered (`runBuffered`
via `bufferedProxyHandler`). `UPSTREAM_FIRST_BYTE_TIMEOUT_MS` bounds the wait for the first byte
of a streamed completion and of every voice and search answer; a completion that is not streamed
sends its first byte when it is whole, so it waits as long as it takes.

## Accounting, which the dashboard is made of

`usageRecorder.record()` writes one `Usage` row per request: tokens (input, cached, output),
latency, status, the provider, the key — and `costUsd`, priced at write time from the provider's
own `models[]` through `costOfTokens` (`@sentinel/contracts/providers/pricing`). Voice and search
carry no tokens, so they cost 0. Both proxies record through that one method, and it logs a failed
write instead of throwing: by then the upstream has served the request, so losing the row must not
turn the caller's answer into a 500. A provider that fails an attempt the request then fails over
from (no answer, a retryable status, an unreadable body, a `402`) leaves a `Failure` row instead,
through `failureRecorder`, with the caller's key and model and the cause. A refusal over content
policy leaves none. `Usage` is what callers were answered; `Failure` is what each upstream got
wrong on the way.

The web reads both through `UsageSliceService`: one slice of a window (totals, the same span just
before it, days, weekday hours, latency median, slowest 5% and spans, failures by cause, and the
share of every provider, model and key), whole for `/tower/overview` or narrowed to one provider,
model or key for `/tower/providers/:id/usage`, `/tower/models/:model/usage` and
`/tower/keys/:id/usage`. Timestamps are UTC without a zone,
so bounds go to Postgres as ISO strings, never as `Date`s the driver would shift to local time.
`InFlight` counts what is open right now: `trackInFlight(reply)` increments and the reply's
`close` event decrements, which is why a stream stays counted until its last byte.

## Live, which the web watches

`TowerGateway` (`admin/gateways`) is `/tower/live`, operators only, mounted at the channel of
`towerGateway`, the `gateway<TowerFrames, TowerMessages>` contract in `@sentinel/contracts/live/gateway`
that also names each window's room. A socket sends
`tower.watch { window }`, gets the overview back and joins that window's room. Every
`usageRecorder` write emits `providers.usage.recorded` (and every `failureRecorder` write,
`providers.failure.recorded`); each process recomputes only the windows its own sockets watch,
through `OverviewPushes` (a burst folds into one push `OVERVIEW_PUSH_INTERVAL_MS` later, never two
recomputes of a window at once), and sends `tower.overview`. The live minutes (the last 30, each
with requests, errors, failed attempts, tokens, the slowest 5% and the requests open on average)
slide with the clock, so a watched window that still holds recent traffic or an open request is
pushed again every `LIVE_REFRESH_MS` until it goes quiet. `ProviderHealth` emits
`providers.health.changed` on every transition and the web merges it into the providers lists; the
cooldown ends on screen at `cooldownUntil`. The bus crosses processes over Redis; health itself
stays per process.

## Failover, the load-bearing behaviour

`ProviderExecutor` picks with `pickProvider()` (uniformly at random among the eligible), and
loops: a provider is skipped when excluded this request or cooling down. **Retryable** outcomes
advance to the next provider: network failure, and statuses `401 403 404 408 429 5xx`. Any other
status is returned to the caller as-is. For buffered kinds a body-read failure also fails over.
A retryable answer whose body is a content-policy refusal ("refused to process this request…") is
about the request, not the provider: it still moves on to the next provider, but nothing is
recorded against the one that refused, and when no other is left the refusal itself goes back to
the caller instead of `Pool::NoHealthyProvider`.
A `402` means the account is out of credits: the request moves on and that provider rests for ten
minutes at once (`recordOutOfCredits`), which the web shows as "Out of credits". Several accounts
of one vendor are a pool that way.
These are return values inside the executor, not errors — only the caller's own disconnect
propagates, and its abort listener is removed once each attempt settles. `ProviderHealth` cools a
provider after 3 consecutive failures for 30s. Once no eligible provider remains,
`Pool::NoHealthyProvider` (503); when a kind has none active at all, `Pool::NoProvider` (503).
Every skip is logged with the provider and the reason — without it a misconfigured upstream reads
as an outage, since the 503 the caller sees names nothing.

Chat routes filter providers to those whose `models` list contains the requested id first, and
rewrite the model through the provider's `modelMap` on the way out.

## Verify your work

- `pnpm typecheck`, `pnpm lint`, `pnpm test` must pass. Tests run against the sentinel-dev
  Postgres on 5443 (`pnpm infra`); see [testing.md](testing.md).
- Upstreams are never real in tests. `tests/fake-upstream.ts` boots a local Fastify that scripts
  responses and records every call (url, headers, body) — point seeded providers' `baseUrl` at it.
  Proxy tests need a `seedApiKey()` — a request with no live key never reaches a provider.

## Do NOT

- **Don't add a second `SecretCipher`, `BaseModel`, or error factory** — they live in
  `@pollium/readable`.
- **Don't parse or reshape streamed chat bytes** — the SSE passthrough must stay byte-identical;
  only tap for `usage`.
- **Don't store provider keys in plaintext** — always `SecretCipher.encrypt` on write, decrypt at
  call time. Client API keys are the other way round: only their sha256 is stored, so the secret is
  shown exactly once, when the web issues it. Invitation tokens are stored the same way.
- **Don't reintroduce a shared ingress secret.** Every client authenticates with a key row that an
  operator can revoke.
- **Don't trust a token alone** for an operator route — the guard loads the `Operator` row on every
  request, so a removal applies at once. Keep it that way.
