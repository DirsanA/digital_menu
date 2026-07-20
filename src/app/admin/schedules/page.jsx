'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { CalendarClock, Plus, X } from 'lucide-react';

export default function SchedulesPage() {
  const { confirm } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => { Promise.all([fetchSchedules(), fetchUsers()]); }, []);

  const fetchSchedules = async () => {
    try { const data = await apiFetch('/staff-schedules'); if (data) setSchedules(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const data = await apiFetch('/users'); if (data) setUsers(data); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!userId || !dayOfWeek) return;
    try {
      await apiFetch('/staff-schedules', {
        method: 'POST',
        body: JSON.stringify({ userId, dayOfWeek, startTime, endTime }),
      });
      setModal(false); fetchSchedules();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!await confirm('Delete this schedule entry?', { danger: true, confirmText: 'Delete' })) return;
    try { await apiFetch(`/staff-schedules/${id}`, { method: 'DELETE' }); fetchSchedules(); }
    catch (err) { console.error(err); }
  };

  const getUserName = (id) => users.find(u => u.id === id)?.displayName || id;

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><CalendarClock size={22} /> Staff Schedules</h1>
        <button className="btn-primary" onClick={() => { setUserId(''); setDayOfWeek('Monday'); setStartTime('09:00'); setEndTime('17:00'); setModal(true); }}>
          <Plus size={16} /> Add Shift
        </button>
      </div>

      {days.map(day => {
        const dayShifts = schedules.filter(s => s.dayOfWeek === day);
        return (
          <div key={day} className="data-card glass" style={{ marginBottom: '0.75rem' }}>
            <div className="section-header"><h3>{day}</h3><span className="order-count-badge">{dayShifts.length} shifts</span></div>
            {dayShifts.length === 0 ? (
              <p className="empty-text" style={{ padding: '0.75rem 0' }}>No shifts scheduled.</p>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead><tr><th>Staff</th><th>Start</th><th>End</th><th>Actions</th></tr></thead>
                  <tbody>
                    {dayShifts.map(s => (
                      <tr key={s.id}>
                        <td><strong>{getUserName(s.userId)}</strong></td>
                        <td>{s.startTime}</td>
                        <td>{s.endTime}</td>
                        <td className="action-cell">
                          <button className="btn-action-icon btn-delete" onClick={() => handleDelete(s.id)}><X size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {modal && (
        <div className="modal-backdrop fade-in" onClick={() => setModal(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>Add Shift</h2>
              <form onSubmit={handleCreate} className="menu-item-form">
                <div className="form-group"><label>Staff</label><select value={userId} onChange={e => setUserId(e.target.value)} required>
                  <option value="">Select staff...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.displayName || u.email}</option>)}
                </select></div>
                <div className="form-group"><label>Day</label><select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select></div>
                <div className="form-group-row">
                  <div className="form-group"><label>Start</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                  <div className="form-group"><label>End</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
                </div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Add Shift</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
