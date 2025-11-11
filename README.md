# Tower Delight Driver Workflow Prototype

Mobile-first dispatch, pickup, and impound workflow for Tower Delight heavy-duty tow personas. Built with RedwoodSDK + shadcn/ui primitives and tuned for rapid in-cab usage.

## Getting Started

1. Install dependencies (peer warnings are expected with React canary builds):

   ```shell
   npm install --force
   ```

2. Seed your driver dashboard endpoint (optional). By default the app serves a static fallback at `/api/driver-dashboard`. To point at a real service:

   - Update `wrangler.jsonc` → `vars.TOWER_API_BASE_URL`
   - Or create a `.env` / `import.meta.env` value called `VITE_TOWER_API_BASE_URL`

3. Run locally:

   ```shell
   npm run dev
   ```

   The worker attaches the resolved API base to every request so server components (and future loaders) can fetch live data. If the upstream call fails, it falls back to the pre-seeded workflow snapshot used in the UI.

4. Type-check:

   ```shell
   npm run types
   ```

## Storybook

Storybook ships alongside the app so designers and engineers can iterate on driver workflows without booting the entire worker stack.

```shell
npm run storybook
```

Key stories:

- `UI/Button` & `UI/Badge` exercise the shadcn/ui primitives used across the workflow.
- `Screens/DriverOps/RouteDashboard` renders `HomeScreen` with persona-driven scenarios (`EnRoutePrimary`, `BlizzardDetour`, `TowComplete`) backed by the same fixture as the live route.

The Storybook Vite config mirrors the Redwood/Vite setup, respects the `@` alias, and uses the shared Tailwind theme (`tailwind.config.ts`, `src/styles/globals.css`) so component styling matches production.

## Data Loading Architecture

- `src/app/data/driver-dashboard.ts` centralizes network access. It merges responses from the `/driver-dashboard` endpoint into the persona-aware UI model and gracefully falls back to local fixtures.
- `src/app/pages/Home.tsx` is an async server component: RedwoodSDK calls `loadDriverDashboard` during render, ensuring the UI always receives the freshest dispatch payload without client-side suspense spinners.
- `src/worker.tsx` exposes `/api/driver-dashboard` so mobile clients and upcoming Playwright tests can hit the same fixture while backend contracts harden.

## UI System

- shadcn/ui primitives (`Button`, `Badge`, `Card`, `Separator`) live under `src/components/ui`. They’re theme-aligned with Tower Delight’s brand tokens defined in `tailwind.config.ts` and consumed by `src/styles/globals.css`.
- Shared utility `cn()` (clsx + tailwind-merge) mirrors the shadcn pattern for composing responsive, mobile-first styles.

## Deployment & Extras

- `npm run release` will build and deploy to Cloudflare Workers once you update `wrangler.jsonc` with your project name (already set to `tower-delight-driver`) and credentials.
- Storybook is ready to go (see above). For Playwright end-to-end checks:

  ```shell
  npm run test:e2e        # runs @playwright/test using playwright.config.ts
  ```

  Tests live under `tests/playwright/` (`dashboard-overview`, `workflow-progress`, `route-details`, `next-action`) and exercise the same `/api/driver-dashboard` fixture that powers the app. Set `PLAYWRIGHT_BASE_URL` if you want to target a deployed endpoint instead of the local dev server.

## References

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
