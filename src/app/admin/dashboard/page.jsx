'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import {
  DollarSign, ShoppingBag, Users, Grid3X3, TrendingUp,
  Building2, CreditCard, Flag, BarChart3,
  ArrowUp, ArrowDown, Clock, ChefHat, CheckCircle2, AlertCircle,
} from 'lucide-react';

function TenantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const orders = await apiFetch('/orders');
        setRecentOrders((orders || []).slice(0, 10));
        if (orders) {
          const pending = orders.filter(o => o.status === 'pending').length;
          const preparing = orders.filter(o => o.status === 'preparing').length;
          const completed = orders.filter(o => o.status === 'completed');
          const totalRevenue = completed.reduce((s, o) => s + o.totalAmount, 0);
          setStats({ totalOrders: orders.length, pendingOrders: pending, preparingOrders: preparing, totalRevenue, completedCount: completed.length });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Welcome back{user?.displayName ? `, ${user.displayName}` : ''}</h1>
          <p className="dashboard-subtitle">
            {user?.tenantName ? `${user.tenantName} · ` : ''}
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card glass">
          <div className="metric-icon bg-indigo-glow"><DollarSign size={22} /></div>
          <div className="metric-data"><span>Today's Revenue</span><h2>${stats?.totalRevenue?.toFixed(2) || '0.00'}</h2></div>
          <div className="metric-trend positive"><ArrowUp size={14} /> Live</div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-amber-glow"><ShoppingBag size={22} /></div>
          <div className="metric-data"><span>Total Orders</span><h2>{stats?.totalOrders || 0}</h2></div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-emerald-glow"><Clock size={22} /></div>
          <div className="metric-data"><span>In Progress</span><h2>{stats?.preparingOrders || 0}</h2></div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-pink-glow"><Users size={22} /></div>
          <div className="metric-data"><span>Pending</span><h2>{stats?.pendingOrders || 0}</h2></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section glass">
          <div className="section-header">
            <h3><ChefHat size={18} /> Recent Orders</h3>
            <Link href="/admin/orders" className="section-link">View All →</Link>
          </div>
          <div className="recent-orders-list">
            {recentOrders.length === 0 ? <p className="empty-text">No orders yet today.</p> : recentOrders.map(order => (
              <div key={order.id} className="recent-order-row">
                <div className="recent-order-id">#{order.id.slice(-6).toUpperCase()}</div>
                <div className="recent-order-table">Table {order.tableNumber}</div>
                <div className="recent-order-items">{order.items?.length || 0} items</div>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
                <div className="recent-order-total">${order.totalAmount?.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section glass">
          <div className="section-header"><h3><Grid3X3 size={18} /> Quick Actions</h3></div>
          <div className="quick-actions">
            <Link href="/admin/orders" className="quick-action-btn glass-hover"><ShoppingBag size={20} /> Manage Orders</Link>
            <Link href="/admin/menu" className="quick-action-btn glass-hover"><ChefHat size={20} /> Edit Menu</Link>
            <Link href="/admin/tables" className="quick-action-btn glass-hover"><Grid3X3 size={20} /> Manage Tables</Link>
            <Link href="/admin/reports" className="quick-action-btn glass-hover"><TrendingUp size={20} /> View Reports</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function SuperAdminDashboard() {
  const { user } = useAuth();
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
  const suspendedTenants = tenants.filter(t => !t.isActive);
  const totalUsers = tenants.reduce((s, t) => s + (t._count?.users || 0), 0);

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Platform Overview</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.displayName || 'Super Admin'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card glass">
          <div className="metric-icon bg-indigo-glow"><Building2 size={22} /></div>
          <div className="metric-data"><span>Total Restaurants</span><h2>{analytics?.totalTenants || 0}</h2></div>
          <div className="metric-detail">{activeTenants.length} active · {suspendedTenants.length} suspended</div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-emerald-glow"><Users size={22} /></div>
          <div className="metric-data"><span>Total Users</span><h2>{totalUsers}</h2></div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-amber-glow"><ShoppingBag size={22} /></div>
          <div className="metric-data"><span>Total Orders</span><h2>{analytics?.totalOrders || 0}</h2></div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-pink-glow"><DollarSign size={22} /></div>
          <div className="metric-data"><span>Total Revenue</span><h2>${(analytics?.totalRevenue || 0).toFixed(2)}</h2></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section glass">
          <div className="section-header">
            <h3><Building2 size={18} /> Restaurants</h3>
            <Link href="/admin/tenants" className="section-link">Manage →</Link>
          </div>
          <div className="recent-orders-list">
            {tenants.length === 0 ? <p className="empty-text">No restaurants registered yet.</p> : tenants.slice(0, 8).map(t => (
              <div key={t.id} className="recent-order-row">
                <div className="recent-order-id" style={{ width: 'auto' }}><Building2 size={14} /></div>
                <div style={{ flex: 1 }}><strong>{t.name}</strong></div>
                <div className="recent-order-items">{t._count?.users || 0} users</div>
                <span className={`status-badge ${t.isActive ? 'status-active' : 'status-inactive'}`}>
                  {t.isActive ? 'Active' : 'Suspended'}
                </span>
                <div className="recent-order-total">{t._count?.orders || 0} orders</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section glass">
          <div className="section-header"><h3><BarChart3 size={18} /> Quick Actions</h3></div>
          <div className="quick-actions">
            <Link href="/admin/tenants" className="quick-action-btn glass-hover"><Building2 size={20} /> Manage Restaurants</Link>
            <Link href="/admin/subscriptions" className="quick-action-btn glass-hover"><CreditCard size={20} /> Subscriptions</Link>
            <Link href="/admin/pricing" className="quick-action-btn glass-hover"><DollarSign size={20} /> Pricing Plans</Link>
            <Link href="/admin/analytics" className="quick-action-btn glass-hover"><BarChart3 size={20} /> Full Analytics</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { isSuperAdmin } = useAuth();
  return (
    <div className="dashboard-page fade-in">
      {isSuperAdmin ? <SuperAdminDashboard /> : <TenantDashboard />}
    </div>
  );
}
