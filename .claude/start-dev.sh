#!/usr/bin/env bash
set -euo pipefail

# Bootstrap NVM so node/npm are in PATH
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  source "$NVM_DIR/nvm.sh"
elif [[ -s "/opt/homebrew/opt/nvm/nvm.sh" ]]; then
  source "/opt/homebrew/opt/nvm/nvm.sh"
else
  echo "ERROR: nvm not found. Install nvm or ensure NVM_DIR is set." >&2
  exit 1
fi

nvm use 2>/dev/null || {
  echo "ERROR: Node version from .nvmrc is not installed. Run: nvm install" >&2
  exit 1
}

exec npm run dev
