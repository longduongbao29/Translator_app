#!/bin/bash

# Voice Translator Backend - Docker Build Script
# Description: Build script for the Voice Translator API backend service
# Author: Voice Translator Team
# Date: $(date +"%Y-%m-%d")

set -e  # Exit on any error

# Configuration
IMAGE_NAME="voice-translator-backend"
IMAGE_TAG="${1:-latest}"  # Use first argument as tag, default to 'latest'
DOCKERFILE_PATH="./Dockerfile"
BUILD_CONTEXT="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
echo "=================================================="
echo "  Voice Translator Backend - Docker Build"
echo "=================================================="
echo ""

# Validate prerequisites
log_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

if [ ! -f "$DOCKERFILE_PATH" ]; then
    log_error "Dockerfile not found at $DOCKERFILE_PATH"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    log_error "requirements.txt not found"
    exit 1
fi

log_success "Prerequisites check passed"

# Build information
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

log_info "Build Configuration:"
echo "  Image Name: $FULL_IMAGE_NAME"
echo "  Build Date: $BUILD_DATE"
echo "  Git Commit: $GIT_COMMIT"
echo "  Git Branch: $GIT_BRANCH"
echo "  Dockerfile: $DOCKERFILE_PATH"
echo "  Context: $BUILD_CONTEXT"
echo ""

# Clean up previous build artifacts if requested
if [[ "$*" == *"--clean"* ]]; then
    log_info "Cleaning up previous images..."
    docker rmi "$FULL_IMAGE_NAME" 2>/dev/null || true
    docker system prune -f --filter "label=app=voice-translator-backend"
    log_success "Cleanup completed"
fi

# Build the Docker image
log_info "Starting Docker build..."

docker build \
    --file "$DOCKERFILE_PATH" \
    --tag "$FULL_IMAGE_NAME" \
    --label "app=voice-translator-backend" \
    --label "version=$IMAGE_TAG" \
    --label "build-date=$BUILD_DATE" \
    --label "git-commit=$GIT_COMMIT" \
    --label "git-branch=$GIT_BRANCH" \
    --label "maintainer=voice-translator-team" \
    --build-arg BUILD_DATE="$BUILD_DATE" \
    --build-arg GIT_COMMIT="$GIT_COMMIT" \
    --build-arg VERSION="$IMAGE_TAG" \
    "$BUILD_CONTEXT"

if [ $? -eq 0 ]; then
    log_success "Docker image built successfully: $FULL_IMAGE_NAME"
else
    log_error "Docker build failed"
    exit 1
fi
