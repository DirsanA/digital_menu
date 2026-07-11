'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Receipt, Plus, Edit, Trash2, X } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Supplies');

  const categories = ['Supplies', 'Utilities', 'Maintenance', 'Labor', 'Marketing', 'Rent', 'Other'];

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try { const data = await apiFetch('/expenses'); if (data) setExpenses(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setDescription(''); setAmount(''); setCategory('Supplies'); setModal(true); };

  const openEdit = (exp) => { setEditing(exp); setDescription(exp.description); setAmount(String(exp.amount)); setCategory(exp.category); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    try {
      const body = { description, amount: parseFloat(amount), category };
      if (editing) {
        await apiFetch(`/expenses/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/expenses', { method: 'POST', body: JSON.stringify(body) });
      }
      setModal(false); fetchExpenses();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await apiFetch(`/expenses/${id}`, { method: 'DELETE' }); fetchExpenses(); }
    catch (err) { console.error(err); }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><Receipt size={22} /> Expenses</h1>
        <div className="page-header-right">
          <span className="total-badge">Total: ${total.toFixed(2)}</span>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Expense</button>
        </div>
      </div>
      <div className="data-card glass">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Description</th><th>Category</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {expenses.length === 0 && <tr><td colSpan={5} className="empty-cell">No expenses recorded.</td></tr>}
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td><strong>{exp.description}</strong></td>
                  <td><span className="catalog-category-tag">{exp.category}</span></td>
                  <td>${exp.amount.toFixed(2)}</td>
                  <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                  <td className="action-cell">
                    <button className="btn-action-icon btn-edit" onClick={() => openEdit(exp)}><Edit size={16} /></button>
                    <button className="btn-action-icon btn-delete" onClick={() => handleDelete(exp.id)}><Trash2 size={16} /></button>
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
              <h2 style={{ marginBottom: '1.25rem' }}>{editing ? 'Edit Expense' : 'Add Expense'}</h2>
              <form onSubmit={handleSave} className="menu-item-form">
                <div className="form-group"><label>Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g. Weekly produce order" /></div>
                <div className="form-group"><label>Amount ($)</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
                <div className="form-group"><label>Category</label><select value={category} onChange={e => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
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
