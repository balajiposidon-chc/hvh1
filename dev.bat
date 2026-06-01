@echo off
REM Helper script to run Next.js dev server
REM This works around the ampersand issue in the folder path

cd /d "%~dp0"
node ./node_modules/next/dist/bin/next dev %*
