#!/bin/bash

# Corox Deployment Script
echo "🚀 Starting Corox CLI Deployment (v1.2.0)..."

# 1. Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix TypeScript errors before deploying."
  exit 1
fi

# 2. Git Push (to dev branch)
echo "☁️ Pushing to GitHub (dev)..."
git add .
git commit -m "chore: finalize release v1.2.0" || echo "Nothing to commit"
git push origin dev

if [ $? -ne 0 ]; then
  echo "❌ Git push failed. Make sure you are authenticated."
  exit 1
fi

# 3. NPM Publish
echo "📦 Publishing to NPM..."

# Load token from .env if it exists
if [ -f .env ]; then
  # Extract NPM_TOKEN from .env file
  NPM_TOKEN=$(grep NPM_TOKEN .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
fi

if [ -n "$NPM_TOKEN" ]; then
  echo "Using token from .env for publishing..."
  # Create temporary .npmrc for the publish command
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
  npm publish --access public
  rm -f .npmrc # Clean up immediately
else
  echo "No NPM_TOKEN found in .env, attempting standard publish..."
  npm publish --access public
fi

if [ $? -ne 0 ]; then
  echo "❌ NPM publish failed. Check your token or permissions."
  exit 1
fi

echo "✅ Deployment Successful! Corox v1.2.0 is now live on NPM."
