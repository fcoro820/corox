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
npm publish

if [ $? -ne 0 ]; then
  echo "❌ NPM publish failed. Make sure you are logged in (npm login)."
  exit 1
fi

echo "✅ Deployment Successful! Corox v1.2.0 is now live on NPM."
