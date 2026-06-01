# Helper Scripts for Ampersand Path Issue

Due to the workspace folder name containing an ampersand (`h&v`), npm scripts may fail on Windows with PATH errors.

## ✅ Solution: Use These Helper Scripts

### Windows Batch Scripts

#### `dev.bat` - Start Development Server
```bash
./dev.bat
```
Equivalent to: `npm run dev`

#### `build.bat` - Build for Production  
```bash
./build.bat
```
Equivalent to: `npm run build`

#### `seed.bat` - Seed Admin Account
```bash
./seed.bat
```
Equivalent to: `npm run seed`

---

### Unix/Mac/Linux Shell Scripts

First make scripts executable (one time only):
```bash
chmod +x dev.sh build.sh seed.sh
```

#### `dev.sh` - Start Development Server
```bash
./dev.sh
```

#### `build.sh` - Build for Production
```bash
./build.sh
```

---

## 📋 What These Scripts Do

Each script:
1. Changes to the project directory (handles the ampersand path)
2. Invokes the Node module directly (avoiding npm's PATH issues)
3. Passes any additional arguments to the command

This bypasses npm's batch file wrapper which doesn't handle special characters well.

---

## 🚀 Quick Start with Scripts

```bash
# Windows
./seed.bat
./dev.bat
# Then open: http://localhost:3000

# Mac/Linux
chmod +x seed.sh dev.sh
./seed.sh
./dev.sh
# Then open: http://localhost:3000
```

---

## 🔧 Manual Command Equivalents

If you prefer not to use the scripts:

**Windows (PowerShell/CMD):**
```bash
node ./node_modules/next/dist/bin/next dev
node ./node_modules/next/dist/bin/next build
node ./node_modules/ts-node/dist/bin.js --transpile-only scripts/seed-admin.ts
```

**Mac/Linux:**
```bash
./node_modules/.bin/next dev
./node_modules/.bin/next build
npm run seed
```

---

## 💡 Pro Tip

If you're frequently running commands, create an alias:

**PowerShell:**
```powershell
Set-Alias dev ".\dev.bat"
Set-Alias build ".\build.bat"
Set-Alias seed ".\seed.bat"
```

**Bash (Mac/Linux):**
```bash
alias dev="./dev.sh"
alias build="./build.sh"
alias seed="./seed.sh"
```

---

## ✨ Why Scripts?

The ampersand in `h&v` causes issues because:
- Windows batch interpreters see `&` as a command separator
- npm's shim files (`*.cmd`) can't properly quote complex paths
- Node doesn't interpret the path correctly

The helper scripts directly invoke Node, bypassing these issues entirely.

---

## 📝 Notes

- These scripts assume the current working directory is the project root
- All scripts accept additional arguments (e.g., `./dev.bat -p 3001`)
- Scripts are cross-platform compatible (use .bat on Windows, .sh on Unix)
- No external dependencies required - just Node.js

Happy coding! 🎉
