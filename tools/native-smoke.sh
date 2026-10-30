#!/bin/sh
set -eu
smoke_dir=$(mktemp -d -t workspace-smoke-XXXXXX)
export XDG_DATA_HOME="$smoke_dir/data" XDG_CONFIG_HOME="$smoke_dir/config" XDG_CACHE_HOME="$smoke_dir/cache"
tauri-driver &
driver_pid=$!
cleanup(){ kill "$driver_pid" 2>/dev/null || true; wait "$driver_pid" 2>/dev/null || true; rm -rf "$smoke_dir"; }
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
node --input-type=module -e 'const end=Date.now()+15000;while(true){try{if((await fetch("http://127.0.0.1:4444/status")).ok)break;}catch{}if(Date.now()>end)throw Error("Driver startup failed");await new Promise(r=>setTimeout(r,200));}'
node tests/native-smoke.mjs
