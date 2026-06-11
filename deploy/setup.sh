#!/usr/bin/env bash
#
# One-shot provisioning for an Ubuntu EC2 instance (22.04 / 24.04).
# Builds the frontend + backend ON the box and installs it as a systemd service.
#
# Run from the repo root (the directory containing backend/ and frontend/):
#   chmod +x deploy/setup.sh && ./deploy/setup.sh
#
# Re-running is safe; for routine code updates use deploy/update.sh instead.

set -euo pipefail

APP_DIR=/opt/portfolio
SERVICE_USER=portfolio
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> [1/6] Swap file (t3.micro has only 1 GB RAM — the Rust release build needs more)"
if ! sudo swapon --show | grep -q '/swapfile'; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> [2/6] System packages"
sudo apt-get update -y
sudo apt-get install -y curl build-essential pkg-config

echo "==> [3/6] Node.js 20 (frontend build)"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> [4/6] Rust toolchain (build only)"
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
fi
# shellcheck disable=SC1091
source "$HOME/.cargo/env"

echo "==> [5/6] Build frontend (-> backend/static) and backend (release)"
( cd frontend && npm ci && npm run build )
( cd backend && cargo build --release )

echo "==> [6/6] Install to $APP_DIR + systemd service"
sudo useradd --system --no-create-home --shell /usr/sbin/nologin "$SERVICE_USER" 2>/dev/null || true
sudo mkdir -p "$APP_DIR/static" "$APP_DIR/data"
# Atomic replace so re-running setup.sh while the service is live can't hit
# "Text file busy" overwriting the running binary.
sudo cp backend/target/release/portfolio-backend "$APP_DIR/portfolio-backend.new"
sudo mv -f "$APP_DIR/portfolio-backend.new" "$APP_DIR/portfolio-backend"
sudo rsync -a --delete backend/static/ "$APP_DIR/static/"
sudo cp deploy/portfolio.service /etc/systemd/system/portfolio.service
# data/ must stay writable by the service; don't clobber existing messages.
sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio

echo
echo "Done. The app is running on 127.0.0.1:8080 (behind Caddy once you set that up)."
sudo systemctl --no-pager status portfolio | head -n 6
