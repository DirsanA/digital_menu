'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/subscriptions')
      .then(data => setSubscription(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  if (!subscription) {
    return (
      <div className="data-page fade-in">
        <div className="page-header"><h1><CreditCard size={22} /> Subscription</h1></div>
        <div className="data-card glass">
          <p className="empty-text">No active subscription found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-page fade-in">
      <div className="page-header"><h1><CreditCard size={22} /> Subscription</h1></div>

      <div className="subscription-hero glass">
        <div className="sub-hero-plan">
          <h2>{subscription.plan?.name || 'Current Plan'}</h2>
          {subscription.plan?.price && (
            <div className="sub-hero-price">${subscription.plan.price.toFixed(2)}<span>/month</span></div>
          )}
        </div>
        <div className="sub-hero-status">
          <span className={`status-badge ${subscription.status === 'active' || subscription.status === 'trialing' ? 'status-active' : 'status-inactive'}`}>
            {subscription.status === 'active' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section glass">
          <h3 style={{ marginBottom: '1rem' }}>Plan Details</h3>
          <div className="subscription-detail">
            <div className="detail-row"><span>Plan Name</span><strong>{subscription.plan?.name || 'N/A'}</strong></div>
            <div className="detail-row"><span>Price</span><strong>${subscription.plan?.price?.toFixed(2) || '0.00'}/mo</strong></div>
            {subscription.plan?.maxUsers && <div className="detail-row"><span>Max Users</span><strong>{subscription.plan.maxUsers}</strong></div>}
            {subscription.plan?.maxOrders && <div className="detail-row"><span>Max Orders/mo</span><strong>{subscription.plan.maxOrders}</strong></div>}
          </div>
          {subscription.plan?.features?.length > 0 && (
            <>
              <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.9rem' }}>Features</h4>
              <ul className="plan-features">
                {subscription.plan.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </>
          )}
        </div>

        <div className="dashboard-section glass">
          <h3 style={{ marginBottom: '1rem' }}>Billing Info</h3>
          <div className="subscription-detail">
            <div className="detail-row"><span>Status</span><span className={`status-badge ${subscription.status === 'active' ? 'status-active' : `status-${subscription.status}`}`}>{subscription.status}</span></div>
            <div className="detail-row"><span>Start Date</span><strong>{new Date(subscription.startDate).toLocaleDateString()}</strong></div>
            {subscription.endDate && <div className="detail-row"><span>End Date</span><strong>{new Date(subscription.endDate).toLocaleDateString()}</strong></div>}
            <div className="detail-row"><span>Auto Renew</span><strong>{subscription.autoRenew ? 'Yes' : 'No'}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
