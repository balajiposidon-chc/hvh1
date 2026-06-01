#!/bin/bash
# Helper script for Unix-like systems (Mac/Linux)
cd "$(dirname "$0")"
node ./node_modules/next/dist/bin/next dev "$@"
