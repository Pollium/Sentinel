# Web (`packages/apps/web`)

React 19 + Vite + HeroUI v3 (`@heroui/react`, theme from `@heroui/styles`) + Tailwind v4 utilities and
`lucide-react` icons. Copy is English, short and calm. The console's chrome, components and plumbing
come from `@sentinel/ui`; the app itself is the shell and three modules.

## Layout of `src/`

```
main.tsx              mounts the router with mountApp (@sentinel/ui/app/mount) after importing the theme
app/                  composition root: router.tsx (assembleRouter), routes.ts (page discovery),
                      layouts/TowerLayout, components/TowerNav · TowerTabBar · TowerJumpTo,
                      navigation/items.ts (sidebar and footer entries)
assets/styles/        index.css: the whole theme (HeroUI import, tokens, light/dark, glass, chrome motion)
modules/<name>/       api/api.ts (calls), components/<Name>/index.tsx, hooks/use-*.ts,
                      pages/{guest,protected}/**/{index,layout}.tsx, utils/*.ts, contracts/*.ts
    auth/             sign-in, first-operator setup, invitation acceptance, the account menu
    operators/        invite by link, the joined and invited lists
    tower/            overview, providers, models, API keys, and the live hooks
```

- **Pages are discovered.** `modules/<m>/pages/guest/SignIn/index.tsx` is `/sign-in`;
  `pages/protected/Keys/[id]/index.tsx` is `/keys/:id`; folder names turn kebab-case. `guest`
  pages render outside the session (a signed-in visitor is sent on), `protected` pages render inside
  `SessionGate` and `TowerLayout`, which send a visitor without a session to `/sign-in?next=`. A
  `layout.tsx` wraps its sibling pages through `<Outlet>` and passes them a typed context
  (`contracts/tower-outlet.ts`). Add the route to `app/navigation/items.ts` only when it belongs in
  the sidebar.
- **Data.** Each module's `api/api.ts` wraps `call(route, { path, query, body })` from
  `@sentinel/ui/api/call` around a contracts route-table row. Read with
  `useQuery(api.fn, [arg1, arg2])` (`@sentinel/ui/hooks/api/use-query` — an `undefined` arg keeps it
  idle; it returns `{ data, loading, error, reload }`) and render it through `QueryState`; write with
  `useMutation(api.fn)` or, for a form, `useForm` with a `typia.createValidate<Input>()` validator
  and `submitErrorMessage`. Wire types and routes come from `@sentinel/contracts/<domain>/**`. Never
  hard-code a URL, never fake data.
- **Live.** `useChannel(path, handlers)` (`@sentinel/ui/hooks/socket/use-channel`) shares one socket
  per path across components and reconnects with backoff. Type a channel by augmenting `ChannelMap`
  in the module's `contracts/channel.ts` (see `tower/contracts/channel.ts`).
  `useLiveOverview(window)` and `useLiveProviders` overlay the pushed frames on the loaded data.
  When the socket closes with `SESSION_EXPIRED` or `ACCESS_REVOKED` for the current token, the
  session ends and the console goes back to sign-in.
- **Session.** The token lives in `localStorage` under `sentinel.session` (theme `sentinel.theme`,
  sidebar `sentinel.sidebar`), and every tab follows it through the `storage` event, so a token one
  tab rotates or drops reaches the others. `SessionGate` reads `/tower/me` once and hands the
  operator down as the `SessionOutlet` context. A `401` with `Auth::Unauthorized` or
  `Auth::InvalidToken` ends the session of the token that call carried, and only while it is still
  the stored one. Sign out lives in the account menu (`auth/components/AccountMenu`). An unknown
  path renders `app/components/NotFound`.
- **Errors to copy.** Each module's `utils/error-copy.ts` is
  `lookupError<Codes>({ ...SHARED_ERROR_COPY, 'Domain::Cause': 'Sentence.' })`, keyed by the
  contracts error codes: a key that is not a code fails `tsc`, and a code without copy shows its raw
  message, so every code a page can meet gets a sentence.
- **Style.** 4 spaces, single quotes (JSX attributes included), semicolons, `if(`/`}else{` with no
  space, `interface Name{`, `@/` imports inside the app and `@sentinel/ui/...` for the package (no
  relative imports), kebab-case file names except `Component/index.tsx`, one default-exported
  component per file, no comments, no `!important`.
- **Look.** Calm and flat: gray selection, one-line rows, no badges or colour for decoration, glass
  (`glass-surface`) only on floating chrome. Reach for an `@sentinel/ui` component (`PanelGrid`,
  `PanelCell`, `ListGroup`, `ListRow`, `FactList`, `SplitView`, `PageToolbar`, `ConfirmDialog`,
  `CopyOnce`, …) before writing markup again.

## Checking your work

- `pnpm --filter @sentinel/web build` (`tsc -b`, which also builds the `contracts` and `ui`
  declarations, then `vite build`), `pnpm --filter @sentinel/web lint` (`oxlint --deny-warnings`),
  and `pnpm --filter @sentinel/ui typecheck`.
- The dev stack: the api on :8080 and the web on https://localhost:5175 (self-signed, from
  `@vitejs/plugin-basic-ssl`), which proxies `/api` (stripped, with the websocket) to the api. On an
  empty database the first visit lands on `/setup`.
- There is no component test stack. Check a page in a real browser — light and dark, desktop and
  phone width — before calling it done.
