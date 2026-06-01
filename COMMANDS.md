# Quick Reference: Essential Commands

## 🚀 Getting Started (First Time)

```bash
# 1. Navigate to project
cd g:\workspace\h&v

# 2. Dependencies already installed, but you can verify:
npm install

# 3. Create environment file
copy .env.example .env.local

# 4. Edit .env.local with your MongoDB URI and generate a secret:
# Use this command to generate NEXTAUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 5. Seed the admin account - USE ONE OF THESE:
./seed.bat                                              # Windows (easiest - use this!)
node ./node_modules/ts-node/dist/bin.js --transpile-only scripts/seed-admin.ts  # Direct node

# 6. Start development server - USE ONE OF THESE:
./dev.bat                                       # Windows (easiest - use this!)
node ./node_modules/next/dist/bin/next dev    # Direct node
npx next dev                                    # Alternative

# 7. Open in browser
# http://localhost:3000

# 8. Login to admin
# Email: admin@store.com
# Password: Admin@12345
# URL: http://localhost:3000/admin
```

---

## 📝 Common Commands

### Development (Windows)
```bash
./dev.bat              # Start dev server (recommended)
./build.bat            # Build for production
./seed.bat             # Seed admin account
```

### Development (Mac/Linux)
```bash
chmod +x dev.sh build.sh seed.sh  # Make executable (first time only)
./dev.sh               # Start dev server
./build.sh             # Build for production
npm run seed           # Seed admin account
```

### Direct Node Commands (All Platforms)
```bash
node ./node_modules/next/dist/bin/next dev              # Dev server
node ./node_modules/next/dist/bin/next build            # Build
node ./node_modules/ts-node/dist/bin.js --transpile-only scripts/seed-admin.ts  # Seed
```

### Alternative (If npx works)
```bash
npx next dev            # Start dev server
npx next build          # Build for production
npx ts-node scripts/seed-admin.ts  # Seed admin
```

### Linting & Code Quality
```bash
npm run lint            # Run ESLint
npm audit               # Check for vulnerabilities
npm audit fix           # Auto-fix vulnerabilities (if safe)
```

### Cleanup
```bash
npm install             # Reinstall dependencies
rm -r .next            # Remove Next.js build cache
rm -r node_modules     # Remove all packages
npm cache clean --force # Clear npm cache (if needed)
```

---

## 🔗 Important URLs

### Development URLs
```
Homepage:           http://localhost:3000
Products:           http://localhost:3000/products
Login:              http://localhost:3000/login
Register:           http://localhost:3000/register
Admin Dashboard:    http://localhost:3000/admin
Admin Products:     http://localhost:3000/admin/products
Admin Users:        http://localhost:3000/admin/users
Admin Orders:       http://localhost:3000/admin/orders
Admin Settings:     http://localhost:3000/admin/settings
```

### Default Credentials
```
Email:    admin@store.com
Password: Admin@12345
```

---

## 🔧 Troubleshooting Commands

### Port Already in Use (Windows)
```bash
netstat -ano | findstr :3000           # Find process using port 3000
taskkill /PID <PID_NUMBER> /F          # Kill the process

# Then restart:
npx next dev
```

### Port Already in Use (Mac/Linux)
```bash
lsof -i :3000                  # Find process using port 3000
kill -9 <PID_NUMBER>           # Kill the process

# Then restart:
npx next dev
```

### Clear All Caches & Reinstall
```bash
rm -r .next
rm -r node_modules
rm package-lock.json
npm install
npx next dev
```

### MongoDB Connection Test
```bash
# Test connection string by trying to connect
# Use MongoDB Compass (GUI tool) or mongosh CLI
mongosh "your-connection-string"
```

### Check Node & npm Versions
```bash
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
```

---

## 📋 Setup Checklist

- [ ] Clone/download project
- [ ] Open in VS Code
- [ ] `npm install` (already done)
- [ ] Create `.env.local` from `.env.example`
- [ ] Add MongoDB URI to `.env.local`
- [ ] Generate and add NEXTAUTH_SECRET to `.env.local`
- [ ] Run `npm run seed` to create admin
- [ ] Run `npx next dev` to start dev server
- [ ] Open http://localhost:3000 in browser
- [ ] Login with admin@store.com / Admin@12345
- [ ] Change default admin password

