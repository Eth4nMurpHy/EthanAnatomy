#!/bin/sh
set -eu
# Run inside an existing graphical session, or via xvfb-run and dbus-run-session.
smoke_dir=$(mktemp -d -t anatolume-smoke-XXXXXX)
export XDG_DATA_HOME="$smoke_dir/data"
export XDG_CONFIG_HOME="$smoke_dir/config"
export XDG_CACHE_HOME="$smoke_dir/cache"
tauri-driver &
driver_pid=$!
cleanup() {
  kill "$driver_pid" 2>/dev/null || true
  wait "$driver_pid" 2>/dev/null || true
  rm -rf "$smoke_dir"
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
node --input-type=module -e '
const deadline = Date.now() + 15000;
while (true) {
  try { const response = await fetch("http://127.0.0.1:4444/status"); if (response.ok) break; } catch {}
  if (Date.now() >= deadline) throw Error("tauri-driver did not start");
  await new Promise(resolve => setTimeout(resolve, 200));
}'
node scripts/smoke-linux.mjs
