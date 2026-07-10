'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Play, Check, CheckCircle, ChefHat, Bell } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const countRef = useRef(0);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      if (data) {
        if (countRef.current !== 0 && data.length > countRef.current) playChime();
        countRef.current = data.length;
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const playChime = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const t = ctx.currentTime;
      [587.33, 880].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(f, t + i * 0.12);
        gain.gain.setValueAtTime(0, t + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, t + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.6);
        osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.6);
      });
    } catch (_) {}
  };

  const updateStatus = async (orderId, status) => {
    try {
      const data = await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (data) setOrders(prev => prev.map(o => o.id === orderId ? data : o));
    } catch (err) { console.error(err); }
  };

  const pending   = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready     = orders.filter(o => o.status === 'ready');
  const completed = orders.filter(o => o.status === 'completed');

  const OrderTicket = ({ order, action }) => (
    <div className="order-ticket glass fade-in">
      <div className="ticket-header">
        <h4>Table {order.tableNumber}</h4>
        <span className="order-time">
          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="ticket-body">
        {order.items?.map((item, idx) => (
          <div key={idx} className="ticket-item">
            <span><strong>{item.quantity}×</strong> {item.name}</span>
            {item.customizations && <span className="ticket-customization">"{item.customizations}"</span>}
          </div>
        ))}
        {order.notes && <div className="ticket-notes"><strong>Note:</strong> {order.notes}</div>}
      </div>
      <div className="ticket-footer">
        <span>Total: ${order.totalAmount?.toFixed(2)}</span>
        {action}
      </div>
    </div>
  );

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="orders-page fade-in">
      <div className="page-header">
        <h1><Bell size={22} /> Live Orders</h1>
        <span className="order-count-badge">{orders.length} total</span>
      </div>
      <div className="queue-columns-container">
        <div className="queue-column glass">
          <div className="column-header border-pending">
            <h3>New Orders</h3>
            <span className="item-count-badge bg-pending">{pending.length}</span>
          </div>
          <div className="column-orders-list">
            {pending.map(order => (
              <OrderTicket key={order.id} order={order} action={
                <button className="btn-primary btn-sm flex-1 mt-2" onClick={() => updateStatus(order.id, 'preparing')}>
                  <Play size={13} /> Cook Order
                </button>
              } />
            ))}
            {pending.length === 0 && <div className="empty-column">No incoming orders</div>}
          </div>
        </div>

        <div className="queue-column glass">
          <div className="column-header border-preparing">
            <h3>In Kitchen</h3>
            <span className="item-count-badge bg-preparing">{preparing.length}</span>
          </div>
          <div className="column-orders-list">
            {preparing.map(order => (
              <OrderTicket key={order.id} order={order} action={
                <button className="btn-primary btn-sm btn-preparing-action flex-1 mt-2" onClick={() => updateStatus(order.id, 'ready')}>
                  <Check size={13} /> Ready to Serve
                </button>
              } />
            ))}
            {preparing.length === 0 && <div className="empty-column">Kitchen is idle</div>}
          </div>
        </div>

        <div className="queue-column glass">
          <div className="column-header border-ready">
            <h3>Ready / Pickup</h3>
            <span className="item-count-badge bg-ready">{ready.length}</span>
          </div>
          <div className="column-orders-list">
            {ready.map(order => (
              <OrderTicket key={order.id} order={order} action={
                <button className="btn-primary btn-sm btn-ready-action flex-1 mt-2" onClick={() => updateStatus(order.id, 'completed')}>
                  <CheckCircle size={13} /> Served
                </button>
              } />
            ))}
            {ready.length === 0 && <div className="empty-column">No orders waiting</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
