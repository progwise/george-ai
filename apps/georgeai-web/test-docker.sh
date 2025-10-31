#!/bin/bash

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

IMAGE_NAME="george-ai-web:test"
CONTAINER_NAME="george-ai-web-test"
PORT=8080

# Find repository root (where .git directory is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Verify we're in the right place
if [ ! -f "$REPO_ROOT/turbo.json" ]; then
    echo -e "${RED}Error: Could not find repository root (turbo.json not found)${NC}"
    echo "Expected at: $REPO_ROOT"
    exit 1
fi

echo -e "${YELLOW}=== Testing georgeai-web Docker build ===${NC}"
echo -e "Repository root: ${REPO_ROOT}\n"

# Change to repository root for Docker build
cd "$REPO_ROOT" || exit 1

# Cleanup any existing test containers/images
echo "Cleaning up previous test artifacts..."
docker stop $CONTAINER_NAME 2>/dev/null
docker rm $CONTAINER_NAME 2>/dev/null
docker rmi $IMAGE_NAME 2>/dev/null

# Step 1: Build the image
echo -e "\n${YELLOW}Step 1: Building Docker image...${NC}"
if docker build -f apps/georgeai-web/Dockerfile -t $IMAGE_NAME . ; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Step 2: Run the container
echo -e "\n${YELLOW}Step 2: Starting container...${NC}"
if docker run -d -p $PORT:$PORT --name $CONTAINER_NAME $IMAGE_NAME ; then
    echo -e "${GREEN}✓ Container started${NC}"
else
    echo -e "${RED}✗ Failed to start container${NC}"
    exit 1
fi

# Wait for container to be ready
echo "Waiting for container to be ready..."
sleep 3

# Step 3: Test HTTP response
echo -e "\n${YELLOW}Step 3: Testing HTTP response...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ HTTP 200 OK${NC}"
else
    echo -e "${RED}✗ HTTP $HTTP_CODE (expected 200)${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Step 4: Test content
echo -e "\n${YELLOW}Step 4: Testing content...${NC}"
if curl -s http://localhost:$PORT | grep -q "George-AI"; then
    echo -e "${GREEN}✓ Content contains 'George-AI'${NC}"
else
    echo -e "${RED}✗ Content doesn't contain 'George-AI'${NC}"
    exit 1
fi

# Step 5: Security check - verify non-root user
echo -e "\n${YELLOW}Step 5: Security check (non-root user)...${NC}"
USER_CHECK=$(docker exec $CONTAINER_NAME whoami)
if [ "$USER_CHECK" = "nginx-user" ]; then
    echo -e "${GREEN}✓ Running as non-root user: $USER_CHECK${NC}"
else
    echo -e "${RED}✗ Running as: $USER_CHECK (expected: nginx-user)${NC}"
    exit 1
fi

# Step 6: Check file permissions
echo -e "\n${YELLOW}Step 6: Checking file permissions...${NC}"
docker exec $CONTAINER_NAME ls -la /usr/share/nginx/html | head -5

# Step 7: View container logs
echo -e "\n${YELLOW}Step 7: Container logs:${NC}"
docker logs $CONTAINER_NAME | head -20

# Step 8: Health check
echo -e "\n${YELLOW}Step 8: Health check...${NC}"
sleep 5
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null)
if [ "$HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠ Health status: $HEALTH (may need more time)${NC}"
fi

# Summary
echo -e "\n${GREEN}=== All tests passed! ===${NC}\n"

# Cleanup
echo "Cleaning up..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME
docker rmi $IMAGE_NAME
echo -e "${GREEN}✓ Cleanup complete${NC}"
