#!/usr/bin/env node

/**
 * Quick Setup Guide
 * 
 * NOTE: The workspace folder name "h&v" contains an ampersand which can cause
 * issues with npm scripts on Windows. If you encounter PATH-related errors,
 * try these workarounds:
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║           HV ECOMMERCE - SETUP & QUICK START GUIDE                ║
╚════════════════════════════════════════════════════════════════════╝

✅ INSTALLATION COMPLETE

Your Next.js ecommerce store is ready! Follow these steps:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 STEP 1: Configure Environment Variables

  1. Create .env.local file (copy from .env.example):
  
     cp .env.example .env.local
  
  2. Update .env.local with your settings:
  
     MONGODB_URI=your-mongodb-connection-string
     NEXTAUTH_SECRET=your-secret-key-here
     NEXTAUTH_URL=http://localhost:3000
     ADMIN_PASSWORD=Admin@12345

  💡 Generate a secure NEXTAUTH_SECRET:
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌱 STEP 2: Seed Admin Account

  Run the seed script to create the default admin user:
  
  Method A (Recommended - Direct):
    npx ts-node scripts/seed-admin.ts
  
  Method B (Using npm):
    npm run seed
  
  Default Admin Credentials:
    Email:    admin@store.com
    Password: Admin@12345

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 STEP 3: Start Development Server

  Option A (Recommended):
    npx next dev
  
  Option B (Using npm):
    npm run dev
  
  🌐 Open browser: http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 KEY URLS TO EXPLORE

  Public Pages:
    Homepage:           http://localhost:3000
    Products:           http://localhost:3000/products
    Product Details:    http://localhost:3000/products/any-slug
    Login:              http://localhost:3000/login
    Register:           http://localhost:3000/register
  
  Admin Pages (Use admin@store.com to login):
    Dashboard:          http://localhost:3000/admin
    Products:           http://localhost:3000/admin/products
    New Product:        http://localhost:3000/admin/products/new
    Users:              http://localhost:3000/admin/users
    Orders:             http://localhost:3000/admin/orders
    Settings:           http://localhost:3000/admin/settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ BUILD FOR PRODUCTION

  If you encounter PATH issues with "npm run build" on Windows due to the
  workspace name containing "&", use these alternatives:
  
  Method A (Direct npx):
    npx next build
    npx next start
  
  Method B (Environment workaround):
    set NODE_ENV=production
    npx next build
    npx next start
  
  Method C (Using PowerShell bypass):
    powershell -NoProfile -ExecutionPolicy Bypass -Command "npx next build"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ IMPORTANT NOTES

  ⚠️  Always change the default admin password after first login
  🔐  Keep NEXTAUTH_SECRET secure and unique
  🗄️  Ensure MongoDB connection is working before starting
  🌍  For production, update NEXTAUTH_URL to your domain
  📦  Dependencies installed: Next.js, React, Tailwind, MongoDB, NextAuth

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 USEFUL COMMANDS

  npm run dev           - Start development server
  npm run build         - Build for production
  npm start             - Start production server
  npm run seed          - Seed admin account
  npm run lint          - Run linter
  npm audit             - Check for vulnerabilities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆘 TROUBLESHOOTING

  Q: "Cannot find module" errors on build?
  A: The workspace path contains "&" which can confuse npm on Windows.
     Use "npx next build" instead of "npm run build"
  
  Q: MongoDB connection failing?
  A: Check MONGODB_URI is correct and whitelist your IP in MongoDB Atlas
  
  Q: Admin login not working?
  A: Run the seed script again, clear browser cache, check .env.local
  
  Q: TypeScript errors?
  A: Delete .next/ folder and restart dev server
  
  Q: Port 3000 already in use?
  A: npx next dev -p 3001  (use different port)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Happy coding! 🎉

For detailed documentation, see README.md

`);
