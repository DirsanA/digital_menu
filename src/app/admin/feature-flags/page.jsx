'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Flag, Plus, Trash2, X } from 'lucide-react';

export default function FeatureFlagsPage() {
  const { confirm } = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('true');

  useEffect(() => { fetchFlags(); }, []);

  const fetchFlags = async () => {
    setLoading(true);
    try { const data = await apiFetch('/admin/feature-flags'); if (data) setFlags(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!key) return;
    try {
      await apiFetch('/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({ key, value: value === 'true' }),
      });
      setModal(false); setKey(''); fetchFlags();
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (flag) => {
    try {
      await apiFetch(`/admin/feature-flags/${flag.key}`, {
        method: 'PUT',
        body: JSON.stringify({ value: !flag.value }),
      });
      fetchFlags();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (key) => {
    if (!await confirm('Delete this feature flag?', { danger: true, confirmText: 'Delete' })) return;
    try { await apiFetch(`/admin/feature-flags/${key}`, { method: 'DELETE' }); fetchFlags(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><Flag size={22} /> Feature Flags</h1>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Add Flag</button>
      </div>
      <div className="data-card glass">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Value</th><th>Actions</th></tr></thead>
            <tbody>
              {flags.length === 0 && <tr><td colSpan={3} className="empty-cell">No feature flags configured.</td></tr>}
              {flags.map(f => (
                <tr key={f.key}>
                  <td><code>{f.key}</code></td>
                  <td>
                    <button
                      className={`status-badge ${f.value ? 'status-active' : 'status-inactive'}`}
                      onClick={() => handleToggle(f)}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {f.value ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="action-cell">
                    <button className="btn-action-icon btn-delete" onClick={() => handleDelete(f.key)}><Trash2 size={16} /></button>
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
              <h2 style={{ marginBottom: '1.25rem' }}>Add Feature Flag</h2>
              <form onSubmit={handleCreate} className="menu-item-form">
                <div className="form-group"><label>Key</label><input type="text" value={key} onChange={e => setKey(e.target.value)} required placeholder="e.g. new_checkout_flow" /></div>
                <div className="form-group"><label>Initial Value</label><select value={value} onChange={e => setValue(e.target.value)}>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select></div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
