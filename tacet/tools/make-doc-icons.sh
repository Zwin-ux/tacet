#!/usr/bin/env bash
# Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for license information.
#
# Authoring-time only (macOS: sips, iconutil, qlmanage). Regenerates the Finder document icons
# resources/darwin/tacet-md.icns and tacet-txt.icns from tacet/design/assets/icon. Commit the output.
set -euo pipefail
cd "$(dirname "$0")/../.."
SRC=tacet/design/assets/icon
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

icns() { # icns <1024.png> <out.icns>
	local set="$TMP/$(basename "$2" .icns).iconset"; mkdir "$set"
	for s in 16 32 128 256 512; do
		sips -z $s $s "$1" --out "$set/icon_${s}x${s}.png" >/dev/null
		sips -z $((s*2)) $((s*2)) "$1" --out "$set/icon_${s}x${s}@2x.png" >/dev/null
	done
	iconutil -c icns "$set" -o "$2"
}

icns "$SRC/tacet-file-md-1024.png" resources/darwin/tacet-md.icns
# ponytail: qlmanage rasterizes the SVG; it is the only SVG renderer that ships with macOS.
# The SVG declares 256px; rewrite to 1024 so the thumbnail fills the canvas.
sed 's/width="256" height="256"/width="1024" height="1024"/' "$SRC/tacet-file-txt.svg" > "$TMP/txt.svg"
qlmanage -t -s 1024 -o "$TMP" "$TMP/txt.svg" >/dev/null
icns "$TMP/txt.svg.png" resources/darwin/tacet-txt.icns
