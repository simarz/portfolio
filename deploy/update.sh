#!/usr/bin/env bash
#
# Redeploy after code changes (assumes deploy/setup.sh already ran once).
# Rebuilds, swaps in the new binary + static files, and restarts the service.
#
# Run from the repo root after pulling your latest changes:
#   ./deploy/update.sh

set -euo pipefail

APP_DIR=/opt/portfolio
SERVICE_USER=portfolio
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# shellcheck disable=SC1091
source "$HOME/.cargo/env"

echo "==> Building frontend + backend"
( cd frontend && npm ci && npm run build )
( cd backend && cargo build --release )

echo "==> Installing new build"
# Replace the binary atomically: you can't `cp` over a running executable
# ("Text file busy"), but `mv` swaps the directory entry and works fine.
sudo cp backend/target/release/portfolio-backend "$APP_DIR/portfolio-backend.new"
sudo mv -f "$APP_DIR/portfolio-backend.new" "$APP_DIR/portfolio-backend"
sudo rsync -a --delete backend/static/ "$APP_DIR/static/"
sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"

echo "==> Restarting service"
sudo systemctl restart portfolio
sudo systemctl --no-pager status portfolio | head -n 6
