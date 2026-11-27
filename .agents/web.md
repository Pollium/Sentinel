# Web (`packages/apps/web`)

React 19 + Vite + HeroUI v3 (`@heroui/react`, theme from `@heroui/styles`) + Tailwind v4 utilities and
`lucide-react` icons. Copy is English, short and calm. The plumbing (calls, queries, mutations, pages and
their guards, the session, live data, error copy, the Vite config and the tsconfig) is
`@pollium/readable-react`, whose guide is `node_modules/@pollium/readable-react/AGENTS.md`; read it first.
The console's chrome and components come from `@sentinel/ui`; the app itself is the shell and three
modules.

## Layout of `src/`

```
main.tsx              mount({ name: 'sentinel', pages, layout, signIn, home, copy, wrap }) after the theme
app/                  layouts/TowerLayout (reads /tower/me, then the chrome), components/TowerNav ·
                      TowerTabBar · TowerJumpTo, navigation/items.ts (the header tabs and the phone tab bar)
assets/styles/        index.css: the whole theme (HeroUI import, tokens, light/dark, glass, chrome motion)
modules/<name>/       components/<Name>/index.tsx, hooks/use-*.ts, utils/*.ts, contracts/*.ts,
                      pages/{guest,public,protected}/**/{index,layout}.tsx
    auth/             sign-in, first-operator setup, invitation acceptance, the account menu, not found
    operators/        invite by link, the joined and invited lists
    tower/            overview, providers, models, API keys, and the live hooks
```

- **Pages are discovered** by readable-react. `modules/<m>/pages/guest/SignIn/index.tsx` is `/sign-in`;
  `pages/protected/Keys/[id]/index.tsx` is `/keys/:id`; folder names turn kebab-case. `guest` pages
  render outside the session (a signed-in visitor goes to `next`, or `/`), `protected` pages render
  inside `TowerLayout`, and a visitor without a session is sent to `/sign-in?next=`. `TowerLayout`
  reads `/tower/me` before it draws the chrome and hands the operator down as the `SessionOutlet`
  context (`@sentinel/ui/contracts/session`). A `layout.tsx` wraps its sibling pages through
  `<Outlet>` and passes them a typed context (`contracts/tower-outlet.ts`). An unknown path renders
  `auth/pages/public/*/index.tsx`, which readable-react turns into a `*` route ranked ahead of its own
  catch-all. Add the route to `app/navigation/items.ts` only when it belongs in the header tabs. There
  is no sidebar: the tabs sit in the header from `lg`, the jump box joins them from `xl`, and below
  `lg` the tab bar at the bottom takes over.
- **Data.** Components pass a contracts route-table row straight to readable-react: read with
  `useQuery(route, { path, query })` (a missing path param keeps it idle) and render it through
  `QueryState` (`@sentinel/ui/components/QueryState`, readable-react's states drawn in the console's
  looks); write with `useMutation(route, { path, invalidates })`. A mutation refreshes the queries on
  its branch of the path, so there is no `reload()` after it: a key's `PATCH` refreshes `/tower/keys`
  and the key's usage. The providers lists live at `/tower/kinds/:kind/providers`, off the branch of
  `/tower/providers/:id`, so the provider mutations name `invalidates: [providerRoutes.providers]`.
  Sign-in, setup, accepting an invitation and the password change go through `call()`, which
  refreshes nothing, and start the session with the token they answer: a refresh sent before
  `session.start` carries the old token, and its `401` would end the new session. A form is `useForm` from
  `@sentinel/ui/hooks/forms/use-form` with a `typia.createValidate<Input>()` validator and
  `submitErrorMessage`, submitting through a mutation. Wire types and routes come from
  `@sentinel/contracts/<domain>/**`. Never hard-code a URL, never fake data.
- **Live.** `useChannel(towerGateway, handlers, { join: ['tower.watch', { window }] })`
  (`@pollium/readable-react/live/useChannel`) shares one socket across components, reconnects with
  backoff and sends the join on every open. `useLiveOverview(window)` merges the pushed overview of
  its window into its query with `query.set`, and `useLiveProviders` merges each health change into
  the list of the provider's kind. A close with `SocketClose.SessionExpired` or `AccessRevoked` ends
  the session and the console goes back to sign-in.
- **Session.** readable-react's `session` keeps the token in `localStorage` under `sentinel.session`
  (theme `sentinel.theme`), and every tab follows it, so a token one tab rotates or drops reaches the
  others. A `401` with `Auth::Unauthorized` or `Auth::InvalidToken` ends the session. Sign out
  (`session.end()`) lives in the account menu (`auth/components/AccountMenu`).
- **Errors to copy.** Each module's `utils/error-copy.ts` is `copyFor(Table, { Cause: 'Sentence.' })`
  over the contracts error tables, joined with `.with(...)`: a cause without copy fails `tsc`. What a
  module does not name falls to `appCopy` (`@sentinel/ui/utils/format/app-copy`), given to `mount`,
  which has every readable code, `Clipboard::WriteBlocked`, and the copy for offline and unknown.
- **Style.** 4 spaces, single quotes (JSX attributes included), semicolons, `if(`/`}else{` with no
  space, `interface Name{`, `@/` imports inside the app and `@sentinel/ui/...` or
  `@pollium/readable-react/...` for the packages (no relative imports), kebab-case file names except
  `Component/index.tsx`, one default-exported component per file, no comments, no `!important`.
- **Look.** Calm and flat: gray selection, one-line rows, no badges or colour for decoration, glass
  (`glass-surface`) only on floating chrome. The header tabs are text only: the active page in the
  foreground colour, the rest muted, with no fill behind either. Reach for an `@sentinel/ui`
  component (`PanelGrid`, `PanelCell`, `ListGroup`, `ListRow`, `FactList`, `SplitView`,
  `PageToolbar`, `ConfirmDialog`, `CopyOnce`, …) before writing markup again.

## Checking your work

- `pnpm --filter @sentinel/web build` (`tsc --noEmit` over the web and the `contracts` and `ui`
  sources it reads, then `vite build`), `pnpm --filter @sentinel/web lint` (`oxlint --deny-warnings`),
  and `pnpm --filter @sentinel/ui typecheck`.
- The dev stack: the api on :8080 and the web on https://localhost:5175 (self-signed, from
  `@vitejs/plugin-basic-ssl`), which proxies `/api` (stripped, with the websocket) to the api through
  `readableConfig`. On an empty database the first visit lands on `/setup`.
- There is no component test stack. Check a page in a real browser — light and dark, desktop and
  phone width — before calling it done.
