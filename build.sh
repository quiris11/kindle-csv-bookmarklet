#!/usr/bin/env bash
# Builds kindle-csv-bookmarklet.txt from kindle-csv-bookmarklet.js.
# Requires Node.js (terser is fetched by npx).
set -euo pipefail
cd "$(dirname "$0")"

code=$(npx --yes terser kindle-csv-bookmarklet.js --compress --mangle --format ascii_only=false,comments=false)
code=${code%;}

# Browsers URL-decode bookmarklets, so "%" followed by two hex digits would be corrupted.
if grep -qE '%[0-9A-Fa-f]{2}' <<<"$code"; then
  echo "error: output contains a %XX sequence that browsers would URL-decode" >&2
  exit 1
fi

printf 'javascript:void(%s)' "$code" > kindle-csv-bookmarklet.txt
echo "kindle-csv-bookmarklet.txt: $(wc -c < kindle-csv-bookmarklet.txt) bytes"
