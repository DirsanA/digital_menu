'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Building2, Plus, Edit, Trash2, Search, Users, ShoppingBag, UserPlus } from 'lucide-react';
import AdminModal from '@/components/AdminModal';

function getPrimaryManager(tenant) {
  return tenant?.users?.[0] || null;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [managerModal, setManagerModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [managerTenant, setManagerTenant] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [includeManagerOnCreate, setIncludeManagerOnCreate] = useState(false);

  useEffect(() => { fetchTenants(); }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try { const data = await apiFetch('/tenants'); if (data) setTenants(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetManagerFields = () => {
    setManagerEmail('');
    setManagerName('');
    setManagerPassword('');
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setIncludeManagerOnCreate(false);
    resetManagerFields();
    setModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setName(t.name);
    setSlug(t.slug);
    setModal(true);
  };

  const openManagerModal = (tenant) => {
    const manager = getPrimaryManager(tenant);
    setManagerTenant(tenant);
    setManagerEmail(manager?.email || '');
    setManagerName(manager?.displayName || '');
    setManagerPassword('');
    setManagerModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      const body = { name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') };
      if (!editing && includeManagerOnCreate) {
        if (!managerEmail || !managerPassword) {
          alert('Manager email and password are required');
          return;
        }
        body.manager = {
          email: managerEmail,
          displayName: managerName,
          password: managerPassword,
        };
      }
      if (editing) {
        await apiFetch(`/tenants/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/tenants', { method: 'POST', body: JSON.stringify(body) });
      }
      setModal(false);
      fetchTenants();
    } catch (err) { console.error(err); alert(err.message); }
  };

  const handleSaveManager = async (e) => {
    e.preventDefault();
    if (!managerTenant || !managerEmail) return;
    const existingManager = getPrimaryManager(managerTenant);
    if (!existingManager && !managerPassword) {
      alert('Password is required when creating a new manager');
      return;
    }
    try {
      const body = { email: managerEmail, displayName: managerName };
      if (managerPassword) body.password = managerPassword;
      if (existingManager) {
        await apiFetch(`/tenants/${managerTenant.id}/manager`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch(`/tenants/${managerTenant.id}/manager`, { method: 'POST', body: JSON.stringify(body) });
      }
      setManagerModal(false);
      setManagerTenant(null);
      resetManagerFields();
      fetchTenants();
    } catch (err) { console.error(err); alert(err.message); }
  };

  const handleSuspend = async (tenant) => {
    const action = tenant.isActive ? 'suspend' : 'activate';
    if (!confirm(`${action === 'suspend' ? 'Suspend' : 'Activate'} this restaurant?`)) return;
    try {
      await apiFetch(`/tenants/${tenant.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !tenant.isActive }),
      });
      fetchTenants();
    } catch (err) { console.error(err); alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this restaurant permanently? This cannot be undone.')) return;
    try { await apiFetch(`/tenants/${id}`, { method: 'DELETE' }); fetchTenants(); }
    catch (err) { console.error(err); alert(err.message); }
  };

  const filtered = tenants.filter(t =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  const primaryManager = managerTenant ? getPrimaryManager(managerTenant) : null;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><Building2 size={22} /> Restaurants</h1>
        <div className="page-header-right">
          <div className="search-wrapper" style={{ width: '220px' }}>
            <Search size={15} className="search-icon" />
            <input type="text" placeholder="Search restaurants…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Create Restaurant</button>
        </div>
      </div>

      <div className="tenant-cards-grid">
        {filtered.length === 0 && (
          <div className="data-card glass" style={{ gridColumn: '1 / -1' }}>
            <p className="empty-text">No restaurants found.</p>
          </div>
        )}
        {filtered.map(t => {
          const manager = getPrimaryManager(t);
          return (
            <div key={t.id} className="tenant-card glass">
              <div className="tenant-card-header">
                <div className="tenant-icon"><Building2 size={22} /></div>
                <div>
                  <h3>{t.name}</h3>
                  <span className="tenant-slug">{t.slug}</span>
                </div>
                <span className={`status-badge ${t.isActive ? 'status-active' : 'status-inactive'}`}>
                  {t.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>

              <div className="tenant-owner-block" style={{ margin: '0.75rem 0', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary, rgba(255,255,255,0.04))' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Primary Manager</div>
                {manager ? (
                  <div>
                    <div style={{ fontWeight: 600 }}>{manager.displayName || 'Unnamed manager'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{manager.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Login slug: <code>{t.slug}</code>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No manager assigned</div>
                )}
              </div>

              <div className="tenant-stats">
                <div className="tenant-stat"><Users size={14} /> {t._count?.users || 0} users</div>
                <div className="tenant-stat"><ShoppingBag size={14} /> {t._count?.orders || 0} orders</div>
              </div>
              <div className="tenant-date">Created {new Date(t.createdAt).toLocaleDateString()}</div>
              <div className="tenant-actions">
                <button className="btn-sm btn-primary" onClick={() => openManagerModal(t)}>
                  <UserPlus size={13} /> {manager ? 'Edit Manager' : 'Assign Manager'}
                </button>
                <button className="btn-sm btn-primary" onClick={() => openEdit(t)}><Edit size={13} /> Edit</button>
                <button className={`btn-sm ${t.isActive ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleSuspend(t)}>
                  {t.isActive ? 'Suspend' : 'Activate'}
                </button>
                <button className="btn-sm btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(t.id)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AdminModal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Restaurant' : 'Create Restaurant'}
      >
        <form onSubmit={handleSave} className="menu-item-form">
          <div className="form-group"><label>Restaurant Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Bistro Noir" /></div>
          <div className="form-group"><label>Slug</label><input type="text" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="e.g. bistronoir" /></div>

          {!editing && (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={includeManagerOnCreate} onChange={e => setIncludeManagerOnCreate(e.target.checked)} />
                Create manager account now
              </label>
              {includeManagerOnCreate && (
                <>
                  <div className="form-group"><label>Manager Email</label><input type="email" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} placeholder="manager@restaurant.com" /></div>
                  <div className="form-group"><label>Manager Name</label><input type="text" value={managerName} onChange={e => setManagerName(e.target.value)} placeholder="e.g. Daniel" /></div>
                  <div className="form-group"><label>Manager Password</label><input type="password" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} placeholder="Temporary password" /></div>
                </>
              )}
            </>
          )}

          <div className="edit-modal-actions">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={managerModal && !!managerTenant}
        onClose={() => { setManagerModal(false); setManagerTenant(null); }}
        title={primaryManager ? 'Edit Manager' : 'Assign Manager'}
      >
        {managerTenant && (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {primaryManager
                ? `Update the primary manager account for ${managerTenant.name}.`
                : `Create a manager account for ${managerTenant.name}. They will log in with the restaurant slug "${managerTenant.slug}".`}
            </p>
            <form onSubmit={handleSaveManager} className="menu-item-form">
              <div className="form-group"><label>Email</label><input type="email" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} required placeholder="manager@restaurant.com" /></div>
              <div className="form-group"><label>Display Name</label><input type="text" value={managerName} onChange={e => setManagerName(e.target.value)} placeholder="e.g. Daniel" /></div>
              <div className="form-group">
                <label>{primaryManager ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} placeholder={primaryManager ? 'Leave blank to keep current' : 'Enter password'} />
              </div>
              <div className="edit-modal-actions">
                <button type="button" className="btn-secondary flex-1" onClick={() => { setManagerModal(false); setManagerTenant(null); }}>Cancel</button>
                <button type="submit" className="btn-primary flex-1">
                  {primaryManager ? 'Save Manager' : 'Create Manager'}
                </button>
              </div>
            </form>
          </>
        )}
      </AdminModal>
    </div>
  );
}
