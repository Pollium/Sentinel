# Adding a module

A module is a folder under `packages/apps/api/src/modules/`. Drop default-exported classes into
the category folders and `discoverFrom(import.meta.url)` (`src/core/Application.ts`) finds them at
boot — there is no registry to edit.

## The category folders (all optional)

```
src/modules/<name>/
    controllers/   # default-export class extends BaseController → its routes are mounted
    models/        # default-export TypeORM entity extends BaseModel → registered on the DataSource
    gateways/      # default-export class extends BaseGateway → a WebSocket channel at its @Channel path
    services/      # business logic, imported by controllers and gateways (NOT discovered);
                   # may nest by concept (providers/services/pool/, providers/services/proxy/)
    middlewares/   # module-owned guards and parameter decorators (NOT discovered)
    utils/         # pure helpers (NOT discovered)
    contracts/
        domain/    # the module's error binding and internal types (event payloads, service results)
        types/     # .d.ts augmentations (EventMap, FastifyRequest)
    tests/         # the module's Vitest suites (NOT discovered)
```

Only `controllers/`, `models/` and `gateways/` are scanned, and only their files' **default
export** is picked up. `ModuleDiscovery` does not recurse, so those three stay flat. Wire types,
route tables and error tables the web also reads live in `@sentinel/contracts/<domain>`, never in
the module.

## The real example: `operators`

**Entity** — `models/Operator.ts`. Extend `BaseModel` (`id` as `uuidv7()`, `createdAt`,
`updatedAt`, and a `toJSON` that drops `@Hidden` columns):

```ts
@Entity()
export default class Operator extends BaseModel{
    @Column({ type: 'varchar', unique: true })
    email!: string;

    @Column('varchar')
    @Hidden()
    passwordHash!: string;
}
```

**Errors** — the table is `OperatorErrors` in `@sentinel/contracts/operators/errors`; the module
binds it once in `contracts/domain/errors.ts`:

```ts
export const OperatorError = defineErrors(OperatorErrors);
```

**Service** — `services/Operator.ts` holds the rules and throws the bound factories:

```ts
export default class OperatorService{
    async remove(actorId: string, operatorId: string){
        if(actorId === operatorId) throw OperatorError.RemoveSelf();

        const operator = await findOrThrow(Operator, { id: operatorId }, OperatorError.NotFound);
        await sessionCutoffs.cut(operator.id);
        await operator.remove();
    }
}
```

**Controller** — `controllers/Operator.ts` translates HTTP to the service and nothing more. Each
`@Route` takes a row of the contracts' route table and mounts at its path; `@Middleware` on the
class guards every route:

```ts
@Middleware(OperatorRoute)
export default class OperatorController extends BaseController{
    #service = new OperatorService();

    @Route(operatorRoutes.remove)
    remove(@CurrentOperator() actor: Operator, @IdParam('operatorId') operatorId: string){
        return this.#service.remove(actor.id, operatorId);
    }
}
```

No registration step: `pnpm typecheck`, restart the api, and `DELETE /tower/operators/:operatorId`
exists.

## Conventions the example encodes

- **Return raw domain data** from handlers (an entity, an array, an object). `BaseController` wraps
  it as `{ data: ... }`; returning nothing answers `204`. Use `@Status(201)` for a create. Never
  build the envelope yourself — except on the vendor paths, which send the vendor's own body from
  an overridden `register()` (`chat/controllers/Chat.ts`).
- **Handlers declare their inputs** with parameter decorators — `@Body()`, `@IdParam('id')` (a
  uuid, `Request::InvalidId` otherwise), `@Param('kind')`, `@Query('window')`,
  `@CurrentOperator()` — and never read `req`. Every `@Body()` is validated against its type by
  typia at build time (`autoValidateBody`), so the service trusts its input.
- **Throttle a public route** with `@RateLimit({ max, window })` (sign-in has 5 a minute).
- **Cross-module calls** go through the other module's service or model, never over HTTP.
- **Events**: declare the payload in `contracts/domain/events.ts`, add the key to the global
  `EventMap` in `contracts/types/events.d.ts`, `eventBus.emit('module.resource.action', payload)`
  where it happens and `eventBus.on(...)` where it matters (`admin/gateways/TowerGateway.ts`
  listens to `providers.usage.recorded`). Delivery is best-effort: a failing handler is logged,
  never retried, and the emitter never waits.
- **A websocket channel** is a `gateways/` class with `@Channel(path)` and `@Middleware(guard)`;
  `@OnMessage('type')` handlers take `@Payload()`, `@Socket()` and `@CurrentUser()`, and their
  return value is sent back as `{ type, data }`. Rooms live on `this.connections`.

## Anti-patterns (do NOT do these)

- **No `index.ts` / registry** per module. Discovery is by folder.
- **No business logic in controllers** — delegate to a service.
- **No `throw new Error`** in a request path — throw a factory from `defineErrors`.
- **No reading `process.env`** — add the key to `src/shared/config.ts` and read it there.
- **No `.test.ts` inside `controllers/`, `models/` or `gateways/`** — discovery would import it.
