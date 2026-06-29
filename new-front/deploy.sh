#!/bin/bash

# Navigate to the correct directory just in case
cd /var/www/app/new-front || exit

echo "Starting deployment pipeline..."

echo "Pulling latest changes from git..."
sudo -u yomna22 git pull

echo "Building the frontend..."
sudo npm run build

echo "Restarting PM2 processes..."
sudo pm2 restart nextjs

echo "Deployment complete!"
