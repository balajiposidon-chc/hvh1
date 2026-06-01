# Workspace Path Workarounds & Troubleshooting

## ⚠️ Workspace Path Issue

The workspace folder name `h&v` contains an ampersand (`&`), which can cause issues with npm scripts on Windows because the shell interprets `&` as a special character.

### Issue Symptoms
- `npm run build` fails with PATH errors
- `npm run dev` might fail with module not found
- Build script shows: `'v\node_modules\.bin\' is not recognized`

### ✅ Solutions

#### Solution 1: Use npx Directly (Recommended)
Instead of `npm run build`, use `npx` directly:

```bash
# Development
npx next dev

# Build
npx next build

# Start production
npx next start

# Seed admin
npx ts-node scripts/seed-admin.ts
```

#### Solution 2: PowerShell with Execution Bypass
Run commands with explicit PowerShell execution policy:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "npm run dev"
powershell -NoProfile -ExecutionPolicy Bypass -Command "npm run build"
```

#### Solution 3: Use WSL (Windows Subsystem for Linux)
If installed, WSL handles paths better:

```bash
# Open WSL terminal
wsl

# Navigate to project
cd /mnt/g/workspace/h\&v

# Run commands
npm run dev
npm run build
```

#### Solution 4: Move Project to Different Path
For permanent solution, move the project to a path without special characters:

```bash
# C:\dev\hv-ecommerce
# D:\projects\hv-store
# Avoid: paths with &, !, *, ?, etc.
```

---

## 🔧 Common Issues & Fixes

### Issue: "Cannot find module 'next'"
**Cause:** npm scripts failing due to PATH issues
**Fix:**
```bash
npx next dev
```

### Issue: MongoDB Connection Timeout
**Cause:** Connection string incorrect or network issue
**Fix:**
1. Verify MONGODB_URI in .env.local
2. Check MongoDB Atlas firewall whitelist (add your IP)
3. Ensure database user has correct permissions
4. Test connection string manually in MongoDB Compass

```env
# Example MongoDB Atlas connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/databasename?retryWrites=true&w=majority
```

### Issue: "Admin@store.com already exists" when seeding
**Cause:** Seed script already ran once
**Fix:**
- This is expected behavior (prevents duplicates)
- Admin account is already created
- Just proceed to login

### Issue: Login fails after seeding
**Cause:** Several possible reasons
**Fix:**
1. Clear browser cookies: Ctrl+Shift+Delete
2. Verify .env.local has NEXTAUTH_SECRET set
3. Restart dev server (Ctrl+C, then npm run dev or npx next dev)
4. Check that password matches what was seeded
5. Ensure database has the user (check MongoDB)

### Issue: TypeScript errors in components
**Cause:** Cache issues
**Fix:**
```bash
rm -r .next
npx next dev
```

### Issue: "Port 3000 already in use"
**Cause:** Another process is using port 3000
**Fix:**
```bash
# Use different port
npx next dev -p 3001

# Or kill process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### Issue: Tailwind CSS not loading
**Cause:** Build cache or missing configuration
**Fix:**
```bash
rm -r .next node_modules/.cache
npx next dev
```

### Issue: NextAuth session not persisting
**Cause:** Configuration or cookie issues
**Fix:**
1. Verify NEXTAUTH_SECRET in .env.local
2. Clear browser cookies
3. Check browser allows third-party cookies
4. Restart dev server
5. Try in incognito window

### Issue: Admin routes not accessible
**Cause:** Role not set correctly in database
**Fix:**
1. Login with admin@store.com
2. Check user role in MongoDB: `db.users.findOne({email: "admin@store.com"})`
3. If role is wrong: `db.users.updateOne({email: "admin@store.com"}, {$set: {role: "admin"}})`
4. Clear cookies and refresh

### Issue: Products not showing on homepage
**Cause:** No products marked as featured in database
**Fix:**
1. Go to /admin/products
2. Create a new product
3. Mark it as "Featured product"
4. Refresh homepage

