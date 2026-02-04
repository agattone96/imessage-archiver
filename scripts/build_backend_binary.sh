#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
BIN_DIR="$BACKEND_DIR/bin"
SPEC_DIR="$BACKEND_DIR/.pyi_spec"
WORK_DIR="$BACKEND_DIR/.pyi_build"

PYTHON_BIN="${PYTHON_BIN:-python3}"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
    echo "ERROR: python3 not found. Install Python 3.10+ to build the backend binary." >&2
    exit 1
fi

echo "Building backend binary with ${PYTHON_BIN}..."
"$PYTHON_BIN" -m pip install --quiet -r "$BACKEND_DIR/requirements.txt" pyinstaller

rm -rf "$BIN_DIR"
mkdir -p "$BIN_DIR"

"$PYTHON_BIN" -m PyInstaller --noconfirm --clean \
    --name archiver-backend \
    --onefile \
    --distpath "$BIN_DIR" \
    --workpath "$WORK_DIR" \
    --specpath "$SPEC_DIR" \
    "$BACKEND_DIR/src/app.py"

rm -rf "$WORK_DIR" "$SPEC_DIR"
echo "Backend binary ready: $BIN_DIR/archiver-backend"
