'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, ChefHat, Users, FileText,
  Receipt, CalendarClock, QrCode, LogOut,
  Menu as MenuIcon, X, Store, DollarSign, Utensils, Building2,
  BarChart3, Flag, ClipboardList, BadgeCheck,
} from 'lucide-react';

const superAdminNav = [
  {
    label: 'Platform',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/tenants', label: 'Restaurants', icon: Building2 },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/pricing', label: 'Pricing Plans', icon: DollarSign },
      { href: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
    ],
  },
];

const managerNav = [
  {
    label: 'General',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/menu', label: 'Menu', icon: ClipboardList },
      { href: '/admin/categories', label: 'Categories', icon: FileText },
      { href: '/admin/qrcodes', label: 'QR Codes', icon: QrCode },
      { href: '/admin/users', label: 'Staff', icon: Users },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
];

const staffNav = [
  {
    label: 'Orders',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    ],
  },
];

const waiterNav = [
  {
    label: 'Orders',
    items: [
      { href: '/admin/orders', label: 'Approve Orders', icon: BadgeCheck },
    ],
  },
];

const kitchenNav = [
  {
    label: 'Kitchen',
    items: [
      { href: '/admin/kitchen', label: 'Kitchen Display', icon: ChefHat },
    ],
  },
];

const roleBadgeColors = {
  super_admin: 'badge-danger',
  manager: 'badge-accent',
  cashier: 'badge-primary',
  waiter: 'badge-primary',
  kitchen_staff: 'badge-success',
};

const navConfig = {
  super_admin: superAdminNav,
  manager: managerNav,
  cashier: staffNav,
  waiter: waiterNav,
  kitchen_staff: kitchenNav,
};

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const navGroups = navConfig[user?.role] || managerNav;
  const isActive = (href) => pathname === href;
  const currentPage = navGroups.flatMap(g => g.items).find(i => isActive(i.href));
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="admin-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar glass ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand sidebar-brand-minimal">
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.displayName || user?.email}</span>
            <span className={`sidebar-user-role ${roleBadgeColors[user?.role] || 'badge-primary'}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          {user?.tenantName && (
            <div className="sidebar-user-tenant"><Store size={12} /> {user.tenantName}</div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label} className="sidebar-nav-group">
              <span className="sidebar-nav-label">{group.label}</span>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={17} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={logout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar glass">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}><MenuIcon size={20} /></button>
          <div className="admin-topbar-title">{currentPage?.label || 'Dashboard'}</div>
          <div className="admin-topbar-spacer" />
          <Link href="/" className="admin-topbar-link"><Utensils size={15} /> View Menu</Link>
        </header>
        <main className="admin-page-content">{children}</main>
      </div>
    </div>
  );
}
