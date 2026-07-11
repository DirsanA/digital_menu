'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Building2, Plus, Edit, Trash2, X, Search, Users, ShoppingBag, UserPlus } from 'lucide-react';

function getOwner(tenant) {
  return tenant?.users?.[0] || null;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [ownerModal, setOwnerModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [ownerTenant, setOwnerTenant] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [includeOwnerOnCreate, setIncludeOwnerOnCreate] = useState(false);

  useEffect(() => { fetchTenants(); }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try { const data = await apiFetch('/tenants'); if (data) setTenants(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetOwnerFields = () => {
    setOwnerEmail('');
    setOwnerName('');
    setOwnerPassword('');
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setIncludeOwnerOnCreate(false);
    resetOwnerFields();
    setModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setName(t.name);
    setSlug(t.slug);
    setModal(true);
  };

  const openOwnerModal = (tenant) => {
    const owner = getOwner(tenant);
    setOwnerTenant(tenant);
    setOwnerEmail(owner?.email || '');
    setOwnerName(owner?.displayName || '');
    setOwnerPassword('');
    setOwnerModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      const body = { name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') };
      if (!editing && includeOwnerOnCreate) {
        if (!ownerEmail || !ownerPassword) {
          alert('Owner email and password are required');
          return;
        }
        body.owner = {
          email: ownerEmail,
          displayName: ownerName,
          password: ownerPassword,
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

  const handleSaveOwner = async (e) => {
    e.preventDefault();
    if (!ownerTenant || !ownerEmail) return;
    const existingOwner = getOwner(ownerTenant);
    if (!existingOwner && !ownerPassword) {
      alert('Password is required when creating a new owner');
      return;
    }
    try {
      const body = { email: ownerEmail, displayName: ownerName };
      if (ownerPassword) body.password = ownerPassword;
      if (existingOwner) {
        await apiFetch(`/tenants/${ownerTenant.id}/owner`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch(`/tenants/${ownerTenant.id}/owner`, { method: 'POST', body: JSON.stringify(body) });
      }
      setOwnerModal(false);
      setOwnerTenant(null);
      resetOwnerFields();
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
          const owner = getOwner(t);
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Owner</div>
                {owner ? (
                  <div>
                    <div style={{ fontWeight: 600 }}>{owner.displayName || 'Unnamed owner'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{owner.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Login slug: <code>{t.slug}</code>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No owner assigned</div>
                )}
              </div>

              <div className="tenant-stats">
                <div className="tenant-stat"><Users size={14} /> {t._count?.users || 0} users</div>
                <div className="tenant-stat"><ShoppingBag size={14} /> {t._count?.orders || 0} orders</div>
              </div>
              <div className="tenant-date">Created {new Date(t.createdAt).toLocaleDateString()}</div>
              <div className="tenant-actions">
                <button className="btn-sm btn-primary" onClick={() => openOwnerModal(t)}>
                  <UserPlus size={13} /> {owner ? 'Edit Owner' : 'Assign Owner'}
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

      {modal && (
        <div className="modal-backdrop fade-in" onClick={() => setModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>{editing ? 'Edit Restaurant' : 'Create Restaurant'}</h2>
              <form onSubmit={handleSave} className="menu-item-form">
                <div className="form-group"><label>Restaurant Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Bistro Noir" /></div>
                <div className="form-group"><label>Slug</label><input type="text" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="e.g. bistronoir" /></div>

                {!editing && (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={includeOwnerOnCreate} onChange={e => setIncludeOwnerOnCreate(e.target.checked)} />
                      Create owner account now
                    </label>
                    {includeOwnerOnCreate && (
                      <>
                        <div className="form-group"><label>Owner Email</label><input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="owner@restaurant.com" /></div>
                        <div className="form-group"><label>Owner Name</label><input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Daniel" /></div>
                        <div className="form-group"><label>Owner Password</label><input type="password" value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} placeholder="Temporary password" /></div>
                      </>
                    )}
                  </>
                )}

                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">{editing ? 'Save' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {ownerModal && ownerTenant && (
        <div className="modal-backdrop fade-in" onClick={() => setOwnerModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setOwnerModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>
                {getOwner(ownerTenant) ? 'Edit Owner' : 'Assign Owner'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                {getOwner(ownerTenant)
                  ? `Update the owner account for ${ownerTenant.name}.`
                  : `Create an owner account for ${ownerTenant.name}. They will log in with the restaurant slug "${ownerTenant.slug}".`}
              </p>
              <form onSubmit={handleSaveOwner} className="menu-item-form">
                <div className="form-group"><label>Email</label><input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} required placeholder="owner@restaurant.com" /></div>
                <div className="form-group"><label>Display Name</label><input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Daniel" /></div>
                <div className="form-group">
                  <label>{getOwner(ownerTenant) ? 'New Password (leave blank to keep)' : 'Password'}</label>
                  <input type="password" value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} placeholder={getOwner(ownerTenant) ? 'Leave blank to keep current' : 'Enter password'} />
                </div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setOwnerModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">
                    {getOwner(ownerTenant) ? 'Save Owner' : 'Create Owner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
