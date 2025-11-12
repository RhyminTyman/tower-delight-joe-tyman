#!/bin/bash

# Clear Storybook Cache
# Run this if you encounter "Failed to fetch dynamically imported module" errors

echo "🧹 Clearing Storybook caches..."

# Remove cache directories
rm -rf node_modules/.cache
rm -rf storybook-static
rm -rf .storybook/.cache

echo "✓ Caches cleared!"
echo ""
echo "Now run:"
echo "  npm run storybook"
echo ""
echo "Or to rebuild the static version:"
echo "  npm run build-storybook"

