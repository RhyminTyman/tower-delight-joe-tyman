#!/bin/bash

set -e  # Exit on error

echo "🚀 Deploying Tower Delight to Cloudflare"
echo ""

# Step 1: Build
echo "📦 Step 1: Building..."
npm run build
echo "✅ Build complete"
echo ""

# Step 2: Deploy
echo "☁️  Step 2: Deploying to Cloudflare..."
wrangler deploy
echo "✅ Deployment complete"
echo ""

# Get the worker URL from wrangler
WORKER_URL=$(wrangler deployments list --json 2>/dev/null | jq -r '.[0].url' || echo "")

if [ -z "$WORKER_URL" ]; then
  echo "⚠️  Could not auto-detect worker URL"
  echo "Please enter your worker URL (e.g. https://tower-delight.your-subdomain.workers.dev):"
  read WORKER_URL
fi

echo "🌐 Using worker URL: $WORKER_URL"
echo ""

# Wait a moment for deployment to propagate
echo "⏳ Waiting 5 seconds for deployment to propagate..."
sleep 5
echo ""

# Step 3: Seed database
echo "🌱 Step 3: Seeding database..."
SEED_RESPONSE=$(curl -s "$WORKER_URL/api/seed")
echo "$SEED_RESPONSE" | jq '.'

# Check if seed was successful
FOUND=$(echo "$SEED_RESPONSE" | jq -r '.verification.found')
if [ "$FOUND" = "5" ]; then
  echo "✅ Successfully seeded 5 tows"
else
  echo "❌ Seeding failed! Expected 5 tows, found $FOUND"
  exit 1
fi
echo ""

# Step 4: Verify
echo "🔍 Step 4: Verifying database..."
DEBUG_RESPONSE=$(curl -s "$WORKER_URL/api/debug/tows")
COUNT=$(echo "$DEBUG_RESPONSE" | jq -r '.count')
echo "   Database contains: $COUNT tows"

if [ "$COUNT" = "5" ]; then
  echo "✅ Verification successful"
else
  echo "❌ Verification failed! Expected 5 tows, found $COUNT"
  exit 1
fi
echo ""

# Success!
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📋 Next steps:"
echo "   1. Visit: $WORKER_URL"
echo "   2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo ""
echo "You should see:"
echo "   ✅ 5 tow cards with full styling"
echo "   ✅ Dark gradient background"
echo "   ✅ Glass-morphism effects"
echo "   ✅ All interactive features"
echo ""
echo "🐛 Debugging (if needed):"
echo "   Watch logs:  wrangler tail"
echo "   Debug API:   curl $WORKER_URL/api/debug/tows"
echo "   Re-seed:     curl $WORKER_URL/api/seed"

