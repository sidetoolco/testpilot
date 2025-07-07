#!/bin/bash

# Appcues Integration Test Runner
echo "🚀 Starting Appcues Integration Tests..."

# Check if the dev server is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "⚠️  Development server not running on port 5173"
    echo "Starting development server..."
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for development server to start..."
    sleep 10
    
    # Check if server started successfully
    if ! curl -s http://localhost:5173 > /dev/null; then
        echo "❌ Failed to start development server"
        exit 1
    fi
    echo "✅ Development server started"
else
    echo "✅ Development server already running"
fi

# Run the Cypress tests
echo "🧪 Running Appcues integration tests..."
npm run test:e2e

# Store the exit code
EXIT_CODE=$?

# Clean up if we started the dev server
if [ ! -z "$DEV_PID" ]; then
    echo "🛑 Stopping development server..."
    kill $DEV_PID
fi

# Exit with the test result
exit $EXIT_CODE 