#!/bin/bash
set -e

# Try to load the user's profile to find node/npm
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi
if [ -f ~/.bash_profile ]; then
    source ~/.bash_profile
fi

# Fallback: Try common cPanel Node.js paths if still not found
if ! command -v node &> /dev/null; then
    export PATH=$PATH:/opt/cpanel/ea-nodejs20/bin:/opt/cpanel/ea-nodejs18/bin:/opt/cpanel/ea-nodejs16/bin
fi

# Debugging: Print environment info
echo "Deploy Script Started"
echo "User: $(whoami)"
echo "Node Path: $(which node)"
echo "NPM Path: $(which npm)"
node -v
npm -v

# 1. Install dependencies
echo "Installing Server Dependencies..."
(cd server && npm install)

echo "Installing Client Dependencies..."
(cd client && npm install)

# 2. Build using existing script
echo "Running Build Script..."
./build.sh

echo "Build Finished Successfully!"
