#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: run_with_heartbeat.sh <command...>" >&2
  exit 2
fi

interval="${HEARTBEAT_INTERVAL_SEC:-20}"
timeout_sec="${HEARTBEAT_TIMEOUT_SEC:-900}"

"$@" &
pid=$!
start_ts=$(date +%s)

while kill -0 "$pid" 2>/dev/null; do
  now_ts=$(date +%s)
  elapsed=$((now_ts - start_ts))
  if [ "$elapsed" -ge "$timeout_sec" ]; then
    echo "[heartbeat] timeout after ${timeout_sec}s. terminating: $*" >&2
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
    exit 124
  fi

  echo "[heartbeat] running (${elapsed}s): $*"
  sleep "$interval"
done

wait "$pid"
