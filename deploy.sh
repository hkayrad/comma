#!/bin/bash
set -e

# 1. Install dependencies
echo "Installing Server Dependencies..."
(cd server && npm install)

echo "Installing Client Dependencies..."
(cd client && npm install)

# 2. Build using existing script
echo "Running Build Script..."
./build.sh

echo "Build Finished Successfully!"
