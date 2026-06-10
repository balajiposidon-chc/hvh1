import AdminLayout from '@/components/AdminLayout';
import AdminSettingsForm from '@/components/AdminSettingsForm';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/lib/models/Setting';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
export default async function AdminSettingsPage() {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    if (!isSuperAdmin && !permissions.includes('settings')) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    await connectToDatabase();
    let setting = await Setting.findOne().lean();
    if (!setting) {
        setting = await Setting.create({});
    }
    return (<AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Store settings</h1>
        <p className="text-sm text-slate-500">Update store branding, contact details, and shipping settings.</p>
      </div>
      <AdminSettingsForm initialSettings={{
            storeName: setting.storeName || 'HV Store',
            logo: setting.logo || '',
            contactEmail: setting.contactEmail || 'info@store.com',
            phone: setting.phone || '',
            address: setting.address || '',
            currency: setting.currency || 'USD',
            taxRate: setting.taxRate || 0,
            shippingFee: setting.shippingFee || 0,
            facebook: setting.socialLinks?.facebook || '',
            instagram: setting.socialLinks?.instagram || '',
            twitter: setting.socialLinks?.twitter || '',
        }}/>
    </AdminLayout>);
}
