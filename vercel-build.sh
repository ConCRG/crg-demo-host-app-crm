#!/bin/bash
set -e

# Find the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to git root (handles both root and workspace subdirectory execution)
GIT_ROOT="$(git rev-parse --show-toplevel)"
cd "$GIT_ROOT"

echo "Building from: $(pwd)"

# Configure submodule authentication
node scripts/configure-submodule-auth.cjs

# Fetch the submodule
git submodule update --init --recursive

# Patch workspace dependencies
node scripts/patch-crg-workspace-deps.cjs

# Build CRG packages
node scripts/build-crg-with-npm.cjs

# Install dependencies (use npm to match the workspace structure)
npm install

# Build the web app
npm run build:web