### Issue: "EACCES: permission denied" on Linux/Mac
**Cause:** Node modules permissions issue
**Fix:**
```bash
sudo chown -R $USER node_modules
```

---

## 🔍 Debug Steps

### General Debugging
1. **Check .env.local exists and has all variables:**
   ```bash
   cat .env.local  # Mac/Linux
   type .env.local # Windows
   ```

2. **Verify Node version:**
   ```bash
   node --version  # Should be 18+
   npm --version   # Should be 9+
   ```

3. **Check database connection:**
   - Test MongoDB URI in MongoDB Compass
   - Verify firewall rules
   - Check database credentials

4. **Clear all caches:**
   ```bash
   rm -rf .next node_modules/.cache
   npm install
   npx next dev
   ```

5. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API failures

### MongoDB Debugging

```bash
# Check if MongoDB is running (if using local)
mongosh

# Or use MongoDB Compass GUI
# https://www.mongodb.com/products/tools/compass
```

---

## 🚀 Development Tips

### Use Absolute Imports
Instead of relative imports:
```typescript
// ❌ Avoid
import Button from '../../../components/Button'

// ✅ Use
import Button from '@/components/Button'
```

### Organize Components
```
components/
├── ui/
│   ├── Button.tsx
│   └── Input.tsx
├── admin/
│   ├── AdminShell.tsx
│   └── AdminProductForm.tsx
└── public/
    ├── ProductCard.tsx
    └── SiteHeader.tsx
```

### Hot Module Replacement (HMR)
- Dev server auto-reloads on file changes
- No need to restart manually
- Keep browser DevTools open to avoid loss of state

### Debugging with VS Code
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 📱 Testing

### Test Login Flow
1. Go to http://localhost:3000/login
2. Enter: admin@store.com / Admin@12345
3. Should redirect to /profile
4. Check browser shows logged-in state

### Test Admin Dashboard
1. Login as admin
2. Go to http://localhost:3000/admin
3. Should see dashboard with metrics
4. Sidebar should have all admin links

### Test Product Management
1. Go to /admin/products/new
2. Create a product with all fields
3. Product should appear in /admin/products list
4. Should be visible in /products and /

### Test Public Pages
1. Browse /products
2. Click on a product
3. Add to cart
4. View cart at /cart
5. Proceed to checkout (requires login)

---

## 🎯 Performance Tips

### Optimize Images
- Use Next.js Image component
- Compress images before upload
- Use modern formats (WebP)

### Database Optimization
- Add indexes on frequently queried fields
- Limit results in queries
- Use pagination for large datasets

### Bundle Size
- Check build output: `npm run build`
- Use dynamic imports for code splitting
- Remove unused dependencies

---

## 🌐 Deployment Checklist

Before deploying to production:

- [ ] Update NEXTAUTH_SECRET to production value
- [ ] Change admin password
- [ ] Use production MongoDB URI
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Set up environment variables in hosting
- [ ] Test all features in staging
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Review security checklist in README.md

---

## 📞 Getting Help

If issues persist:

1. **Check the logs:**
   - Browser console (F12)
   - Terminal output
   - MongoDB logs

2. **Search existing issues:**
   - Next.js docs: https://nextjs.org/docs
   - NextAuth docs: https://next-auth.js.org
   - MongoDB docs: https://www.mongodb.com/docs

3. **Isolate the problem:**
   - Test with simple examples
   - Check one component at a time
   - Use browser DevTools

4. **Common fixes:**
   - Clear cache: `.next` and `node_modules`
   - Restart dev server
   - Update dependencies
   - Clear browser cookies

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] npm install completes without critical errors
- [ ] .env.local file exists with all variables
- [ ] Admin user seeds successfully
- [ ] Dev server starts: `npx next dev`
- [ ] Homepage loads at localhost:3000
- [ ] Login page works
- [ ] Admin login succeeds
- [ ] Admin dashboard accessible
- [ ] Products can be created
- [ ] Products appear on homepage
- [ ] Cart functionality works
- [ ] Public product pages work

---

Good luck! Happy coding! 🚀
