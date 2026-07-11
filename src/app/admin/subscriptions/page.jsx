'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { CreditCard, Search, Check, X } from 'lucide-react';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([fetchSubscriptions(), fetchPlans()]);
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const data = await apiFetch('/subscriptions');
      if (Array.isArray(data)) setSubscriptions(data);
      else if (data) setSubscriptions([data]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchPlans = async () => {
    try { const data = await apiFetch('/admin/pricing'); if (data) setPlans(data); }
    catch (err) { console.error(err); }
  };

  const handleUpdatePlan = async (subId, planId) => {
    try {
      await apiFetch(`/subscriptions/${subId}`, {
        method: 'PUT',
        body: JSON.stringify({ planId }),
      });
      fetchSubscriptions();
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (subId, status) => {
    try {
      await apiFetch(`/subscriptions/${subId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      fetchSubscriptions();
    } catch (err) { console.error(err); }
  };

  const filtered = subscriptions.filter(s =>
    !searchQuery || s.tenant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><CreditCard size={22} /> Subscriptions</h1>
        <div className="search-wrapper" style={{ width: '220px' }}>
          <Search size={15} className="search-icon" />
          <input type="text" placeholder="Search by restaurant…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="data-card glass">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Restaurant</th><th>Plan</th><th>Status</th><th>Start Date</th><th>End Date</th><th>Auto Renew</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="empty-cell">No subscriptions found.</td></tr>}
              {filtered.map(sub => (
                <tr key={sub.id}>
                  <td><strong>{sub.tenant?.name || 'Unknown'}</strong></td>
                  <td>
                    <select
                      className="catalog-filter"
                      value={sub.planId}
                      onChange={(e) => handleUpdatePlan(sub.id, e.target.value)}
                    >
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price}/mo)</option>)}
                    </select>
                  </td>
                  <td><span className={`status-badge status-${sub.status}`}>{sub.status}</span></td>
                  <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                  <td>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}</td>
                  <td>{sub.autoRenew ? <Check size={16} style={{ color: 'var(--success)' }} /> : <X size={16} style={{ color: 'var(--text-muted)' }} />}</td>
                  <td className="action-cell">
                    {sub.status === 'active' && (
                      <button className="btn-sm btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => handleUpdateStatus(sub.id, 'cancelled')}>Cancel</button>
                    )}
                    {sub.status === 'cancelled' && (
                      <button className="btn-sm btn-primary" onClick={() => handleUpdateStatus(sub.id, 'active')}>Reactivate</button>
                    )}
                    {sub.status === 'trialing' && (
                      <button className="btn-sm btn-primary" onClick={() => handleUpdateStatus(sub.id, 'active')}>Activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
