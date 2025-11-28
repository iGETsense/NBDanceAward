#!/bin/bash
# Run Next.js dev server with polling to avoid file watcher limits
# This is slower but works when you hit the ENOSPC error

echo "Starting Next.js dev server with polling (slower but avoids file watcher limits)..."
CHOKIDAR_USEPOLLING=true npm run dev
