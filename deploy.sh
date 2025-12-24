#!/bin/bash
set -e

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
