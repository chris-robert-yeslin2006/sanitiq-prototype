#!/bin/bash
echo "🚀 Starting SanitiQ Demo..."

# Kill any existing processes
pkill -f "node.*server.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null

# Start backend
echo "📡 Starting backend on port 3001..."
cd backend && npm start &
sleep 3

# Start frontend  
echo "🖥️ Starting frontend on port 3000..."
cd ../frontend && npm start &
ls
echo ""
echo "✅ SanitiQ is now running!"
echo "🌐 Open: http://localhost:3000"
echo "👤 Login: admin / admin"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "Stopping services..."; pkill -f "node.*server.js"; pkill -f "react-scripts"; exit' INT
wait
