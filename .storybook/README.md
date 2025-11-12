# Storybook Configuration

This directory contains the Storybook configuration for the Tower Delight application.

## Files

- **`main.ts`** - Main Storybook configuration with Vite settings and mock aliases
- **`preview.ts`** - Global decorators, parameters, and preview settings
- **`mocks/`** - Mock implementations for server-side dependencies

## Mocks

Since Storybook runs in the browser, we need to mock server-side dependencies:

### `mocks/db.ts`
Mocks the Kysely database instance (`@/db`) which uses Cloudflare D1.

### `mocks/serverActions.ts`
Mocks all server actions from:
- `@/app/pages/AddTow/functions` - `createTow()`
- `@/app/pages/EditTow/functions` - `updateTow()`
- `@/app/pages/TowDetail/functions` - `updateTowStatus()`, `updateStatus()`, `capturePhoto()`
- `@/app/pages/EditAddress/functions` - `updateAddress()`
- `@/app/pages/AddNote/functions` - `addNote()`

All mocked actions log their calls to the console and simulate async delays.

## Troubleshooting

### "Failed to fetch dynamically imported module" Error

This is usually caused by stale caches. To fix:

```bash
./scripts/clear-storybook-cache.sh
npm run storybook
```

Or manually:

```bash
rm -rf node_modules/.cache storybook-static .storybook/.cache
npm run storybook
```

### Stories Not Loading

1. Check that the component doesn't import server-only modules
2. Verify mocks are configured in `main.ts`
3. Clear caches and rebuild

## Running Storybook

### Development Mode
```bash
npm run storybook
```

Starts Storybook on http://localhost:6006

### Build Static Version
```bash
npm run build-storybook
```

Builds a static version to `storybook-static/`

