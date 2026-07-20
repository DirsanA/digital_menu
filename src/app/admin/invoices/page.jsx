'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FileText, Plus, X } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try { const data = await apiFetch('/invoices'); if (data) setInvoices(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!number || !amount) return;
    try {
      await apiFetch('/invoices', {
        method: 'POST',
        body: JSON.stringify({ invoiceNumber: number, amount: parseFloat(amount), status, dueDate: dueDate || undefined }),
      });
      setModal(false); setNumber(''); setAmount(''); setStatus('pending'); setDueDate('');
      fetchInvoices();
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await apiFetch(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchInvoices();
    } catch (err) { console.error(err); }
  };

  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><FileText size={22} /> Invoices</h1>
        <div className="page-header-right">
          <span className="total-badge">Pending: ${totalPending.toFixed(2)}</span>
          <span className="total-badge" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>Paid: ${totalPaid.toFixed(2)}</span>
          <button className="btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Create Invoice</button>
        </div>
      </div>
      <div className="data-card glass">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Invoice #</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.length === 0 && <tr><td colSpan={6} className="empty-cell">No invoices yet.</td></tr>}
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><strong>{inv.invoiceNumber}</strong></td>
                  <td>${inv.amount.toFixed(2)}</td>
                  <td><span className={`status-badge status-${inv.status}`}>{inv.status}</span></td>
                  <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="action-cell">
                    {inv.status === 'pending' && (
                      <>
                        <button className="btn-primary btn-sm" onClick={() => handleStatusUpdate(inv.id, 'paid')}>Mark Paid</button>
                        <button className="btn-secondary btn-sm" style={{ marginLeft: '0.5rem' }} onClick={() => handleStatusUpdate(inv.id, 'cancelled')}>Cancel</button>
                      </>
                    )}
                    {inv.status === 'paid' && <span className="text-success">Paid</span>}
                    {inv.status === 'cancelled' && <span className="text-muted">Cancelled</span>}
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
              <h2 style={{ marginBottom: '1.25rem' }}>Create Invoice</h2>
              <form onSubmit={handleCreate} className="menu-item-form">
                <div className="form-group"><label>Invoice Number</label><input type="text" value={number} onChange={e => setNumber(e.target.value)} required placeholder="e.g. INV-001" /></div>
                <div className="form-group"><label>Amount ($)</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
                <div className="form-group"><label>Status</label><select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select></div>
                <div className="form-group"><label>Due Date (optional)</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
