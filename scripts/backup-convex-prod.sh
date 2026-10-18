#!/usr/bin/env bash
# Daily snapshot of the production Convex deployment (board data + stored files).
# Usage: scripts/backup-convex-prod.sh [destination-dir]
# Defaults to the Foundation's Dropbox backup folder and keeps the newest 30.
set -euo pipefail

DEPLOYMENT="hushed-gerbil-765" # j-c-rojas/clif-foundation-site production
DEST="${1:-$HOME/Dropbox/Work/CLIF Foundation/Backups/convex-prod}"
KEEP=30

cd "$(dirname "$0")/.."
mkdir -p "$DEST"
file="$DEST/clif-convex-prod-$(date +%Y%m%d-%H%M%S).zip"
npx convex export --deployment "$DEPLOYMENT" --include-file-storage --path "$file"
echo "$(date -Iseconds) saved $(basename "$file") ($(du -h "$file" | cut -f1))"

# Prune: keep the newest $KEEP snapshots.
ls -1t "$DEST"/clif-convex-prod-*.zip 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -- "$old"
done
