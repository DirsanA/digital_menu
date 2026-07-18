'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, ChefHat, Eye } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin') || pathname === '/login';

  return (
    <nav className="navbar glass">
      <div className="nav-logo">
        <Utensils size={24} className="text-primary" />
        <span>Digital Menu</span>
      </div>
      <Link
        href={isAdminPage ? '/' : '/login'}
        className="nav-toggle-btn"
      >
        {isAdminPage ? (
          <>
            <Eye size={16} />
            <span>Customer Menu</span>
          </>
        ) : (
          <>
            <ChefHat size={16} />
            <span>Staff</span>
          </>
        )}
      </Link>
    </nav>
  );
}
