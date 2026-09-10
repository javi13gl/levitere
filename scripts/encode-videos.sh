#!/usr/bin/env bash
# Re-encodes the client's source videos into web-ready files in public/video/.
# Sources are never modified. Requires ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg).
#
#   bash scripts/encode-videos.sh            # encode everything
#   bash scripts/encode-videos.sh studio     # encode only the entries whose name contains "studio"
#
# Output: H.264 High, CRF 22 capped at 5 Mb/s (4 Mb/s for mobile), no audio
# (the site is always muted), no timecode track, moov atom first (faststart).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/videos/Imágenes Web"
OUT="$ROOT/public/video"
POSTERS="$ROOT/public/posters"
TMP="$ROOT/.encode"
FFMPEG="${FFMPEG:-ffmpeg}"
FILTER="${1:-}"

# name|source file|max bitrate|poster time (s)
MAP=(
  "hero-desktop|1.mp4|5M|2"
  "hero-mobile|1(mobileVersion).mp4|4M|1"
  "work-nordfjord|4Video.mp4|5M|0.2"
  "work-marbella|2Video.mp4|5M|1"
  "work-bergen|3Video.mp4|5M|1"
  "work-valencia|5Video.mp4|5M|1"
  "brands-brann|6.mp4|5M|1"
  "brands-frydenbo|7.mp4|5M|1"
  "brands-w-eiendomsmegling|8.mp4|5M|1"
  "brands-strand-properties|9.mp4|5M|1"
  "brands-brann-mobile|6(mobileVersion).mp4|4M|1"
  "brands-frydenbo-mobile|7(mobileVersion).mp4|4M|1"
  "brands-w-eiendomsmegling-mobile|8(mobileVersion).mp4|4M|1"
  "brands-strand-properties-mobile|9(mobileVersion).mp4|4M|1"
  "studio|10.mp4|5M|1"
)

mkdir -p "$TMP" "$OUT" "$POSTERS"

for entry in "${MAP[@]}"; do
  IFS='|' read -r name src maxrate poster_t <<<"$entry"
  if [[ -n "$FILTER" && "$name" != *"$FILTER"* ]]; then continue; fi
  in="$SRC/$src"
  if [[ ! -f "$in" ]]; then echo "MISSING: $in" >&2; continue; fi
  echo "== $name  <-  $src"
  "$FFMPEG" -y -loglevel error -stats -i "$in" \
    -map 0:v:0 -an -map_metadata -1 -write_tmcd 0 \
    -c:v libx264 -preset slow -crf 22 -maxrate "$maxrate" -bufsize "$(( ${maxrate%M} * 2 ))M" \
    -profile:v high -level 4.1 -pix_fmt yuv420p -g 50 \
    -movflags +faststart \
    "$TMP/$name.mp4"
  mv -f "$TMP/$name.mp4" "$OUT/$name.mp4"
  "$FFMPEG" -y -loglevel error -ss "$poster_t" -i "$OUT/$name.mp4" -frames:v 1 -q:v 3 "$POSTERS/$name.jpg"
done

rmdir "$TMP" 2>/dev/null || true
echo "done"
