@echo off
REM Helper script to build Next.js project
REM This works around the ampersand issue in the folder path

cd /d "%~dp0"
node ./node_modules/next/dist/bin/next build %*
