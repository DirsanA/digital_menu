import './globals.css';
import { SocketProvider } from '@/context/SocketContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Bistro Noir — Digital Menu',
  description: 'Browse our menu, customise your order, and track it live from your table.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          <CartProvider>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                {children}
              </main>
            </div>
          </CartProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