---

## 🌍 Environment Variables

**Required in .env.local:**

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# NextAuth secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXTAUTH_SECRET=your-secret-here-at-least-32-characters

# App URL (change to your domain in production)
NEXTAUTH_URL=http://localhost:3000

# Admin password (optional, defaults to Admin@12345)
ADMIN_PASSWORD=Admin@12345
```

---

## 📦 Project Structure Quick Reference

```
app/                    # Next.js App Router pages
├── api/                # API routes
│   ├── auth/          # Authentication endpoints
│   ├── admin/         # Admin API endpoints
│   └── orders/        # Order endpoints
├── admin/             # Admin pages (protected)
├── products/          # Product pages
├── cart/              # Cart page
├── checkout/          # Checkout page
├── login/             # Login page
├── register/          # Register page
├── profile/           # User profile page
└── page.tsx           # Homepage

components/            # Reusable React components
├── Button.tsx
├── Input.tsx
├── ProductCard.tsx
└── AdminShell.tsx     # Admin layout wrapper

lib/                   # Shared utilities
├── mongodb.ts         # Database connection
├── auth.ts            # NextAuth configuration
├── models/            # MongoDB Mongoose models
└── validators.ts      # Zod validation schemas

scripts/               # Utility scripts
└── seed-admin.ts      # Seed admin account script
```

---

## 🎨 Component Reusability Examples

```typescript
// Button Component (Multiple variants)
import Button from '@/components/Button'

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Input Component
import Input from '@/components/Input'

<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />

// ProductCard Component
import ProductCard from '@/components/ProductCard'

<ProductCard product={productData} />
```

---

## 🔐 Security Checklist

- [ ] NEXTAUTH_SECRET is unique and secure
- [ ] MongoDB password is strong
- [ ] Default admin password is changed
- [ ] No sensitive data in .env.example
- [ ] Passwords are hashed before storage
- [ ] Protected routes have role checks
- [ ] API routes validate user roles
- [ ] HTTPS enabled in production
- [ ] Environment variables never committed to git

---

## 🚀 Deployment Steps

```bash
# 1. Build the project
npm run build
# or
npx next build

# 2. Start production server
npm start
# or
npx next start

# 3. Verify it works
# Test at your production URL
```

For Vercel (recommended):
```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect GitHub to Vercel at vercel.com
# 3. Select project and deploy
# 4. Set environment variables in Vercel dashboard
# 5. Auto-deploys on git push
```

---

## 💡 Pro Tips

1. **Use npx for commands** if npm scripts fail due to workspace path:
   ```bash
   npx next dev        # Instead of: npm run dev
   npx next build      # Instead of: npm run build
   ```

2. **Hot Module Replacement** (HMR) works automatically:
   - Edit a file and save
   - Browser auto-refreshes
   - State is preserved (usually)

3. **Fast Refresh** in development:
   - Edit React components
   - See changes instantly
   - Don't lose form state

4. **Use _document.tsx** for custom HTML:
   - Global styles
   - Meta tags
   - Scripts

5. **Debugging with VS Code**:
   - Set breakpoints
   - Use Chrome DevTools
   - Check Network tab for API calls

---

## ❓ When Things Go Wrong

**Try these in order:**

1. ```bash
   # Clear caches
   rm -r .next
   ```

2. ```bash
   # Restart dev server
   # (Ctrl+C to stop, then start again)
   npx next dev
   ```

3. ```bash
   # Clear browser cache
   # (Ctrl+Shift+Delete in most browsers)
   ```

4. ```bash
   # Reinstall dependencies
   rm -r node_modules
   npm install
   ```

5. Check TROUBLESHOOTING.md for more solutions

---

## 📚 Documentation Files

- **README.md** - Complete guide with all features
- **SETUP.md** - Initial setup instructions
- **PROJECT_SUMMARY.md** - Feature checklist and overview
- **TROUBLESHOOTING.md** - Common issues and fixes
- **package.json** - Dependencies and scripts
- **.env.example** - Environment template

---

**Happy Coding! 🎉**

For more help, see the documentation files listed above.
