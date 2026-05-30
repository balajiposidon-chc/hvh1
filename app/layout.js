import 'animate.css';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export const metadata = {
  title: 'Hill & Valley | Premium Regional Spice & Organic Marketplace',
  description: 'A luxury spice and organic food marketplace with ERP-style controls and premium customer experience.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-cream text-charcoal antialiased"> 
        <AuthProvider>
          <CartProvider>
            <ToastContainer position="top-right" theme="light" autoClose={2500} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cream via-sand to-white text-charcoal">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
