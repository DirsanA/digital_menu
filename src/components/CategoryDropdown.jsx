'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Tag } from 'lucide-react';

export default function CategoryDropdown({
  id,
  value,
  onChange,
  categories = [],
  legacyValue,
  placeholder = 'Select a category',
  emptyMessage,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const optionNames = [...new Set([...categories.map((c) => c.name), legacyValue].filter(Boolean))];

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (categories.length === 0) {
    return (
      <div className="category-dropdown-empty glass">
        <Tag size={18} />
        <p className="field-hint" style={{ margin: 0 }}>
          {emptyMessage || (
            <>No categories yet. <Link href="/admin/categories">Create categories</Link> before adding menu items.</>
          )}
        </p>
      </div>
    );
  }

  const selectedLabel = value || placeholder;

  return (
    <div
      ref={rootRef}
      id={id}
      className={`category-dropdown ${open ? 'open' : ''}`}
    >
      <button
        type="button"
        className="category-dropdown-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`category-dropdown-value ${value ? '' : 'placeholder'}`}>{selectedLabel}</span>
        <ChevronDown size={18} className="category-dropdown-chevron" />
      </button>

      {open && (
        <div className="category-dropdown-menu glass" role="listbox" aria-label="Category">
          <ul className="category-dropdown-list">
            {optionNames.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === name}
                  className={`category-dropdown-option ${value === name ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  <span>{name}</span>
                  {value === name && <Check size={16} />}
                </button>
              </li>
            ))}
          </ul>
          <Link href="/admin/categories" className="category-dropdown-footer" onClick={() => setOpen(false)}>
            + Manage categories
          </Link>
        </div>
      )}
    </div>
  );
}
