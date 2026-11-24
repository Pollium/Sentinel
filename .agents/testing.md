# Testing

The suites are **Vitest** running through each package's `vite.config.ts` — the same plugins and
transforms the api runs with. Tests live in `packages/apps/api` (the HTTP, proxy and socket
behaviour); the framework is tested in its own repo. The web and ui have no test stack.

## Why Vitest is load-bearing, not a preference

`@Body()` validation does not exist in the source: the `autoValidateBody` plugin injects
`typia.misc.createValidatePrune<T>()` at build time and `@typia/unplugin` compiles it
(`packages/apps/api/vite.config.ts`). Vitest executes tests through that same pipeline, so a test
exercises the exact code production runs. **Do not introduce Jest, `node:test`, or a `tsx`-based
runner** — under any of them controllers run with `@Body()` unvalidated and the suite tests a
different app than the one deployed.

## Running

```
pnpm infra                          # sentinel-dev Postgres on 5443 (and Redis on 6390)
pnpm test                           # every package's suite, one package at a time
cd packages/apps/api && npx vitest run src/modules/chat/tests/ChatProxy.test.ts
```

Run Vitest inside the package; from the repo root it picks up every config at once.

The database is the **sentinel-dev Postgres** — the same engine dev and deploy run on. Each Vitest
pool slot gets its own schema (`api_test_1`, `api_test_2`, … from `VITEST_POOL_ID`), dropped and
created by `tests/setup.ts` and selected through `DATABASE_SCHEMA`, so files run in parallel and
**never touch the `public` schema your dev data lives in**. `resetDb` truncates every table in that
schema before each test; the harness refuses to run when the schema is missing or `public`.

`vite.config.ts` raises `hookTimeout` to 60s: `useApp()`'s `beforeAll` builds the whole app
(discovery, every controller through the typia transform, `DataSource` init), and on a cold typia
cache (`node_modules/.cache/unplugin_typia`) that exceeds the 10s default. The symptom looks like a
hanging test; it is a one-time compile.

**No test contacts Redis.** Under Vitest the event bus dispatches in-process only, the session
cutoff store is replaced by the in-memory one in `tests/session-cutoffs.ts`
(`vi.mock` in `tests/setup.ts`), and the rate-limit store is stubbed to count every hit as the
first.

## Layout

```
packages/apps/api/
    tests/                      # infrastructure, imported via the @tests alias
        setup.ts                # env, the per-slot schema, the session-cutoff and rate-limit stubs
        harness.ts              # useApp(): builds the app once per file; resets the DB, providerHealth,
                                # the completion ceiling and the session cutoffs before every test
        operators.ts            # seedOperator(), tokenFor(), tokenIssuedEarlier(), bearer(), OPERATOR_ID
        seed.ts                 # seedProvider(), seedApiKey() (CLIENT_SECRET), seedUsage(), seedFailure(), pricedModel()
        fake-upstream.ts        # a local Fastify that scripts upstream responses and records every call
        wait-for-usage.ts       # waitForUsage() / waitForFailure(): the rows are written after the reply
        session-cutoffs.ts      # keeps readable's session cutoffs in memory
    src/modules/<name>/tests/   # the module's suites (*.test.ts)
```

**Never put a `.test.ts` inside `controllers/`, `models/` or `gateways/`** — discovery imports every
file there.

## The main layer: HTTP through the full app

Controllers are declarative and services use Active Record, so the behaviour worth testing lives in
the composition: guard → parameter decorators → service → envelope. A suite is `useApp()` once, then
per test seed → `request()` → assert:

```ts
import Operator from '../models/Operator';
import { expectError, request } from '@pollium/readable/testing/request';
import { operatorRoutes } from '@sentinel/contracts/operators/routes';
import { useApp } from '@tests/harness';
import { seedOperator } from '@tests/operators';
import { describe, expect, it } from 'vitest';

describe('OperatorController', () => {
    const ctx = useApp();

    it('requires a token', async () => {
        expectError(await request(ctx.app, operatorRoutes.list), 401, 'Auth::Unauthorized');
    });

    it('removes another operator', async () => {
        const actor = await seedOperator();
        const removed = await seedOperator();

        const res = await request(ctx.app, operatorRoutes.remove, { as: actor.id, params: { operatorId: removed.id } });

        expect(res.status).toBe(204);
        expect(await Operator.existsBy({ id: removed.id })).toBe(false);
    });
});
```

- **`useApp()`** owns the lifecycle. The returned context is filled in `beforeAll`, so never
  destructure it in the describe body — read `ctx.app` inside tests. Vitest isolates each file in
  its own process, so each file has its own app.
- **`request(app, endpoint, { as, body, params, query, headers })`** takes a contracts route-table
  row, interpolates `params` into `:name` segments, signs a real JWT for `as`, and returns
  `{ status, body, json(), data() }` with `data()` typed by the endpoint. `OperatorRoute` loads the
  operator on every request, so `as` must be a seeded operator's id; a token for anyone else answers
  `401 Auth::Unauthorized`. `tokenIssuedEarlier(id)` signs a token from a minute ago, for asserting
  that a session cutoff refuses it.
- **`expectError(res, status, 'Domain::Cause')`** is the error assert.
- **Auth is never mocked** — tokens are real, guards run for real.
- **The vendor paths have no route row.** Proxy suites call `ctx.app.inject` with the vendor's
  headers, start a `FakeUpstream` in `beforeAll`, point `seedProvider(kind, { baseUrl })` at it, and
  `seedApiKey()` before each test — a request with no live key never reaches a provider.
- **The socket** is exercised with `app.injectWS(towerGateway.channel, { headers })`, the token in
  `sec-websocket-protocol` (`admin/tests/TowerGateway.test.ts`). Fake timers move it past
  `REAUTHORIZE_MS`.

What belongs here: status codes and envelopes (`{ data }`, `204`, `{ error, errors }`), guards
(401), parameter rejections (`Request::InvalidId`, `Request::ValidationFailed`), domain rules
(setup closed, remove yourself, an expired link), DB effects (assert with the model), and on the
proxy side what the upstream received, what the caller got back, and the `Usage`/`Failure` rows.

## The other layers

- **Pure services** (`pickProvider`, `ProviderHealth`, `UsageRecorder`, `OverviewPushes`): plain
  unit tests in the module's `tests/`.

## Do NOT

- **No mocking of TypeORM models or repositories** — that fights Active Record; use the real
  database.
- **No supertest / no `listen()`** — `app.inject()` (through `request()`) covers HTTP.
- **No real upstreams** — every provider in a test points at a `FakeUpstream`.
- **No Redis in tests** — the stubs in `tests/setup.ts` keep the suite offline; don't add a test
  that needs the dev Redis.
- **No second database engine** — the suite runs on Postgres 18, the engine dev and deploy run on.
- **Never point `DATABASE_SCHEMA` at `public` in tests** — `resetDb` truncates every table in the
  configured schema, so that would wipe your dev database. The harness throws instead.
- **No per-test lifecycle boilerplate** — `useApp()` owns beforeAll/afterAll/beforeEach.
- **No hand-built envelopes or raw error strings in assertions** — assert the wire shapes exactly as
  contracts define them.
- **No grep of the repo as an assert.** That tests the test.
- **One typia `Request::ValidationFailed` per handler**, not one per field.
