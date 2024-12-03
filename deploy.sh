#!/bin/bash

# Stop any running containers
echo "Stopping existing containers..."
docker-compose down

# Build the images
echo "Building Docker images..."
docker-compose build --no-cache

# Start the containers
echo "Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check if services are running
echo "Checking service status..."
docker-compose ps

# Print logs
echo "Recent logs:"
docker-compose logs --tail=50

echo "Deployment complete! Services are running at:"
echo "Frontend: http://localhost"
echo "Backend: http://localhost:3001"
echo "WebSocket: ws://localhost:3001"

# Print instructions
echo ""
echo "To view logs in real-time, run: docker-compose logs -f"
echo "To stop services, run: docker-compose down"
