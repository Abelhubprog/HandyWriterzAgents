#!/bin/bash

# HandyWriterz Development Setup Script
set -e

echo "🚀 Starting HandyWriterz Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please update .env with your API keys before continuing."
    exit 1
fi

# Check required environment variables
check_env_var() {
    if [ -z "${!1}" ]; then
        print_error "Required environment variable $1 is not set"
        return 1
    fi
}

# Load environment variables
source .env

# Check critical environment variables
print_status "Checking environment variables..."
REQUIRED_VARS=(
    "GEMINI_API_KEY"
    "PERPLEXITY_API_KEY"
    "DATABASE_URL"
    "REDIS_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env"
        exit 1
    fi
done

print_status "Environment variables validated ✓"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running ✓"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

print_status "pnpm is available ✓"

# Install dependencies
print_status "Installing dependencies..."

# Install backend dependencies
if [ -f backend/requirements.txt ]; then
    print_status "Backend dependencies will be installed in Docker container"
fi

# Install frontend dependencies
if [ -f web/package.json ]; then
    print_status "Installing frontend dependencies..."
    cd web && pnpm install && cd ..
fi

# Install root dependencies
if [ -f package.json ]; then
    print_status "Installing root dependencies..."
    pnpm install
fi

print_status "Dependencies installed ✓"

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down -v > /dev/null 2>&1 || true

# Build and start services
print_status "Building and starting services..."
docker-compose up -d postgres redis

# Wait for database to be ready
print_status "Waiting for database to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker-compose exec -T postgres pg_isready -U handywriterz -d handywriterz > /dev/null 2>&1; then
        break
    fi
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Database failed to start after $max_attempts attempts"
    exit 1
fi

print_status "Database is ready ✓"

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
max_attempts=15
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        break
    fi
    sleep 1
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Redis failed to start after $max_attempts attempts"
    exit 1
fi

print_status "Redis is ready ✓"

# Start backend service
print_status "Starting backend service..."
docker-compose up -d backend

# Wait for backend to be ready
print_status "Waiting for backend to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        break
    fi
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Backend failed to start after $max_attempts attempts"
    docker-compose logs backend
    exit 1
fi

print_status "Backend is ready ✓"

# Start frontend service
print_status "Starting frontend service..."
docker-compose up -d web

# Wait for frontend to be ready
print_status "Waiting for frontend to be ready..."
max_attempts=20
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    print_warning "Frontend may still be starting. Check logs if needed."
fi

# Start worker service
print_status "Starting worker service..."
docker-compose up -d worker

print_status "All services started ✓"

# Display service status
echo ""
echo "🎉 HandyWriterz Development Environment is Ready!"
echo ""
echo "📊 Service Status:"
echo "  • Frontend:  http://localhost:3000"
echo "  • Backend:   http://localhost:8000"
echo "  • API Docs:  http://localhost:8000/docs"
echo "  • Database:  localhost:5432"
echo "  • Redis:     localhost:6379"
echo ""

# Display useful commands
echo "🛠️  Useful Commands:"
echo "  • View logs:           docker-compose logs -f [service]"
echo "  • Stop services:       docker-compose down"
echo "  • Restart service:     docker-compose restart [service]"
echo "  • Enter container:     docker-compose exec [service] bash"
echo "  • Database shell:      docker-compose exec postgres psql -U handywriterz -d handywriterz"
echo "  • Redis CLI:           docker-compose exec redis redis-cli"
echo ""

# Check service health
echo "🏥 Health Checks:"
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "  • Backend:   ${GREEN}✓ Healthy${NC}"
else
    echo -e "  • Backend:   ${RED}✗ Unhealthy${NC}"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "  • Frontend:  ${GREEN}✓ Healthy${NC}"
else
    echo -e "  • Frontend:  ${YELLOW}⚠ Starting${NC}"
fi

echo ""
echo "📋 Next Steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Test the chat interface with a sample prompt"
echo "  3. Check the API documentation at http://localhost:8000/docs"
echo ""

# Optionally tail logs
read -p "Would you like to view live logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose logs -f
fi