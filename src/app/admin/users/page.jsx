'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { canManageStaff, getAssignableRoles } from '@/lib/staffPermissions';
import { Users, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import AdminModal from '@/components/AdminModal';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('waiter');

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const roleOptions = getAssignableRoles(currentUser);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try { const data = await apiFetch('/users'); if (data) setUsers(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setEmail('');
    setDisplayName('');
    setPassword('');
    setRole(roleOptions.includes('waiter') ? 'waiter' : roleOptions[0] || 'waiter');
    setModal(true);
  };

  const openEdit = (u) => {
    if (!canManageStaff(currentUser, u)) return;
    setEditing(u);
    setEmail(u.email);
    setDisplayName(u.displayName || '');
    setPassword('');
    setRole(u.role);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const body = { email, displayName, role };
      if (!editing || password) body.password = password;
      if (editing) {
        await apiFetch(`/users/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        if (!password) { alert('Password is required for new users'); return; }
        await apiFetch('/users', { method: 'POST', body: JSON.stringify(body) });
      }
      setModal(false); fetchUsers();
    } catch (err) { console.error(err); alert(err.message); }
  };

  const handleDelete = async (u) => {
    if (!canManageStaff(currentUser, u)) return;
    if (!confirm('Delete this user?')) return;
    try { await apiFetch(`/users/${u.id}`, { method: 'DELETE' }); fetchUsers(); }
    catch (err) { console.error(err); alert(err.message); }
  };

  const toggleActive = async (u) => {
    if (!canManageStaff(currentUser, u)) return;
    try {
      await apiFetch(`/users/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      fetchUsers();
    } catch (err) { console.error(err); alert(err.message); }
  };

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><Users size={22} /> Staff</h1>
        {!isSuperAdmin && <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Staff</button>}
      </div>
      <div className="data-card glass">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {users.length === 0 && <tr><td colSpan={6} className="empty-cell">No staff yet.</td></tr>}
              {users.map(u => {
                const manageable = canManageStaff(currentUser, u);
                return (
                <tr key={u.id}>
                  <td><strong>{u.displayName || '—'}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`status-badge status-${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                  <td><span className={`status-badge ${u.isActive ? 'status-active' : 'status-inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}</td>
                  <td className="action-cell">
                    {manageable ? (
                      <>
                        <button className="btn-action-icon btn-edit" onClick={() => openEdit(u)} title="Edit staff"><Edit size={16} /></button>
                        <button className="btn-action-icon btn-delete" onClick={() => handleDelete(u)} title="Delete staff"><Trash2 size={16} /></button>
                        <button
                          className={`btn-action-icon ${u.isActive ? 'btn-visible' : 'btn-hidden'}`}
                          onClick={() => toggleActive(u)}
                          title={u.isActive ? 'Disable staff' : 'Enable staff'}
                        >
                          {u.isActive ? <UserCheck size={16} /> : <UserX size={16} />}
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <AdminModal
          open={modal}
          onClose={() => setModal(false)}
          title={editing ? 'Edit Staff' : 'Add Staff'}
        >
          <form onSubmit={handleSave} className="menu-item-form">
            <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="staff@restaurant.com" /></div>
            <div className="form-group"><label>Display Name</label><input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. John" /></div>
            <div className="form-group"><label>{editing ? 'New Password (leave blank to keep)' : 'Password'}</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={editing ? 'Leave blank to keep current' : 'Enter password'} /></div>
            <div className="form-group"><label>Role</label><select value={role} onChange={e => setRole(e.target.value)}>
              {roleOptions.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select></div>
            {editing && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last login: {editing.lastLoginAt ? new Date(editing.lastLoginAt).toLocaleString() : 'Never'}</p>}
            <div className="edit-modal-actions">
              <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary flex-1">{editing ? 'Save' : 'Create'}</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
