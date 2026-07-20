'use client';

import { SocketProvider } from '@/context/SocketContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import LandingChatbot from '@/components/LandingChatbot';
import { usePathname } from 'next/navigation';

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const isFullWidthPage = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <CartProvider>
            {isFullWidthPage ? (
              children
            ) : (
              <div className="app-container">
                <main className="main-content">
                  {children}
                </main>
              </div>
            )}
          </CartProvider>
        </SocketProvider>
        <LandingChatbot />
      </ToastProvider>
    </AuthProvider>
  );
}