'use client';

const API_BASE = '/api';

let logoutCallback = null;

export function setLogoutCallback(fn) {
  logoutCallback = fn;
}

export async function apiFetch(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.tenantSlug) {
          headers['x-tenant-slug'] = user.tenantSlug;
        }
      } catch {
        // ignore invalid cached user
      }
    }
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401 && logoutCallback) {
    logoutCallback();
    return null;
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Request failed');
  }
  return data.data;
}
