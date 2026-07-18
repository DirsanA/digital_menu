'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import {
  ChefHat, Flame, Bell, BellOff, Timer, Utensils, CheckCircle2, ArrowRight, CircleCheck,
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
  const [actionIds, setActionIds] = useState(new Set());
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

  const updateOrderStatus = async (orderId, newStatus) => {
    setActionIds(prev => new Set(prev).add(orderId));
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
    } finally {
      setActionIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const startCooking = (orderId) => updateOrderStatus(orderId, 'preparing');
  const markReady = (orderId) => updateOrderStatus(orderId, 'ready');
  const markComplete = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    updateOrderStatus(orderId, 'completed');
  };

  const newOrders = orders.filter(o => o.status === 'approved');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  const columns = [
    {
      key: 'new',
      title: 'New Orders',
      icon: <Flame size={16} />,
      orders: newOrders,
      color: '#f97316',
      emptyText: 'No new orders from the waiter',
      renderActions: (order) => {
        const isActioning = actionIds.has(order.id);
        return (
          <button
            className="kanban-btn kanban-btn-start"
            onClick={() => startCooking(order.id)}
            disabled={isActioning}
          >
            <Flame size={13} /> {isActioning ? 'Starting...' : 'Start Cooking'}
          </button>
        );
      },
    },
    {
      key: 'preparing',
      title: 'Preparing',
      icon: <ChefHat size={16} />,
      orders: preparing,
      color: '#eab308',
      emptyText: 'No orders being prepared',
      renderActions: (order) => {
        const isActioning = actionIds.has(order.id);
        return (
          <button
            className="kanban-btn kanban-btn-ready"
            onClick={() => markReady(order.id)}
            disabled={isActioning}
          >
            <CheckCircle2 size={13} /> {isActioning ? 'Marking...' : 'Ready'}
          </button>
        );
      },
    },
    {
      key: 'ready',
      title: 'Ready to Serve',
      icon: <CircleCheck size={16} />,
      orders: ready,
      color: '#22c55e',
      emptyText: 'No dishes ready',
      renderActions: (order) => {
        const isActioning = actionIds.has(order.id);
        return (
          <button
            className="kanban-btn kanban-btn-complete"
            onClick={() => markComplete(order.id)}
            disabled={isActioning}
          >
            <CheckCircle2 size={13} /> {isActioning ? 'Clearing...' : 'Clear'}
          </button>
        );
      },
    },
  ];

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
              {newOrders.length + preparing.length + ready.length} active order{(newOrders.length + preparing.length + ready.length) !== 1 && 's'}
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

      <div className="kanban-board">
        {columns.map(col => (
          <div key={col.key} className="kanban-column">
            <div className="kanban-column-header" style={{ borderColor: col.color }}>
              <span className="kanban-column-icon" style={{ color: col.color }}>{col.icon}</span>
              <h2 className="kanban-column-title">{col.title}</h2>
              <span className="kanban-column-count" style={{ background: col.color + '22', color: col.color }}>
                {col.orders.length}
              </span>
            </div>

            <div className="kanban-column-body">
              {col.orders.length === 0 ? (
                <div className="kanban-empty">
                  <Utensils size={24} className="text-zinc-700" />
                  <p>{col.emptyText}</p>
                </div>
              ) : (
                col.orders.map(order => {
                  const urgency = order.status === 'approved' ? getUrgencyLevel(order.createdAt) : 'normal';
                  const isActioning = actionIds.has(order.id);
                  return (
                    <div key={order.id} className={`kanban-card ${order.status === 'approved' ? `kanban-card-${urgency}` : ''}`}>
                      <div className="kanban-card-top">
                        <span className="kanban-card-table">Table {order.tableNumber}</span>
                        <span className="kanban-card-order-num">#{String(order.orderNumber).padStart(4, '0')}</span>
                      </div>

                      <div className="kanban-card-items">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="kanban-card-item">
                            <span className="kanban-card-item-qty">{item.quantity}x</span>
                            <span className="kanban-card-item-name">{item.name}</span>
                            {item.customizations && (
                              <span className="kanban-card-item-note">{item.customizations}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="kanban-card-note">{order.notes}</div>
                      )}

                      <div className="kanban-card-footer">
                        <span className="kanban-card-time">
                          <Timer size={11} /> {getTimeAgo(order.createdAt)}
                        </span>
                        {col.renderActions(order)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
