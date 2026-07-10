'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { BarChart3, Building2, Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/admin/analytics');
        setAnalytics(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  const tenants = analytics?.tenants || [];
  const activeTenants = tenants.filter(t => t.isActive);
  const totalUsers = tenants.reduce((s, t) => s + (t._count?.users || 0), 0);

  return (
    <div className="analytics-page fade-in">
      <div className="page-header">
        <h1><BarChart3 size={22} /> Platform Analytics</h1>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card glass">
          <div className="metric-icon bg-indigo-glow"><Building2 size={22} /></div>
          <div className="metric-data"><span>Restaurants</span><h2>{analytics?.totalTenants || 0}</h2></div>
          <div className="metric-detail">{activeTenants.length} active · {tenants.length - activeTenants.length} suspended</div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-emerald-glow"><Users size={22} /></div>
          <div className="metric-data"><span>Total Users</span><h2>{totalUsers}</h2></div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-amber-glow"><ShoppingBag size={22} /></div>
          <div className="metric-data"><span>Orders</span><h2>{analytics?.totalOrders || 0}</h2></div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-pink-glow"><DollarSign size={22} /></div>
          <div className="metric-data"><span>Revenue</span><h2>${(analytics?.totalRevenue || 0).toFixed(2)}</h2></div>
        </div>
      </div>

      <div className="data-card glass">
        <div className="section-header">
          <h3><Building2 size={18} /> All Restaurants</h3>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Restaurant</th><th>Slug</th><th>Status</th><th>Users</th><th>Menu Items</th><th>Orders</th><th>Created</th></tr>
            </thead>
            <tbody>
              {tenants.length === 0 && <tr><td colSpan={7} className="empty-cell">No data yet.</td></tr>}
              {tenants.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td><code>{t.slug}</code></td>
                  <td><span className={`status-badge ${t.isActive ? 'status-active' : 'status-inactive'}`}>{t.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td>{t._count?.users || 0}</td>
                  <td>{t._count?.menuItems || 0}</td>
                  <td>{t._count?.orders || 0}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
