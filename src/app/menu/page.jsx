import React, { Suspense } from 'react';
import CustomerView from '@/components/CustomerView';

export const metadata = {
  title: 'Menu — Bistro Noir',
  description: 'Browse our menu, customise your order, and track it live from your table.',
};

function MenuFallback() {
  return (
    <div className="view-loader-container">
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Loading menu…</p>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuFallback />}>
      <CustomerView />
    </Suspense>
  );
}
