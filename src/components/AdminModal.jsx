'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function AdminModal({ open, onClose, title, children, maxWidth = '480px' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="admin-modal-backdrop fade-in" onClick={onClose} role="presentation">
      <div
        className="admin-modal-content glass"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'admin-modal-title' : undefined}
        style={{ maxWidth }}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="admin-modal-body">
          {title && (
            <h2 id="admin-modal-title" className="admin-modal-title">
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
