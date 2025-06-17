#!/bin/bash

# Deployment script for Akashic Campaign Console
# This script handles the deployment process including building, migrating, and starting the application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="akashic-campaign-console"
DEPLOY_ENV=${1:-production}

echo -e "${GREEN}🚀 Starting deployment for ${APP_NAME} (${DEPLOY_ENV})${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Load environment variables
if [ -f ".env.${DEPLOY_ENV}" ]; then
    echo -e "\n${YELLOW}📝 Loading environment variables from .env.${DEPLOY_ENV}${NC}"
    export $(cat .env.${DEPLOY_ENV} | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ .env.${DEPLOY_ENV} file not found${NC}"
    exit 1
fi

# Backup database before deployment
echo -e "\n${YELLOW}💾 Creating database backup...${NC}"
npm run db:backup || echo -e "${YELLOW}⚠️  Could not create backup (database might not exist yet)${NC}"

# Build Docker image
echo -e "\n${YELLOW}🔨 Building Docker image...${NC}"
docker build -t ${APP_NAME}:latest .

# Run database migrations
echo -e "\n${YELLOW}🗄️  Running database migrations...${NC}"
docker run --rm \
    --env-file .env.${DEPLOY_ENV} \
    ${APP_NAME}:latest \
    npx prisma migrate deploy

# Stop existing containers
echo -e "\n${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Start new containers
echo -e "\n${YELLOW}🚀 Starting new containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for health check
echo -e "\n${YELLOW}🏥 Waiting for health check...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy${NC}"
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    echo -e "  Attempt ${ATTEMPT}/${MAX_ATTEMPTS}..."
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}❌ Health check failed after ${MAX_ATTEMPTS} attempts${NC}"
    echo -e "${YELLOW}📋 Container logs:${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

# Clean up old images
echo -e "\n${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

# Show deployment info
echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "\n📊 Deployment Summary:"
echo -e "  - Environment: ${DEPLOY_ENV}"
echo -e "  - URL: ${NEXTAUTH_URL}"
echo -e "  - Containers running:"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n${YELLOW}📝 Post-deployment checklist:${NC}"
echo -e "  1. Verify application at ${NEXTAUTH_URL}"
echo -e "  2. Check logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "  3. Monitor health: curl ${NEXTAUTH_URL}/api/health"
echo -e "  4. Set up monitoring and alerts"
echo -e "  5. Configure backup cron job"

echo -e "\n${GREEN}🎉 Deployment complete!${NC}"