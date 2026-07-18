'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Trash2 } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolveRef = useRef(null);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur || 5000),
    warning: (msg, dur) => addToast(msg, 'warning', dur || 4000),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  const confirm = useCallback((message, { title = 'Confirm', confirmText = 'Confirm', danger = false } = {}) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmState({ message, title, confirmText, danger });
    });
  }, []);

  const resolveConfirm = useCallback((result) => {
    if (confirmResolveRef.current) {
      confirmResolveRef.current(result);
      confirmResolveRef.current = null;
    }
    setConfirmState(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Toast container */}
          <div className="toast-container">
            {toasts.map(t => (
              <ToastItem key={t.id} toast={t} onRemove={removeToast} />
            ))}
          </div>

          {/* Confirm dialog */}
          {confirmState && (
            <ConfirmDialog
              {...confirmState}
              onConfirm={() => resolveConfirm(true)}
              onCancel={() => resolveConfirm(false)}
            />
          )}
        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle2 size={16} />,
    error: <XCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />,
  };

  return (
    <div className={`toast-item toast-${toast.type}`} onClick={() => onRemove(toast.id)}>
      <span className="toast-icon">{icons[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}>
        <X size={13} />
      </button>
    </div>
  );
}

function ConfirmDialog({ message, title, confirmText, danger, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className={`confirm-icon ${danger ? 'confirm-icon-danger' : 'confirm-icon-warning'}`}>
          {danger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn confirm-btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            className={`confirm-btn ${danger ? 'confirm-btn-danger' : 'confirm-btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
