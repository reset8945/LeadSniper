#!/bin/bash
# Start Chromium remote-debugging mode on port 19553 (macOS).

BROWSER="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
BROWSER_NAME="Microsoft Edge"
PROFILE_NAME=".douyin_edge_profile"
if [ ! -x "$BROWSER" ]; then
    BROWSER="$HOME/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
fi
if [ ! -x "$BROWSER" ]; then
    BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    BROWSER_NAME="Google Chrome"
    PROFILE_NAME=".douyin_chrome_profile"
fi
if [ ! -x "$BROWSER" ]; then
    BROWSER="$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
fi
if [ ! -x "$BROWSER" ]; then
    echo "Microsoft Edge or Google Chrome was not found."
    echo "Safari is not supported because LeadSniper requires Chromium CDP."
    exit 1
fi

echo "============================================"
echo "  Start Chromium debug mode on port 19553"
echo "============================================"

# Keep separate persistent profiles for Edge and Chrome.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEBUG_DIR="$SCRIPT_DIR/$PROFILE_NAME"
mkdir -p "$DEBUG_DIR"

"$BROWSER" --remote-debugging-port=19553 --user-data-dir="$DEBUG_DIR" \
    --new-window "https://www.douyin.com/" &

echo ""
echo "$BROWSER_NAME started. Scan the Douyin QR code on the first run."
echo "Run ./LeadSniper check again after login."
