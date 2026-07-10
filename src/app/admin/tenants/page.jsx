'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Building2, Plus, Edit, Trash2, X, Search, Users, ShoppingBag } from 'lucide-react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => { fetchTenants(); }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try { const data = await apiFetch('/tenants'); if (data) setTenants(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setName(''); setSlug(''); setModal(true); };

  const openEdit = (t) => { setEditing(t); setName(t.name); setSlug(t.slug); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      const body = { name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') };
      if (editing) {
        await apiFetch(`/tenants/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/tenants', { method: 'POST', body: JSON.stringify(body) });
      }
      setModal(false); fetchTenants();
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
        {filtered.map(t => (
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
            <div className="tenant-stats">
              <div className="tenant-stat"><Users size={14} /> {t._count?.users || 0} users</div>
              <div className="tenant-stat"><ShoppingBag size={14} /> {t._count?.orders || 0} orders</div>
            </div>
            <div className="tenant-date">Created {new Date(t.createdAt).toLocaleDateString()}</div>
            <div className="tenant-actions">
              <button className="btn-sm btn-primary" onClick={() => openEdit(t)}><Edit size={13} /> Edit</button>
              <button className={`btn-sm ${t.isActive ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleSuspend(t)}>
                {t.isActive ? 'Suspend' : 'Activate'}
              </button>
              <button className="btn-sm btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(t.id)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-backdrop fade-in" onClick={() => setModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>{editing ? 'Edit Restaurant' : 'Create Restaurant'}</h2>
              <form onSubmit={handleSave} className="menu-item-form">
                <div className="form-group"><label>Restaurant Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Bistro Noir" /></div>
                <div className="form-group"><label>Slug</label><input type="text" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="e.g. bistro-noir" /></div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">{editing ? 'Save' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
