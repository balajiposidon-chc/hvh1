@echo off
REM Helper script to run admin seeding
REM This works around the ampersand issue in the folder path

cd /d "%~dp0"
node ./node_modules/ts-node/dist/bin.js --transpile-only scripts/seed-admin.ts %*
