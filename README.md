# HV Ecommerce - Full-Stack Next.js Store

A complete ecommerce platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **MongoDB/Mongoose**, **NextAuth**, and **bcryptjs**. Includes admin dashboard, product management, user management, and order processing.

## Features

✅ **Authentication & Authorization**
- Email/password registration and login
- Session-based auth with NextAuth
- Password hashing with bcryptjs
- Role-based access control (admin, manager, customer)
- Protected routes and API endpoints

✅ **Admin Dashboard** (`/admin`)
- Dashboard overview with key metrics
- Product management (create, edit, delete)
- User management (search, block/unblock, role changes)
- Order management and tracking
- Store settings and configuration

✅ **Ecommerce Features**
- Product catalog with search and filtering
- Product detail pages
- Shopping cart (localStorage-based)
- Secure checkout
- Order history for customers
- Order status tracking

✅ **Database**
- MongoDB with Mongoose ODM
- User model with roles and status
- Product model with inventory
- Order model with items and statuses
- Store settings collection

✅ **Security**
- Environment variable configuration
- Zod form validation
- Protected admin routes
- Password hashing
- CSRF protection with NextAuth

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud - MongoDB Atlas)
- Code editor (VS Code recommended)

### 2. Environment Configuration

Create a `.env.local` file in the project root with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
NEXTAUTH_SECRET=your-super-secret-key-here-change-this
NEXTAUTH_URL=http://localhost:3000
ADMIN_PASSWORD=Admin@12345
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use this quick generator:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Seed Admin Account

Create the default admin user (admin@store.com):

```bash
npm run seed
```

This creates:
- **Email:** admin@store.com
- **Password:** Admin@12345 (or your ADMIN_PASSWORD env var)
- **Role:** admin

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Admin Credentials

```
Email: admin@store.com
Password: Admin@12345
```

**⚠️ Change this password immediately after first login!**

## Project Structure

```
h&v/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   └── register/
│   │   ├── admin/
│   │   │   ├── products/
│   │   │   ├── settings/
│   │   │   └── users/
│   │   └── orders/
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── users/
│   │   ├── orders/
│   │   └── settings/
│   ├── [public pages]/
│   └── layout.tsx
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── AdminShell.tsx
│   ├── AdminProductForm.tsx
│   ├── AdminUserTable.tsx
│   ├── AdminSettingsForm.tsx
│   ├── ProductCard.tsx
│   ├── SiteHeader.tsx
│   └── Footer.tsx
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   ├── types.ts
│   ├── validators.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   └── Setting.ts
├── scripts/
│   └── seed-admin.ts
└── public/
```

## Available Pages

### Public Pages
- `/` - Homepage with featured products
- `/products` - Product catalog with search and filters
- `/products/[slug]` - Individual product details
- `/cart` - Shopping cart (localStorage)
- `/checkout` - Secure checkout
- `/login` - User login
- `/register` - New user registration
- `/profile` - User profile and order history
- `/orders` - Order tracking

### Admin Pages (Requires Admin/Manager Role)
- `/admin` - Dashboard overview
- `/admin/products` - Product management
- `/admin/products/new` - Create product
- `/admin/products/[id]/edit` - Edit product
- `/admin/users` - User management
- `/admin/orders` - Order management
- `/admin/settings` - Store configuration

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Orders
- `POST /api/orders` - Create order (requires login)

### Admin (Requires admin/manager role)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `PUT /api/admin/settings` - Update store settings

## Database Models

### User
- name, email, password (hashed)
- role: 'admin' | 'manager' | 'customer'
- status: 'active' | 'blocked'
- phone, address
- timestamps

### Product
- name, slug, description
- price, discountPrice
- category, brand
- stock, images[]
- status, featured
- timestamps

### Order
- user (ObjectId reference)
- items: [{ productId, name, price, quantity, image }]
- shippingAddress, phone
- subtotal, tax, shippingFee, total
- status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
- timestamps

### Setting
- storeName, logo, contactEmail
- phone, address
- currency, taxRate, shippingFee
- socialLinks: { facebook, instagram, twitter }

## User Roles & Permissions

### Admin
- Access full admin dashboard
- Manage products (CRUD)
- Manage users (update role, block, delete)
- Manage orders
- Update store settings
- Cannot be deleted

### Manager
- Same permissions as admin except cannot delete main admin

### Customer
- Browse products
- Create orders
- View own profile and orders
- Cannot access admin panel

## Features in Detail

### Product Management
- Create/edit/delete products
- Manage product images (image URLs)
- Update inventory/stock
- Set discount prices
- Mark products as featured
- Enable/disable products

### User Management
- Search and view all users
- Change user roles
- Block/unblock user accounts
- Delete users (except main admin)
- View user details and history

### Order Management
- View all orders with status
- Track order items and totals
- Update order status
- View customer shipping info

### Store Settings
- Update store name and branding
- Configure shipping fee
- Set tax rate
- Add contact information
- Manage social media links

## Development

### Build for Production
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## Key Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **NextAuth 4.24** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **Lucide React** - Icons

## Security Considerations

1. **Always change default admin password** after first login
2. **Use strong NEXTAUTH_SECRET** in production
3. **Enable HTTPS** in production
4. **Validate all user inputs** with Zod schemas
5. **Never expose sensitive data** in API responses
6. **Use environment variables** for secrets
7. **Implement rate limiting** for auth endpoints (recommended)
8. **Use MongoDB connection with SSL** in production

## Troubleshooting

### MongoDB Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas firewall whitelist
- Ensure database user has proper permissions

### NextAuth Not Working
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Build Errors
- Delete `node_modules` and `.next` folders
- Run `npm install` and `npm run build` again

### Admin Panel Not Accessible
- Verify you're logged in as admin/manager
- Check session cookies are enabled
- Clear browser cache

## Production Deployment

### Recommended Platforms
- **Vercel** (Next.js native)
- **Railway**
- **Heroku**
- **AWS/EC2**

### Pre-deployment Checklist
- [ ] Update NEXTAUTH_SECRET to a secure value
- [ ] Use production MongoDB URI
- [ ] Set NEXTAUTH_URL to production domain
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Update admin credentials
- [ ] Test all features thoroughly

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request

## License

This project is built for educational and commercial use.

## Support

For issues, questions, or suggestions, create an issue or check existing documentation.

---

**Last Updated:** May 2026
**Built with ❤️ using Next.js**
