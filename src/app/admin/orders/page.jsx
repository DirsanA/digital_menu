'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Bell, BellOff, BadgeCheck, Timer, CheckCircle2, XCircle } from 'lucide-react';

function getTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [approvingIds, setApprovingIds] = useState(new Set());
  const prevCountRef = useRef(0);
  const firstLoadRef = useRef(true);

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const t = ctx.currentTime;
      [
        { freq: 880, start: 0, dur: 0.15 },
        { freq: 1108.73, start: 0.12, dur: 0.15 },
        { freq: 1318.51, start: 0.24, dur: 0.25 },
      ].forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + start);
        gain.gain.setValueAtTime(0, t + start);
        gain.gain.linearRampToValueAtTime(0.2, t + start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
        osc.start(t + start);
        osc.stop(t + start + dur);
      });
    } catch (_) {}
  }, [soundEnabled]);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiFetch('/orders');
      if (data) {
        if (!firstLoadRef.current && data.length > prevCountRef.current) {
          playChime();
        }
        prevCountRef.current = data.length;
        firstLoadRef.current = false;
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  }, [playChime]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(tick);
  }, []);

  const approveOrder = async (orderId) => {
    setApprovingIds(prev => new Set(prev).add(orderId));
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'approved' } : o));
    } catch (err) {
      console.error(err);
      setApprovingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const rejectOrder = async (orderId) => {
    setApprovingIds(prev => new Set(prev).add(orderId));
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error(err);
      setApprovingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const pending = orders.filter(o => o.status === 'pending');
  const approved = orders.filter(o => o.status === 'approved');
  const cooking = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  if (loading) {
    return (
      <div className="kitchen-page">
        <div className="kitchen-loading">
          <div className="spinner" />
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="waiter-page fade-in">
      <div className="waiter-topbar">
        <div className="waiter-topbar-left">
          <div className="waiter-logo">
            <BadgeCheck size={20} />
          </div>
          <div className="waiter-topbar-info">
            <h1>Approve Orders</h1>
            <span className="waiter-topbar-sub">
              {pending.length} pending order{pending.length !== 1 && 's'}
            </span>
          </div>
        </div>
        <div className="waiter-topbar-right">
          <button
            className={`kitchen-sound-toggle ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(p => !p)}
          >
            {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <div className="kitchen-topbar-time">
            {new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="waiter-empty-state">
          <div className="waiter-empty-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2>All Caught Up</h2>
          <p>No new orders to approve. Waiting for customers...</p>
        </div>
      ) : (
        <div className="waiter-orders-grid">
          {pending.map(order => {
            const isApproving = approvingIds.has(order.id);
            return (
              <div key={order.id} className="waiter-order-card">
                <div className="waiter-card-top">
                  <span className="waiter-card-table">Table {order.tableNumber}</span>
                  <span className="waiter-card-time">
                    <Timer size={11} /> {getTimeAgo(order.createdAt)}
                  </span>
                </div>

                <div className="waiter-card-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="waiter-card-item">
                      <span className="waiter-card-item-qty">{item.quantity}×</span>
                      <span className="waiter-card-item-name">{item.name}</span>
                      {item.customizations && (
                        <span className="waiter-card-item-note">{item.customizations}</span>
                      )}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="waiter-card-note">{order.notes}</div>
                )}

                <div className="waiter-card-footer">
                  <span className="waiter-card-total">${order.totalAmount?.toFixed(2)}</span>
                  <div className="waiter-card-actions">
                    <button
                      className="waiter-reject-btn"
                      onClick={() => rejectOrder(order.id)}
                      disabled={isApproving}
                    >
                      <XCircle size={15} />
                    </button>
                    <button
                      className="waiter-approve-btn"
                      onClick={() => approveOrder(order.id)}
                      disabled={isApproving}
                    >
                      <BadgeCheck size={15} />
                      {isApproving ? '...' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(approved.length + cooking.length + ready.length) > 0 && (
        <div className="waiter-tracker">
          <h3>Order Tracker</h3>
          <div className="waiter-tracker-row">
            {approved.length > 0 && (
              <div className="waiter-tracker-badge waiter-tracker-approved">
                <BadgeCheck size={13} /> {approved.length} Sent to Kitchen
              </div>
            )}
            {cooking.length > 0 && (
              <div className="waiter-tracker-badge waiter-tracker-cooking">
                <Timer size={13} /> {cooking.length} Cooking
              </div>
            )}
            {ready.length > 0 && (
              <div className="waiter-tracker-badge waiter-tracker-ready">
                <CheckCircle2 size={13} /> {ready.length} Ready
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
