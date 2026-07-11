'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FileText, Plus, Edit, Trash2, X } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try { const data = await apiFetch('/categories'); if (data) setCategories(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setName(''); setDescription(''); setModal(true); };

  const openEdit = (cat) => { setEditing(cat); setName(cat.name); setDescription(cat.description || ''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      const body = { name, description };
      if (editing) {
        await apiFetch(`/categories/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/categories', { method: 'POST', body: JSON.stringify(body) });
      }
      setModal(false); fetchCategories();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await apiFetch(`/categories/${id}`, { method: 'DELETE' }); fetchCategories(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><FileText size={22} /> Categories</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Category</button>
      </div>
      <div className="data-card glass">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.length === 0 && <tr><td colSpan={3} className="empty-cell">No categories yet.</td></tr>}
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.description || '—'}</td>
                  <td className="action-cell">
                    <button className="btn-action-icon btn-edit" onClick={() => openEdit(cat)}><Edit size={16} /></button>
                    <button className="btn-action-icon btn-delete" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop fade-in" onClick={() => setModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>{editing ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleSave} className="menu-item-form">
                <div className="form-group"><label>Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Starters" /></div>
                <div className="form-group"><label>Description (optional)</label><textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} placeholder="Category description" /></div>
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
