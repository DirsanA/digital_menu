'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, ChefHat, Eye } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin';

  return (
    <nav className="navbar glass">
      <div className="nav-logo">
        <Utensils size={24} className="text-primary" />
        <span>Bistro Noir</span>
      </div>
      <Link
        href={isAdmin ? '/' : '/admin'}
        className="nav-toggle-btn"
      >
        {isAdmin ? (
          <>
            <Eye size={16} />
            <span>Customer Menu</span>
          </>
        ) : (
          <>
            <ChefHat size={16} />
            <span>Staff Portal</span>
          </>
        )}
      </Link>
    </nav>
  );
}
