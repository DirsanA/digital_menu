'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import {
  ChefHat, Flame, Bell, BellOff, Timer, Utensils, CheckCircle2,
} from 'lucide-react';

function getTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

function getUrgencyLevel(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff > 600) return 'critical';
  if (diff > 300) return 'high';
  if (diff > 120) return 'medium';
  return 'normal';
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [startedIds, setStartedIds] = useState(new Set());
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
      const data = await apiFetch('/kitchen/orders');
      if (data) {
        if (!firstLoadRef.current && data.length > prevCountRef.current) {
          playChime();
        }
        prevCountRef.current = data.length;
        firstLoadRef.current = false;
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
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

  const startCooking = async (orderId) => {
    setStartedIds(prev => new Set(prev).add(orderId));
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'preparing' }),
      });
      setOrders(prev => prev.filter(o => o.id !== orderId));
      prevCountRef.current = Math.max(0, prevCountRef.current - 1);
    } catch (err) {
      console.error(err);
      setStartedIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="kitchen-page">
        <div className="kitchen-loading">
          <div className="spinner" />
          <span>Loading kitchen orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="kitchen-page kitchen-v2">
      <div className="kitchen-topbar">
        <div className="kitchen-topbar-left">
          <div className="kitchen-logo">
            <ChefHat size={20} />
          </div>
          <div className="kitchen-topbar-info">
            <h1>Kitchen Display</h1>
            <span className="kitchen-topbar-sub">
              {orders.length} new order{orders.length !== 1 && 's'}
            </span>
          </div>
        </div>
        <div className="kitchen-topbar-right">
          <button
            className={`kitchen-sound-toggle ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(p => !p)}
            title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
          >
            {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <div className="kitchen-topbar-time">
            {new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="kitchen-empty-state">
          <div className="kitchen-empty-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2>All Clear</h2>
          <p>No new orders from the waiter. Waiting for incoming orders...</p>
        </div>
      ) : (
        <div className="kitchen-orders-grid">
          {orders.map(order => {
            const urgency = getUrgencyLevel(order.createdAt);
            const isStarting = startedIds.has(order.id);
            return (
              <div key={order.id} className={`kitchen-card kitchen-card-${urgency}`}>
                <div className="kitchen-card-top">
                  <span className="kitchen-card-table-num">Table {order.tableNumber}</span>
                  <span className="kitchen-card-order-num">#{String(order.orderNumber).padStart(4, '0')}</span>
                </div>

                <div className="kitchen-card-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="kitchen-card-item">
                      <span className="kitchen-card-item-qty">{item.quantity}×</span>
                      <span className="kitchen-card-item-name">{item.name}</span>
                      {item.customizations && (
                        <span className="kitchen-card-item-note">{item.customizations}</span>
                      )}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="kitchen-card-note">{order.notes}</div>
                )}

                <div className="kitchen-card-footer">
                  <span className="kitchen-card-time">
                    <Timer size={11} /> {getTimeAgo(order.createdAt)}
                  </span>
                  <button
                    className="kitchen-btn kitchen-btn-start"
                    onClick={() => startCooking(order.id)}
                    disabled={isStarting}
                  >
                    <Flame size={14} /> {isStarting ? 'Starting...' : 'Start Cooking'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
