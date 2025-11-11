#!/bin/bash

# This script starts the development servers for both the client and the server.
# It ensures that when you stop the script (Ctrl+C), both servers are terminated.

# --- Configuration ---
# Adjust these paths and commands if your project structure or start commands are different.
CLIENT_DIR="./client"
CLIENT_CMD="npm run dev"

SERVER_DIR="./server" # Assuming you have a 'server' directory
SERVER_CMD="npm run dev" # Or 'dotnet run', 'go run .', etc.

# --- Script Logic ---

# Function to clean up background processes when the script exits
cleanup() {
    echo "Shutting down development servers..."
    # Kill all processes in the process group of this script
    kill 0
}

# Trap the EXIT signal to run the cleanup function
# This will trigger on normal exit, Ctrl+C (SIGINT), or other termination signals.
trap cleanup EXIT

# Navigate to the client directory and start the dev server in the background
echo "Starting client dev server..."
(cd "$CLIENT_DIR" && $CLIENT_CMD) &

# Navigate to the server directory and start the dev server in the background
echo "Starting server dev server..."
(cd "$SERVER_DIR" && $SERVER_CMD) &

# Wait for all background processes to complete.
# The 'wait' command is interrupted by the trap, allowing the cleanup to run.
echo "Both servers are running. Press Ctrl+C to stop."
wait
