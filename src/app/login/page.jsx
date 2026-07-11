'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Utensils, Mail, Lock, Store, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) router.push('/admin/dashboard');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required'); return; }
    setLoading(true);
    try {
      const user = await login(email, password, tenantSlug.trim() || undefined);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo">
            <Utensils size={28} />
          </div>
          <h1>Staff Portal</h1>
          <p className="login-subtitle">Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email"><Mail size={14} /> Email</label>
            <input id="email" type="email" placeholder="you@restaurant.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>

          <div className="form-group">
            <label htmlFor="password"><Lock size={14} /> Password</label>
            <div className="password-input-wrap">
              <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tenantSlug"><Store size={14} /> Tenant Slug <span className="optional-badge">optional</span></label>
            <input id="tenantSlug" type="text" placeholder="e.g. bistro-noir (for staff)" value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)} />
            <p className="field-hint">Staff: enter your restaurant slug. Super admins: leave blank.</p>
          </div>

          <button type="submit" className="btn-primary w-full login-submit" disabled={loading}>
            {loading ? <><div className="btn-spinner" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>

        <p className="login-footer">
          <a href="/" className="login-back-link">← Back to Menu</a>
        </p>
      </div>
    </div>
  );
}
