@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
where pnpm >nul 2>nul
if errorlevel 1 set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;%PATH%"
if not exist node_modules (
  call pnpm install
  if errorlevel 1 exit /b 1
)
node node_modules\vite\bin\vite.js --host 127.0.0.1 --open
