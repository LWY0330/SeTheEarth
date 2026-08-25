#!/usr/bin/env bash
# ============================================================
# SEE EARTH V1 · E-P0-07 · Public Image EXIF Check
# ------------------------------------------------------------
# Scans all public-facing images (public/, src/assets/) for EXIF
# metadata that could leak privacy:
#   - GPSLatitude / GPSLongitude (precise location)
#   - Camera serial number
#   - UserComment (free text)
#   - Software / HostSoftware (device fingerprint)
#
# Usage:
#   bash scripts/check-image-exif.sh
#   bash scripts/check-image-exif.sh public/
#
# Requires exiftool:
#   brew install exiftool          # macOS
#   apt-get install libimage-exiftool-perl  # Debian/Ubuntu
#
# Author: Engineer Agent (E-P0-07)
# ============================================================

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="${1:-$ROOT_DIR/public}"

# Override targets if user wants to scan additional dirs
EXTRA_DIR="${2:-$ROOT_DIR/src/assets}"

if ! command -v exiftool >/dev/null 2>&1; then
  echo "❌ exiftool not found."
  echo "   Install: brew install exiftool"
  exit 2
fi

if [[ ! -d "$TARGET_DIR" ]] && [[ ! -d "$EXTRA_DIR" ]]; then
  echo "❌ No target directories found:"
  echo "   $TARGET_DIR"
  echo "   $EXTRA_DIR"
  exit 2
fi

echo "🔍 Scanning $TARGET_DIR (and $EXTRA_DIR) for EXIF privacy leaks..."

# -r       recursive
# -q       quiet (brief output)
# Extract only the privacy-sensitive fields
HITS=$(exiftool -r -q \
  -GPS:GPSLatitude \
  -GPS:GPSLongitude \
  -GPS:GPSAltitude \
  -EXIF:UserComment \
  -EXIF:Software \
  -EXIF:HostSoftware \
  -EXIF:CameraSerialNumber \
  -EXIF:BodySerialNumber \
  -EXIF:LensSerialNumber \
  -EXIF:DateTimeOriginal \
  "$TARGET_DIR" "$EXTRA_DIR" 2>/dev/null || true)

if [[ -z "$HITS" ]]; then
  echo "✅ 0 EXIF privacy leaks detected."
  exit 0
fi

echo ""
echo "❌ Found EXIF privacy leaks:"
echo "$HITS"
echo ""
echo "Action: Re-export images with EXIF stripped (e.g. 'exiftool -all= image.jpg')."
exit 1