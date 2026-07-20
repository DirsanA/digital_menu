'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { DollarSign, TrendingUp, FileText, Download, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [revenue, sales, taxes, expenses] = await Promise.all([
          apiFetch('/reports/daily-revenue').catch(() => null),
          apiFetch('/reports/sales').catch(() => null),
          apiFetch('/reports/taxes').catch(() => null),
          apiFetch('/reports/expenses').catch(() => null),
        ]);
        setDailyRevenue(revenue);
        setSalesData(sales);
        setTaxData(taxes);
        setExpenseData(expenses);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [period]);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  return (
    <div className="reports-page fade-in">
      <div className="page-header">
        <h1><TrendingUp size={22} /> Reports</h1>
        <select className="catalog-filter" value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card glass">
          <div className="metric-icon bg-indigo-glow"><DollarSign size={22} /></div>
          <div className="metric-data">
            <span>Daily Revenue</span>
            <h2>${dailyRevenue?.totalRevenue?.toFixed(2) || '0.00'}</h2>
          </div>
          <div className="metric-detail">{dailyRevenue?.orderCount || 0} orders</div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-emerald-glow"><DollarSign size={22} /></div>
          <div className="metric-data">
            <span>Total Sales</span>
            <h2>${salesData?.totalSales?.toFixed(2) || '0.00'}</h2>
          </div>
          <div className="metric-detail">{salesData?.totalOrders || 0} transactions</div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-amber-glow"><FileText size={22} /></div>
          <div className="metric-data">
            <span>Tax Collected</span>
            <h2>${taxData?.totalTax?.toFixed(2) || '0.00'}</h2>
          </div>
        </div>
        <div className="metric-card glass">
          <div className="metric-icon bg-pink-glow"><DollarSign size={22} /></div>
          <div className="metric-data">
            <span>Expenses</span>
            <h2>${expenseData?.totalExpenses?.toFixed(2) || '0.00'}</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section glass">
          <div className="section-header">
            <h3><DollarSign size={18} /> Revenue Breakdown</h3>
          </div>
          {dailyRevenue?.breakdown ? (
            <div className="revenue-breakdown">
              {Object.entries(dailyRevenue.breakdown).map(([key, val]) => (
                <div key={key} className="breakdown-row">
                  <span className="breakdown-label">{key}</span>
                  <div className="breakdown-bar-wrap">
                    <div className="breakdown-bar" style={{ width: `${(val / dailyRevenue.totalRevenue * 100).toFixed(1)}%` }} />
                  </div>
                  <span className="breakdown-value">${val.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No revenue data available.</p>
          )}
        </div>

        <div className="dashboard-section glass">
          <div className="section-header">
            <h3><TrendingUp size={18} /> Sales Summary</h3>
          </div>
          {salesData ? (
            <div className="sales-summary">
              <div className="summary-stat">
                <span>Total Orders</span>
                <strong>{salesData.totalOrders || 0}</strong>
              </div>
              <div className="summary-stat">
                <span>Average Order</span>
                <strong>${salesData.averageOrder?.toFixed(2) || '0.00'}</strong>
              </div>
              <div className="summary-stat">
                <span>Items Sold</span>
                <strong>{salesData.totalItems || 0}</strong>
              </div>
            </div>
          ) : (
            <p className="empty-text">No sales data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
