'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { QrCode, Plus, Trash2, X, Copy, Download } from 'lucide-react';

export default function QrCodesPage() {
  const [qrcodes, setQrcodes] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [tableId, setTableId] = useState('');

  useEffect(() => { Promise.all([fetchQrcodes(), fetchTables()]); }, []);

  const fetchQrcodes = async () => {
    try { const data = await apiFetch('/qrcodes'); if (data) setQrcodes(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchTables = async () => {
    try { const data = await apiFetch('/tables'); if (data) setTables(data.filter(t => t.isActive)); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!tableId) return;
    try {
      await apiFetch('/qrcodes', { method: 'POST', body: JSON.stringify({ tableId }) });
      setModal(false); setTableId(''); fetchQrcodes();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this QR code?')) return;
    try { await apiFetch(`/qrcodes/${id}`, { method: 'DELETE' }); fetchQrcodes(); }
    catch (err) { console.error(err); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
  };

  const getTableNumber = (id) => tables.find(t => t.id === id)?.number || id;

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><QrCode size={22} /> QR Codes</h1>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Generate QR</button>
      </div>
      <div className="qrcode-grid">
        {qrcodes.length === 0 && (
          <div className="data-card glass" style={{ gridColumn: '1 / -1' }}>
            <p className="empty-text">No QR codes yet. Generate one for a table.</p>
          </div>
        )}
        {qrcodes.map(qr => (
          <div key={qr.id} className="qrcode-card glass">
            <div className="qrcode-header">
              <QrCode size={24} />
              <span>Table {getTableNumber(qr.tableId)}</span>
            </div>
            {qr.qrCodeUrl && (
              <img src={qr.qrCodeUrl} alt={`QR for table ${getTableNumber(qr.tableId)}`} className="qrcode-image" />
            )}
            <div className="qrcode-actions">
              <button className="btn-sm btn-primary" onClick={() => copyUrl(qr.qrCodeUrl)}><Copy size={13} /> Copy URL</button>
              {qr.qrCodeUrl && (
                <a href={qr.qrCodeUrl} download className="btn-sm btn-secondary" target="_blank"><Download size={13} /> Download</a>
              )}
              <button className="btn-action-icon btn-delete" onClick={() => handleDelete(qr.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-backdrop fade-in" onClick={() => setModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>Generate QR Code</h2>
              <form onSubmit={handleCreate} className="menu-item-form">
                <div className="form-group"><label>Table</label><select value={tableId} onChange={e => setTableId(e.target.value)} required>
                  <option value="">Select a table...</option>
                  {tables.map(t => <option key={t.id} value={t.id}>Table {t.number} ({t.capacity} seats)</option>)}
                </select></div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Generate</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
