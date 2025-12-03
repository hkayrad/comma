#!/bin/bash

# This script builds the client and server projects.

# --- Configuration ---
CLIENT_DIR="./client"
CLIENT_BUILD_CMD="npm run build"

SERVER_DIR="./server"
SERVER_BUILD_CMD="npm run build"
SERVER_POSTBUILD_CMD="npm run postbuild" # Including the postbuild step

# --- Script Logic ---

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Build server
echo "Building server project..."
cd "$SERVER_DIR" || handle_error "Failed to change to server directory."
$SERVER_BUILD_CMD || handle_error "Server build failed."
$SERVER_POSTBUILD_CMD || handle_error "Server postbuild failed."
sed -i '/"type": "module",/d' dist/package.json || handle_error "Failed to remove type: module from package.json"
cd - > /dev/null # Go back to the original directory

# Build client
echo "Building client project..."
cd "$CLIENT_DIR" || handle_error "Failed to change to client directory."
$CLIENT_BUILD_CMD || handle_error "Client build failed."
cd - > /dev/null # Go back to the original directory

echo "Both client and server projects built successfully."
