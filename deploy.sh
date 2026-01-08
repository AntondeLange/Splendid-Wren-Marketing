#!/bin/bash

# Deployment script for Splendid Wren Marketing

echo "🚀 Deploying Splendid Wren Marketing to Vercel..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

# Check if vercel is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site should be live at the URL provided above."
