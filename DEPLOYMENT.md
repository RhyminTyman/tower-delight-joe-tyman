# Deployment Guide

## Deploy to Cloudflare Workers

### 1. Build and Deploy

```bash
npm run release
```

This will:
- Clean the build cache
- Build the application with Vite
- Deploy to Cloudflare Workers using Wrangler

### 2. Seed the Database

After deployment, the Durable Object database will be empty. Seed it with sample data:

```bash
curl https://tower-delight.YOUR-SUBDOMAIN.workers.dev/api/seed
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully"
}
```

This creates 5 sample tows with different statuses:
- TOW-001: En Route (26 min ETA)
- TOW-002: On Scene (Active capture)
- TOW-003: Towing (In transit)
- TOW-004: Dispatched (32 min ETA)
- TOW-005: Waiting (38 min ETA)

### 3. Verify Deployment

Visit your worker URL:
```
https://tower-delight.YOUR-SUBDOMAIN.workers.dev/
```

You should see:
- ✅ Styled tow list with 5 tows
- ✅ Glass-morphism cards
- ✅ Dark theme with gradients
- ✅ Responsive mobile-first layout

### Troubleshooting

#### No Styling Appears

**Issue:** CSS not loading
**Solution:** 
1. Check browser console for errors
2. Ensure `npm run build` completed successfully
3. Verify `dist/` directory contains CSS files
4. Redeploy with `npm run release`

#### No Tows Appear

**Issue:** Database is empty
**Solution:** Call the seed endpoint:
```bash
curl https://tower-delight.YOUR-SUBDOMAIN.workers.dev/api/seed
```

#### Durable Object Errors

**Issue:** `Cannot create binding for class 'Database'`
**Solution:** 
1. Ensure `wrangler.jsonc` has correct migrations:
```json
"migrations": [
  {
    "tag": "v1",
    "new_sqlite_classes": ["Database"]
  }
]
```
2. Delete and redeploy if needed

### Environment Variables

Set in `wrangler.jsonc`:
```json
"vars": {
  "TOWER_API_BASE_URL": "https://your-api-url.com"
}
```

### CI/CD

The GitHub Actions workflow (`.github/workflows/test.yml`) runs:
- Type checking
- E2E tests

To add deployment to CI:
1. Add Cloudflare API token to GitHub Secrets
2. Add deployment step to workflow
3. Call `/api/seed` after deployment

### Local Development vs Production

**Local (`npm run dev`):**
- Durable Object runs in local storage
- Seed with `npm run seed`
- Hot reload enabled

**Production (Cloudflare):**
- Durable Object runs on Cloudflare edge
- Seed with `/api/seed` endpoint
- Globally distributed

### Monitoring

View logs in Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select `tower-delight`
3. Click "Logs" tab
4. Filter by "Error" or "Warning"

### Rollback

If deployment fails:
```bash
wrangler rollback
```

This reverts to the previous deployment.

