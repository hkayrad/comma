#!/bin/bash

# This script builds the common, client and server projects for bare-metal deployment.

# Exit on any error
set -e

# Navigate to the script's directory
cd "$(dirname "$0")"

# --- Configuration ---
COMMON_DIR="./common"
CLIENT_DIR="./client"
SERVER_DIR="./server"
BUILD_ROOT="./build"

# Clear build directory
if [ -d "$BUILD_ROOT" ]; then
    echo "Cleaning build directory..."
    rm -rf "$BUILD_ROOT"
fi

# 1. Build common (Shared types/schemas)
echo "Building common workspace..."
cd "$COMMON_DIR"
npm run build
cd - > /dev/null

# 2. Build server
echo "Building server project..."
cd "$SERVER_DIR"
npm run build
npm run postbuild

API_BUILD_DIR="../build/api.orhandogan.com.tr"
mkdir -p "$API_BUILD_DIR"
cp -r dist/* "$API_BUILD_DIR"
rm -rf ./dist
cd - > /dev/null

# 3. Build client
echo "Building client project..."
cd "$CLIENT_DIR"
npm run build

CLIENT_BUILD_DIR="../build/comma.orhandogan.com.tr"
mkdir -p "$CLIENT_BUILD_DIR"
cp -r dist/* "$CLIENT_BUILD_DIR"
rm -rf ./dist
cd - > /dev/null

echo -e "\nSuccessfully built all projects."
echo "Server: $API_BUILD_DIR"
echo "Client: $CLIENT_BUILD_DIR"
