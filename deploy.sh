#!/bin/bash

# Corox Deployment Script
echo "🚀 Starting Corox CLI Deployment..."

# 1. Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix TypeScript errors before deploying."
  exit 1
fi

# 2. Git Push
echo "☁️ Pushing to GitHub..."
git add .
git commit -m "feat: implementation of AI Agent with memory, tools, and advanced TUI"
git push origin main

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

echo "✅ Deployment Successful! Corox v1.1.0 is now live."
