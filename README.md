# Flame

pnpm monorepo with a NestJS backend and an Expo/React Native frontend.

## Structure

```
apps/
  api/     NestJS backend
  mobile/  React Native (Expo) frontend
```

## Backend — `apps/api`

NestJS + TypeScript (ESM), production-hardened bootstrap (`helmet`, `compression`,
CORS, global `ValidationPipe`), `@nestjs/config` for env vars, Swagger docs at
`/docs` outside production. Tests run on Vitest.

```
pnpm api:dev        # start in watch mode
pnpm api:test        # unit tests
pnpm api:test:e2e    # e2e tests
```

## Mobile — `apps/mobile`

Expo (bare-capable) React Native app using the standard feature-folder
structure:

```
app/                  expo-router routes only — thin files that import and
  _layout.tsx          render a feature's screen component
  index.tsx
src/
  features/<feature>/
    components/   screens & UI, no business logic
    hooks/        feature-local state + logic (the "ViewModel" layer)
  store/          shared/global state, added only if/when a real
                  cross-feature need shows up (e.g. Zustand — ~1kb)
  services/       API/data-access
  components/     shared UI primitives
```

Routing uses [Expo Router](https://docs.expo.dev/router/introduction/)
(file-based, on top of React Navigation). A route file in `app/` should stay
thin — it just imports a screen component from `src/features/<feature>/components`
and renders it, so screens stay testable and framework-agnostic. Add new
routes as new files under `app/` (e.g. `app/profile.tsx`, `app/settings/index.tsx`);
nested folders map to nested paths, `[param].tsx` maps to a dynamic segment,
and `_layout.tsx` files configure the stack/tabs for their directory. Route
param types are inferred automatically (`experiments.typedRoutes` is enabled
in `app.json`).

State is kept local (`useState`/hooks) per feature; nothing shared is needed
yet, so `src/store` is currently empty — add a state library there only when
a real cross-feature case appears.

```
pnpm mobile:start   # expo start
pnpm mobile:test    # jest
```

## Root scripts

```
pnpm test   # run every workspace's tests
pnpm lint   # run every workspace's lint/typecheck
```

## Credits

Mobile UI design inspired by [E-Learning Mobile App](https://dribbble.com/shots/25152458-E-Learning-Mobile-App) on Dribbble.
