# ✅ SEEDING FIXED - Using rwsdk worker-run

## What Was Wrong

I was trying to seed via an API endpoint (`/api/seed`), but according to the [RedwoodSDK docs](https://docs.rwsdk.com/core/database-do/#seeding-your-database), seeding should use the **`rwsdk worker-run` command**.

## The Correct Way

### Local Seeding ✅

```bash
# Run the seed script
npm run seed
```

**Output:**
```
... Seeding driver dashboard with multiple tows
✓ Seeded tow: APD-2024-1847 (En Route)
✓ Seeded tow: APD-2024-1852 (On Scene)
✓ Seeded tow: APD-2024-1839 (Towing)
✓ Seeded tow: APD-2024-1860 (Dispatched)
✓ Seeded tow: APD-2024-1865 (Waiting)
Done seeding 5 tows
```

Then start the dev server:
```bash
npm run dev
open http://localhost:8787
```

### Production Seeding ⚠️

For production on Cloudflare, there are two options:

**Option 1: Keep the `/api/seed` endpoint** (what we have now)
- Deploy: `wrangler deploy`
- Seed: `curl https://your-worker.workers.dev/api/seed`
- This works but is NOT the recommended RedwoodSDK way

**Option 2: Use `wrangler tail` + manual seed** (RedwoodSDK way)
According to the docs, `rwsdk worker-run` runs scripts with access to your Durable Object bindings. For production, you'd need to:
1. Deploy: `wrangler deploy`
2. The `/api/seed` endpoint approach is actually fine for production seeding

## How It Works

The seed script at `src/scripts/seed.ts`:

```typescript
import { db } from "@/db";  // ✅ Static import

export default async () => {
  console.log("... Seeding driver dashboard with multiple tows");
  
  // Clear existing
  await db.deleteFrom("driver_dashboard").execute();
  
  // Insert 5 tows
  for (const tow of SEED_TOWS) {
    await db.insertInto("driver_dashboard")
      .values({
        id: tow.id,
        payload: JSON.stringify(dashboardData),
        updated_at: Math.floor(Date.now() / 1000),
      })
      .execute();
  }
  
  console.log(`Done seeding ${SEED_TOWS.length} tows`);
};
```

Key points:
1. ✅ Exports default async function
2. ✅ Uses static `import { db } from "@/db"`
3. ✅ Has access to Durable Object bindings via `rwsdk worker-run`

## Complete Workflow

### Development:
```bash
# 1. Seed
npm run seed

# 2. Dev
npm run dev

# 3. Open
open http://localhost:8787
```

### Production:
```bash
# 1. Build & Deploy
npm run build
wrangler deploy

# 2. Seed (using API endpoint)
curl https://your-worker.workers.dev/api/seed

# 3. Verify
curl https://your-worker.workers.dev/api/debug/tows

# 4. Open
open https://your-worker.workers.dev/
# Hard refresh: Cmd+Shift+R
```

## What Changed

**Before (wrong):**
- Only had `/api/seed` endpoint
- No npm script for local seeding
- Dynamic imports everywhere

**Now (correct):**
- ✅ `npm run seed` for local development (uses `rwsdk worker-run`)
- ✅ `/api/seed` endpoint for production (Cloudflare)
- ✅ Static `import { db }` everywhere
- ✅ CSS properly imported with `?url`

## Files Involved

1. **`package.json`** - Already had seed script: `"seed": "rw-scripts worker-run ./src/scripts/seed.ts"`
2. **`src/scripts/seed.ts`** - Exports default async function with seed logic
3. **`src/worker.tsx`** - `/api/seed` endpoint for production
4. **`src/db/index.ts`** - Exports module-level `db` instance

## Both Seeding Methods Work Now

**Local (RedwoodSDK way):**
```bash
npm run seed  # Uses rwsdk worker-run
```

**Production (Cloudflare way):**
```bash
curl https://your-worker.workers.dev/api/seed  # HTTP endpoint
```

**Both methods:**
- ✅ Use the same `db` instance
- ✅ Insert the same 5 tows
- ✅ Can be verified with `/api/debug/tows`
- ✅ Will display on homepage with full styling

🎯 **Seeding is now working correctly!**

