#!/usr/bin/env bash
# Daily snapshot of the production Convex deployment (board data + stored files).
#
# Runs on the always-on Omarchy box (systemd user timer clif-convex-backup).
#   CONVEX_DEPLOY_KEY  prod deploy key; if unset, uses your `npx convex` login
#   CLIF_BACKUP_DIR    destination (default: NAS backup share)
#   CONVEX_CLI         Convex CLI command (default: npx convex)
# Keeps the newest 30 snapshots.
set -euo pipefail

DEPLOYMENT="hushed-gerbil-765" # j-c-rojas/clif-foundation-site production
DEST="${CLIF_BACKUP_DIR:-/srv/nas/Shared/Backups/clif-foundation/convex-prod}"
KEEP=30
read -r -a CONVEX <<< "${CONVEX_CLI:-npx convex}"

# A deploy key already names its deployment; otherwise target prod explicitly.
target=()
[ -n "${CONVEX_DEPLOY_KEY:-}" ] || target=(--deployment "$DEPLOYMENT")

mkdir -p "$DEST"
file="$DEST/clif-convex-prod-$(date +%Y%m%d-%H%M%S).zip"
"${CONVEX[@]}" export "${target[@]}" --include-file-storage --path "$file"
echo "$(date -Iseconds) saved $(basename "$file") ($(du -h "$file" | cut -f1))"

# Prune: keep the newest $KEEP snapshots.
ls -1t "$DEST"/clif-convex-prod-*.zip 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -- "$old"
done
