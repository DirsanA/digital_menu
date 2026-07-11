'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { CreditCard, Plus, Edit, Trash2, X, DollarSign } from 'lucide-react';

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [maxUsers, setMaxUsers] = useState(5);
  const [maxOrders, setMaxOrders] = useState(100);
  const [features, setFeatures] = useState('');

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try { const data = await apiFetch('/admin/pricing'); if (data) setPlans(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setName(''); setPrice(''); setMaxUsers(5); setMaxOrders(100); setFeatures(''); setModal(true); };

  const openEdit = (plan) => {
    setEditing(plan); setName(plan.name); setPrice(String(plan.price));
    setMaxUsers(plan.maxUsers); setMaxOrders(plan.maxOrders);
    setFeatures(plan.features?.join('\n') || ''); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !price) return;
    try {
      const body = {
        name, price: parseFloat(price), maxUsers: parseInt(maxUsers), maxOrders: parseInt(maxOrders),
        features: features.split('\n').filter(f => f.trim()),
      };
      if (editing) {
        await apiFetch(`/admin/pricing/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/admin/pricing', { method: 'POST', body: JSON.stringify(body) });
      }
      setModal(false); fetchPlans();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pricing plan?')) return;
    try { await apiFetch(`/admin/pricing/${id}`, { method: 'DELETE' }); fetchPlans(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><CreditCard size={22} /> Pricing Plans</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Plan</button>
      </div>
      <div className="pricing-grid">
        {plans.length === 0 && (
          <div className="data-card glass" style={{ gridColumn: '1 / -1' }}>
            <p className="empty-text">No pricing plans yet.</p>
          </div>
        )}
        {plans.map(plan => (
          <div key={plan.id} className="pricing-plan-card glass">
            <h3>{plan.name}</h3>
            <div className="plan-price"><DollarSign size={20} />{plan.price.toFixed(2)}<span>/mo</span></div>
            <div className="plan-limits">
              <div className="plan-limit"><span>Users</span><strong>{plan.maxUsers}</strong></div>
              <div className="plan-limit"><span>Orders</span><strong>{plan.maxOrders}</strong></div>
            </div>
            {plan.features?.length > 0 && (
              <ul className="plan-features">
                {plan.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
            <div className="plan-actions">
              <button className="btn-action-icon btn-edit" onClick={() => openEdit(plan)}><Edit size={16} /></button>
              <button className="btn-action-icon btn-delete" onClick={() => handleDelete(plan.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-backdrop fade-in" onClick={() => setModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>{editing ? 'Edit Plan' : 'Add Plan'}</h2>
              <form onSubmit={handleSave} className="menu-item-form">
                <div className="form-group"><label>Plan Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Pro" /></div>
                <div className="form-group"><label>Price ($/mo)</label><input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required /></div>
                <div className="form-group-row">
                  <div className="form-group"><label>Max Users</label><input type="number" min={1} value={maxUsers} onChange={e => setMaxUsers(e.target.value)} /></div>
                  <div className="form-group"><label>Max Orders</label><input type="number" min={1} value={maxOrders} onChange={e => setMaxOrders(e.target.value)} /></div>
                </div>
                <div className="form-group"><label>Features (one per line)</label><textarea rows="4" value={features} onChange={e => setFeatures(e.target.value)} placeholder="e.g. Unlimited menu items&#10;Email support&#10;Analytics dashboard" /></div>
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
