'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { ChefHat, Clock, CheckCircle, Play } from 'lucide-react';

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch('/kitchen/orders');
      if (data) setOrders(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT', body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const pending = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');

  const OrderCard = ({ order, actions }) => (
    <div className="kitchen-order-card glass">
      <div className="kitchen-order-header">
        <h3>Table {order.tableNumber}</h3>
        <span className="kitchen-order-time">
          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="kitchen-order-items">
        {order.items?.map((item, idx) => (
          <div key={idx} className="kitchen-item">
            <span className="kitchen-item-qty">{item.quantity}×</span>
            <span className="kitchen-item-name">{item.name}</span>
            {item.customizations && <span className="kitchen-item-note">“{item.customizations}”</span>}
          </div>
        ))}
      </div>
      {order.notes && <div className="kitchen-order-note"><strong>Note:</strong> {order.notes}</div>}
      {actions && <div className="kitchen-order-actions">{actions}</div>}
    </div>
  );

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="kitchen-page fade-in">
      <div className="page-header">
        <h1><ChefHat size={22} /> Kitchen Display</h1>
        <span className="order-count-badge">{pending.length + preparing.length} active</span>
      </div>

      <div className="kitchen-columns">
        <div className="kitchen-column">
          <div className="kitchen-column-header" style={{ borderLeftColor: 'var(--accent)' }}>
            <h2>New Orders</h2>
            <span className="item-count-badge bg-pending">{pending.length}</span>
          </div>
          <div className="kitchen-column-list">
            {pending.map(order => (
              <OrderCard key={order.id} order={order} actions={
                <button className="btn-primary w-full" onClick={() => updateStatus(order.id, 'preparing')}>
                  <Play size={14} /> Start Preparing
                </button>
              } />
            ))}
            {pending.length === 0 && <div className="empty-column">No new orders</div>}
          </div>
        </div>

        <div className="kitchen-column">
          <div className="kitchen-column-header" style={{ borderLeftColor: 'var(--primary)' }}>
            <h2>In Progress</h2>
            <span className="item-count-badge bg-preparing">{preparing.length}</span>
          </div>
          <div className="kitchen-column-list">
            {preparing.map(order => (
              <OrderCard key={order.id} order={order} actions={
                <button className="btn-primary w-full" style={{ background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => updateStatus(order.id, 'ready')}>
                  <CheckCircle size={14} /> Mark Ready
                </button>
              } />
            ))}
            {preparing.length === 0 && <div className="empty-column">Nothing cooking</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
