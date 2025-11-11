#!/bin/bash

# Test script to verify seeding works
# Usage: ./test-seed.sh https://your-worker.workers.dev

WORKER_URL="${1:-http://localhost:8787}"

echo "🧪 Testing seed endpoint at: $WORKER_URL"
echo ""

echo "1️⃣ Calling /api/seed..."
SEED_RESPONSE=$(curl -s "$WORKER_URL/api/seed")
echo "$SEED_RESPONSE" | jq '.'
echo ""

# Extract verification count
FOUND_COUNT=$(echo "$SEED_RESPONSE" | jq -r '.verification.found')
echo "✅ Seed reports $FOUND_COUNT tows in database"
echo ""

echo "2️⃣ Checking /api/debug/tows..."
DEBUG_RESPONSE=$(curl -s "$WORKER_URL/api/debug/tows")
echo "$DEBUG_RESPONSE" | jq '.'
echo ""

# Extract count from debug
DEBUG_COUNT=$(echo "$DEBUG_RESPONSE" | jq -r '.count')
echo "✅ Debug endpoint reports $DEBUG_COUNT tows"
echo ""

if [ "$FOUND_COUNT" = "5" ] && [ "$DEBUG_COUNT" = "5" ]; then
    echo "✅ SUCCESS: Seeding is working! 5 tows in database."
    echo ""
    echo "3️⃣ Now visit $WORKER_URL in your browser"
    echo "   Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) to hard refresh"
    echo "   You should see 5 tows with styling!"
else
    echo "❌ PROBLEM: Seed count mismatch"
    echo "   Seed verification: $FOUND_COUNT"
    echo "   Debug endpoint: $DEBUG_COUNT"
    echo "   Expected: 5"
fi

