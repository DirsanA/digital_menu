'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import AdminModal from '@/components/AdminModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try { const data = await apiFetch('/categories'); if (data) setCategories(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setName(''); setModal(true); };

  const openEdit = (cat) => { setEditing(cat); setName(cat.name); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const body = { name: name.trim() };
      if (editing) {
        await apiFetch(`/categories/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/categories', { method: 'POST', body: JSON.stringify(body) });
      }
      setModal(false); fetchCategories();
    } catch (err) { console.error(err); alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await apiFetch(`/categories/${id}`, { method: 'DELETE' }); fetchCategories(); }
    catch (err) { console.error(err); alert(err.message); }
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
            <thead><tr><th>Name</th><th>Sort Order</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.length === 0 && <tr><td colSpan={3} className="empty-cell">No categories yet.</td></tr>}
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.sortOrder ?? 0}</td>
                  <td className="action-cell">
                    <button className="btn-action-icon btn-edit" onClick={() => openEdit(cat)} title="Edit category"><Edit size={16} /></button>
                    <button className="btn-action-icon btn-delete" onClick={() => handleDelete(cat.id)} title="Delete category"><Trash2 size={16} /></button>
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
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSave} className="menu-item-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Starters" />
          </div>
          <div className="edit-modal-actions">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
