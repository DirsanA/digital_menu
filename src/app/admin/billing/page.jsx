'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Receipt, DollarSign, Plus, X } from 'lucide-react';

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('invoices');
  const [modal, setModal] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Supplies');

  const categories = ['Supplies', 'Utilities', 'Maintenance', 'Labor', 'Marketing', 'Rent', 'Other'];

  useEffect(() => {
    Promise.all([
      apiFetch('/invoices').catch(() => []),
      apiFetch('/expenses').catch(() => []),
    ]).then(([inv, exp]) => {
      setInvoices(inv || []);
      setExpenses(exp || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expDesc || !expAmount) return;
    try {
      await apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({ description: expDesc, amount: parseFloat(expAmount), category: expCategory }),
      });
      setModal(false); setExpDesc(''); setExpAmount('');
      const data = await apiFetch('/expenses');
      if (data) setExpenses(data);
    } catch (err) { console.error(err); }
  };

  const handlePayInvoice = async (id) => {
    try {
      await apiFetch(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'paid' }),
      });
      const data = await apiFetch('/invoices');
      if (data) setInvoices(data);
    } catch (err) { console.error(err); }
  };

  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="billing-page fade-in">
      <div className="page-header">
        <h1><Receipt size={22} /> Billing</h1>
        <div className="page-header-right">
          <span className="total-badge">Invoices: ${totalPending.toFixed(2)} pending</span>
          <span className="total-badge">Expenses: ${totalExpenses.toFixed(2)}</span>
          <button className="btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Add Expense</button>
        </div>
      </div>

      <div className="billing-tabs">
        <button className={`billing-tab ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>
          <Receipt size={16} /> Invoices
        </button>
        <button className={`billing-tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>
          <DollarSign size={16} /> Expenses
        </button>
      </div>

      {tab === 'invoices' && (
        <div className="data-card glass">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Invoice #</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
              <tbody>
                {invoices.length === 0 && <tr><td colSpan={5} className="empty-cell">No invoices.</td></tr>}
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td><strong>{inv.invoiceNumber}</strong></td>
                    <td>${inv.amount.toFixed(2)}</td>
                    <td><span className={`status-badge status-${inv.status}`}>{inv.status}</span></td>
                    <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="action-cell">
                      {inv.status === 'pending' && (
                        <button className="btn-sm btn-primary" onClick={() => handlePayInvoice(inv.id)}>Pay Now</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'expenses' && (
        <div className="data-card glass">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Description</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {expenses.length === 0 && <tr><td colSpan={4} className="empty-cell">No expenses recorded.</td></tr>}
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td><strong>{exp.description}</strong></td>
                    <td><span className="catalog-category-tag">{exp.category}</span></td>
                    <td>${exp.amount.toFixed(2)}</td>
                    <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop fade-in" onClick={() => setModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>Record Expense</h2>
              <form onSubmit={handleAddExpense} className="menu-item-form">
                <div className="form-group"><label>Description</label><input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} required placeholder="e.g. Weekly produce" /></div>
                <div className="form-group"><label>Amount ($)</label><input type="number" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} required /></div>
                <div className="form-group"><label>Category</label><select value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
