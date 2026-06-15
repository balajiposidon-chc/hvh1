const fs = require('fs');
const path = require('path');

const srcDir = 'g:\\workspace\\eccomerce';
const destDir = 'g:\\workspace\\hillandvalley';

const filesToSync = [
  'models/Product.js',
  'models/User.js',
  'app/admin/page.js',
  'app/admin/products/page.js',
  'app/admin/products/new/page.js',
  'app/admin/products/[id]/edit/page.js',
  'app/admin/orders/page.js',
  'app/admin/users/page.js',
  'app/admin/settings/page.js',
  'app/api/admin/products/route.js',
  'app/api/admin/products/[id]/route.js',
  'app/api/admin/settings/route.js',
  'app/api/admin/users/route.js',
  'app/api/admin/users/[id]/route.js',
  'app/api/admin/roles/route.js',
  'context/AuthContext.js',
  'middleware.js',
  'app/api/accounting/route.js',
  'app/api/accounting/[id]/route.js',
  'app/superadmin-dashboard/accounting/page.js',
  'app/superadmin-dashboard/page.js',
  'app/superadmin-dashboard/products/[id]/edit/page.js',
  'app/superadmin-dashboard/products/new/page.js',
  'components/AdminLayout.js',
  'components/Sidebar.js',
  'lib/auth.js',
  'app/api/products/[slug]/route.js',
  'app/api/products/route.js',
  'app/globals.css',
  'app/api/admin/audit/route.js',
  'app/superadmin-dashboard/audit/page.js',
  'app/api/auth/permissions/route.js',
  'app/superadmin-dashboard/roles/page.js',
  'app/superadmin-dashboard/settings/page.js',
  'app/superadmin-dashboard/users/page.js',
  'app/superadmin-dashboard/products/page.js',
  'app/superadmin-dashboard/orders/page.js',
  'app/superadmin-dashboard/orders/[id]/edit/page.js',
  'app/superadmin-dashboard/stores/page.js',
  'app/api/stores/[id]/route.js',
  'app/api/orders/[id]/route.js',
  'components/AdminProductForm.js',
  'app/product/[slug]/page.js',
  'app/store-panel/page.js',
  'app/store-panel/products/page.js',
  'app/store-panel/products/new/page.js',
  'app/store-panel/products/[id]/edit/page.js',
  'app/store-panel/orders/page.js',
  'app/store-panel/accounting/page.js',
  'app/store-panel/settings/page.js',
  'app/api/store-panel/stats/route.js',
  'app/api/store-panel/products/route.js',
  'app/api/store-panel/orders/route.js',
  'app/orders/page.js',
  'app/api/dashboard/route.js',
  'app/profile/page.js',
  'components/AnalyticsPanel.js',
  'components/OrderActions.js',
  'utils/invoice.js',
  'app/api/auth/register/route.js',
  'app/api/admin/dashboard-stats/route.js',
  'app/api/orders/route.js',
  'app/api/store-panel/orders/route.js',
  'lib/validators.js',
  'models/Order.js'
];

filesToSync.forEach(relPath => {
  const srcPath = path.join(srcDir, relPath);
  const destPath = path.join(destDir, relPath);

  if (fs.existsSync(srcPath)) {
    const destSubDir = path.dirname(destPath);
    if (!fs.existsSync(destSubDir)) {
      fs.mkdirSync(destSubDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
    console.log(`Synced: ${relPath}`);
  } else {
    console.warn(`Source file not found: ${relPath}`);
  }
});

console.log('Sync complete!');
