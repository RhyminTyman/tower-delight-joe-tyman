# Tower Delight Driver Workflow Prototype

Mobile-first dispatch, pickup, and impound workflow for Tower Delight heavy-duty tow personas. Built with RedwoodSDK + shadcn/ui primitives and tuned for rapid in-cab usage.

## Getting Started

1. Install dependencies (peer warnings are expected with React canary builds):

   ```shell
   npm install
   ```

   The repo ships with an `.npmrc` that enables `legacy-peer-deps` so CI/CD (and Cloudflare builds) don’t choke on the React canary + Radix peer mismatch.

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

- `UI/Button` & `UI/Badge` exercise the shadcn-inspired primitives used across the workflow.
- `Screens/DriverWorkflow` renders `HomeScreen` with persona variants (active dispatch, impound hold, offline fallback) backed by the same fixture as the live route.

The Storybook Vite config loads the Redwood plugin, respects the `@` alias, and injects the Tailwind CDN so component styling matches production.

## Data Loading Architecture

- `src/app/data/driver-dashboard.ts` centralizes network access. It merges responses from the `/driver-dashboard` endpoint into the persona-aware UI model and gracefully falls back to local fixtures.
- `src/app/pages/Home.tsx` is an async server component: RedwoodSDK calls `loadDriverDashboard` during render, ensuring the UI always receives the freshest dispatch payload without client-side suspense spinners.
- `src/worker.tsx` exposes `/api/driver-dashboard` so mobile clients and upcoming Playwright tests can hit the same fixture while backend contracts harden.

## UI System

- Official `shadcn/ui` components (generated via `components.json`) live in `src/components/ui` and run on a full Tailwind toolchain (`tailwind.config.ts`, `postcss.config.cjs`, `src/styles/globals.css`).
- The Tailwind theme codifies Tower Delight brand tokens (`primary`, `accent`, `glass-card` utility) so web, Storybook, and Cloudflare worker stay visually identical.
- Shared utility `cn()` combines `clsx` + `tailwind-merge` for ergonomic class composition inside every component and story.

## Deployment & Extras

- `npm run release` will build and deploy to Cloudflare Workers once you update `wrangler.jsonc` with your project name (already set to `tower-delight-driver`) and credentials.
- Storybook & Playwright aren’t checked in yet, but the component structure and API fixtures were designed so they can be layered in quickly:
  - Storybook: point stories at the exported `STATIC_DRIVER_DASHBOARD`.
  - Playwright: reuse `/api/driver-dashboard` for deterministic E2E setup.

## References

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
