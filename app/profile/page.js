import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { User, Mail, ClipboardList, ShoppingBag } from 'lucide-react';

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
    // Retrieve orders matching user id
    const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container px-4 px-lg-5 py-5 flex-grow-1">
          <div className="col-lg-10 mx-auto animate__animated animate__fadeIn">
            {/* Header Title */}
            <div className="mb-5 text-center text-md-start">
              <span className="text-uppercase tracking-wider fw-bold text-cherry fs-7 mb-1 d-block" style={{ letterSpacing: '2px' }}>
                Dashboard
              </span>
              <h1 className="display-5 fw-bold text-dark m-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                My Profile
              </h1>
              <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.95rem' }}>
                Manage your credentials and check your past regional harvest purchases.
              </p>
            </div>

            {/* Account Details Block */}
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="p-4 bg-white rounded-4 shadow-sm border border-light d-flex align-items-center gap-3">
                  <div className="bg-cherry-light text-cherry p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
                    <User size={24} />
                  </div>
                  <div>
                    <span className="text-muted small">Full Name</span>
                    <h5 className="fw-bold text-dark mb-0">{session.user.name}</h5>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-4 bg-white rounded-4 shadow-sm border border-light d-flex align-items-center gap-3">
                  <div className="bg-cherry-light text-cherry p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <span className="text-muted small">Email Address</span>
                    <h5 className="fw-bold text-dark mb-0 text-break">{session.user.email}</h5>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History Section */}
            <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light">
              <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom border-light d-flex align-items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <ClipboardList size={22} className="text-cherry" />
                <span>Order History</span>
              </h4>

              {orders.length === 0 ? (
                <div className="text-center py-5 bg-gold-light rounded-3 border border-dashed border-light">
                  <div className="fs-2 mb-2">📦</div>
                  <h6 className="fw-bold text-dark mb-1">No Orders Yet</h6>
                  <p className="text-muted small px-3">You haven't placed any spice orders with us yet.</p>
                  <Link href="/products" className="btn btn-sm btn-cherry rounded-pill mt-2 text-decoration-none">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {orders.map((order) => {
                    const orderStatus = order.status || 'Pending';
                    const isDelivered = orderStatus.toLowerCase() === 'delivered';
                    const isCancelled = orderStatus.toLowerCase() === 'cancelled';
                    
                    return (
                      <div key={order._id.toString()} className="p-4 bg-light rounded-4 border border-light d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                        <div>
                          <p className="text-muted small mb-1">
                            Order Placed: <strong className="text-dark">{new Date(order.createdAt).toLocaleDateString()}</strong>
                          </p>
                          <h6 className="fw-bold text-dark mb-0">Total Paid: <span className="text-cherry">₹{order.total.toFixed(2)}</span></h6>
                          <small className="text-muted">{order.items?.length || 0} items purchased</small>
                        </div>
                        <div>
                          <span className={`badge rounded-pill px-3 py-2 fw-semibold ${
                            isDelivered 
                              ? 'bg-success bg-opacity-10 text-success' 
                              : isCancelled 
                                ? 'bg-danger bg-opacity-10 text-danger' 
                                : 'bg-warning bg-opacity-10 text-warning'
                          }`} style={{ fontSize: '0.75rem' }}>
                            {orderStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
}
