'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Settings as SettingsIcon, Globe, CreditCard, Save, Store, Plus, X, Shield } from 'lucide-react';

function PlatformSettings() {
  return (
    <div className="data-card glass">
      <div className="section-header">
        <h3><Shield size={18} /> Platform Settings</h3>
      </div>
      <p className="empty-text" style={{ margin: '1rem 0' }}>
        Platform-wide settings are managed through the dedicated pages:
      </p>
      <div className="quick-actions" style={{ maxWidth: '400px' }}>
        <a href="/admin/tenants" className="quick-action-btn glass-hover"><Store size={18} /> Manage Restaurants</a>
        <a href="/admin/subscriptions" className="quick-action-btn glass-hover"><CreditCard size={18} /> Subscriptions</a>
        <a href="/admin/pricing" className="quick-action-btn glass-hover"><CreditCard size={18} /> Pricing Plans</a>
        <a href="/admin/feature-flags" className="quick-action-btn glass-hover"><Shield size={18} /> Feature Flags</a>
      </div>
    </div>
  );
}

function TenantSettings() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [domains, setDomains] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [domainModal, setDomainModal] = useState(false);
  const [domainName, setDomainName] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.tenantId) {
        const t = await apiFetch(`/tenants/${user.tenantId}`).catch(() => null);
        if (t) { setTenant(t); setTenantName(t.name); setTenantSlug(t.slug); }
      }
      const [d, s] = await Promise.all([
        apiFetch('/domains').catch(() => []),
        apiFetch('/subscriptions').catch(() => null),
      ]);
      setDomains(d || []);
      setSubscription(s);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSaveTenant = async (e) => {
    e.preventDefault();
    if (!tenantName || !tenantSlug || !tenant) return;
    setSaving(true);
    try {
      await apiFetch(`/tenants/${tenant.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: tenantName, slug: tenantSlug }),
      });
      loadData();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!domainName) return;
    try {
      await apiFetch('/domains', { method: 'POST', body: JSON.stringify({ domain: domainName }) });
      setDomainModal(false); setDomainName(''); loadData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteDomain = async (id) => {
    if (!confirm('Remove this domain?')) return;
    try { await apiFetch(`/domains/${id}`, { method: 'DELETE' }); loadData(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <>
      {tenant && (
        <div className="data-card glass">
          <div className="section-header"><h3><Store size={18} /> Restaurant Profile</h3></div>
          <form onSubmit={handleSaveTenant} className="menu-item-form" style={{ maxWidth: '480px' }}>
            <div className="form-group"><label>Restaurant Name</label><input type="text" value={tenantName} onChange={e => setTenantName(e.target.value)} required /></div>
            <div className="form-group"><label>Slug</label><input type="text" value={tenantSlug} onChange={e => setTenantSlug(e.target.value)} required /></div>
            <button type="submit" className="btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save'}</button>
          </form>
        </div>
      )}

      <div className="data-card glass">
        <div className="section-header">
          <h3><Globe size={18} /> Custom Domains</h3>
          <button className="btn-primary btn-sm" onClick={() => setDomainModal(true)}><Plus size={14} /> Add Domain</button>
        </div>
        {domains.length === 0 ? <p className="empty-text">No custom domains configured.</p> : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Domain</th><th>Verified</th><th>Actions</th></tr></thead>
              <tbody>{domains.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.domain}</strong></td>
                  <td><span className={`status-badge ${d.verified ? 'status-active' : 'status-inactive'}`}>{d.verified ? 'Verified' : 'Pending'}</span></td>
                  <td className="action-cell"><button className="btn-action-icon btn-delete" onClick={() => handleDeleteDomain(d.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {subscription && (
        <div className="data-card glass">
          <div className="section-header"><h3><CreditCard size={18} /> Subscription</h3></div>
          <div className="subscription-detail">
            <div className="detail-row"><span>Plan</span><strong>{subscription.plan?.name || 'N/A'}</strong></div>
            <div className="detail-row"><span>Status</span><span className={`status-badge ${subscription.status === 'active' ? 'status-active' : `status-${subscription.status}`}`}>{subscription.status}</span></div>
            <div className="detail-row"><span>Start Date</span><strong>{new Date(subscription.startDate).toLocaleDateString()}</strong></div>
            {subscription.endDate && <div className="detail-row"><span>End Date</span><strong>{new Date(subscription.endDate).toLocaleDateString()}</strong></div>}
          </div>
        </div>
      )}

      {domainModal && (
        <div className="modal-backdrop fade-in" onClick={() => setDomainModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setDomainModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>Add Domain</h2>
              <form onSubmit={handleAddDomain} className="menu-item-form">
                <div className="form-group"><label>Domain</label><input type="text" value={domainName} onChange={e => setDomainName(e.target.value)} required placeholder="e.g. menu.myrestaurant.com" /></div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setDomainModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SettingsPage() {
  const { isSuperAdmin } = useAuth();
  return (
    <div className="settings-page fade-in">
      <div className="page-header"><h1><SettingsIcon size={22} /> Settings</h1></div>
      {isSuperAdmin ? <PlatformSettings /> : <TenantSettings />}
    </div>
  );
}
