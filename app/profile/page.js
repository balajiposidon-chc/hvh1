import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return (
          <div className="bg-gold-light min-vh-100 flex-column d-flex">
            <SiteHeader />
            <main className="container py-5 text-center flex-grow-1 d-flex align-items-center justify-content-center">
              <div className="text-center py-5 bg-white p-5 rounded-4 shadow-sm border border-light animate__animated animate__fadeIn" style={{ maxWidth: '500px' }}>
                <span className="fs-1 d-block mb-3">🔒</span>
                <h1 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Access Denied</h1>
                <p className="text-muted small">You need to sign in to access your personal profile and order history.</p>
                <Link href="/login" className="btn btn-cherry mt-4 rounded-pill px-4 text-decoration-none">
                  Sign In
                </Link>
              </div>
            </main>
            <Footer />
          </div>
        );
    }

    await connectToDatabase();
    // Retrieve full user profile
    const dbUser = await User.findById(session.user.id).lean();
    // Retrieve orders matching user id
    const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();

    const serializedUser = JSON.parse(JSON.stringify(dbUser || {}));
    const serializedOrders = JSON.parse(JSON.stringify(orders || []));

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container px-4 px-lg-5 py-5 flex-grow-1">
          <ProfileClient initialUser={serializedUser} initialOrders={serializedOrders} />
        </main>

        <Footer />
      </div>
    );
}
