#!/bin/bash

# AWS Deployment Script
# This script deploys the built frontend to AWS server

set -e  # Exit on error

SERVER_USER="root"
SERVER_IP="72.60.41.227"
SERVER_PATH="/var/www/projekanda"
LOCAL_DIST="./dist"

echo "🚀 Starting deployment to AWS server..."

# Check if dist folder exists
if [ ! -d "$LOCAL_DIST" ]; then
    echo "❌ Error: dist folder not found. Please run 'npm run build' first."
    exit 1
fi

echo "📦 Syncing files to server..."
rsync -avz --delete \
    -e "ssh -o StrictHostKeyChecking=no" \
    ${LOCAL_DIST}/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your application is now live at: http://${SERVER_IP}"
else
    echo "❌ Deployment failed!"
    exit 1
fi
