'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { BarChart3, Building2, Users, ShoppingBag, DollarSign, TrendingUp, Clock } from 'lucide-react';

function PlatformAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/analytics')
      .then(data => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  const tenants = analytics?.tenants || [];
  const activeTenants = tenants.filter(t => t.isActive);
  const totalUsers = tenants.reduce((s, t) => s + (t._count?.users || 0), 0);

  return (
    <>
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
        <div className="section-header"><h3><Building2 size={18} /> All Restaurants</h3></div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Restaurant</th><th>Status</th><th>Users</th><th>Menu Items</th><th>Orders</th><th>Created</th></tr></thead>
            <tbody>
              {tenants.length === 0 && <tr><td colSpan={6} className="empty-cell">No data yet.</td></tr>}
              {tenants.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
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
    </>
  );
}

function OwnerAnalytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/orders')
      .then(data => {
        if (data) setOrders(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  const total = orders.length;
  const completed = orders.filter(o => o.status === 'completed');
  const cancelled = orders.filter(o => o.status === 'cancelled');
  const revenue = completed.reduce((s, o) => s + o.totalAmount, 0);
  const avgOrder = completed.length ? revenue / completed.length : 0;
  const itemsSold = completed.reduce((s, o) => s + (o.items?.reduce((si, i) => si + i.quantity, 0) || 0), 0);

  const statusBreakdown = [
    { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'var(--accent)' },
    { label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length, color: 'var(--primary-light)' },
    { label: 'Ready', count: orders.filter(o => o.status === 'ready').length, color: 'var(--success)' },
    { label: 'Completed', count: completed.length, color: 'var(--success)' },
    { label: 'Cancelled', count: cancelled.length, color: 'var(--danger)' },
  ];

  return (
    <>
      <div className="dashboard-metrics">
        <div className="metric-card glass">
          <div className="metric-icon bg-indigo-glow"><DollarSign size={22} /></div>
          <div className="metric-data"><span>Total Revenue</span><h2>${revenue.toFixed(2)}</h2></div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-emerald-glow"><ShoppingBag size={22} /></div>
          <div className="metric-data"><span>Orders</span><h2>{total}</h2></div>
          <div className="metric-detail">{completed.length} completed</div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-amber-glow"><TrendingUp size={22} /></div>
          <div className="metric-data"><span>Avg. Order</span><h2>${avgOrder.toFixed(2)}</h2></div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-pink-glow"><Users size={22} /></div>
          <div className="metric-data"><span>Items Sold</span><h2>{itemsSold}</h2></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section glass">
          <div className="section-header"><h3><BarChart3 size={18} /> Order Status Breakdown</h3></div>
          <div className="revenue-breakdown">
            {statusBreakdown.map(s => {
              const pct = total ? (s.count / total * 100).toFixed(1) : 0;
              return (
                <div key={s.label} className="breakdown-row">
                  <span className="breakdown-label">{s.label}</span>
                  <div className="breakdown-bar-wrap">
                    <div className="breakdown-bar" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                  <span className="breakdown-value">{s.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-section glass">
          <div className="section-header"><h3><DollarSign size={18} />  Summary</h3></div>
          <div className="sales-summary">
            <div className="summary-stat"><span>Total Orders</span><strong>{total}</strong></div>
            <div className="summary-stat"><span>Completed</span><strong>{completed.length}</strong></div>
            <div className="summary-stat"><span>Cancelled</span><strong>{cancelled.length}</strong></div>
            <div className="summary-stat"><span>Revenue</span><strong>${revenue.toFixed(2)}</strong></div>
            <div className="summary-stat"><span>Avg Ticket</span><strong>${avgOrder.toFixed(2)}</strong></div>
            <div className="summary-stat"><span>Items Sold</span><strong>{itemsSold}</strong></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AnalyticsPage() {
  const { isSuperAdmin } = useAuth();
  return (
    <div className="analytics-page fade-in">
      <div className="page-header"><h1><BarChart3 size={22} /> {isSuperAdmin ? 'Platform Analytics' : 'Analytics'}</h1></div>
      {isSuperAdmin ? <PlatformAnalytics /> : <OwnerAnalytics />}
    </div>
  );
}
