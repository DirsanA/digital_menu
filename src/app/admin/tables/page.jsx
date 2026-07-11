'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Grid3X3, Plus, Edit, Trash2 } from 'lucide-react';
import AdminModal from '@/components/AdminModal';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [location, setLocation] = useState('');

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    setLoading(true);
    try { const data = await apiFetch('/tables'); if (data) setTables(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setNumber(''); setCapacity(4); setLocation(''); setModal(true); };

  const openEdit = (table) => { setEditing(table); setNumber(table.number); setCapacity(table.capacity); setLocation(table.location || ''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!number) return;
    try {
      const body = { number, capacity: parseInt(capacity), location };
      if (editing) {
        await apiFetch(`/tables/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/tables', { method: 'POST', body: JSON.stringify(body) });
      }
      setModal(false);
      fetchTables();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this table?')) return;
    try { await apiFetch(`/tables/${id}`, { method: 'DELETE' }); fetchTables(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><Grid3X3 size={22} /> Tables</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Table</button>
      </div>
      <div className="data-card glass">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Number</th><th>Capacity</th><th>Location</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tables.length === 0 && <tr><td colSpan={5} className="empty-cell">No tables yet.</td></tr>}
              {tables.map(t => (
                <tr key={t.id}>
                  <td><strong>Table {t.number}</strong></td>
                  <td>{t.capacity} seats</td>
                  <td>{t.location || '—'}</td>
                  <td><span className={`status-badge status-${t.isActive ? 'active' : 'inactive'}`}>{t.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="action-cell">
                    <button className="btn-action-icon btn-edit" onClick={() => openEdit(t)}><Edit size={16} /></button>
                    <button className="btn-action-icon btn-delete" onClick={() => handleDelete(t.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Table' : 'Add Table'}
        maxWidth="440px"
      >
        <form onSubmit={handleSave} className="menu-item-form">
          <div className="form-group"><label>Table Number</label><input type="text" value={number} onChange={e => setNumber(e.target.value)} required placeholder="e.g. 5 or Bar-2" /></div>
          <div className="form-group"><label>Capacity</label><input type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} required /></div>
          <div className="form-group"><label>Location (optional)</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Patio, Window, Bar" /></div>
          <div className="edit-modal-actions">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
