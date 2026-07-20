'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  Plus, Edit, Trash2, Eye, EyeOff, ChefHat, X,
  Upload, ImagePlus, Package, Search,
} from 'lucide-react';
import CategoryDropdown from '@/components/CategoryDropdown';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/default_food.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;
  return imagePath;
};

function ImageUploadZone({ file, previewUrl, templateImage, onFileChange, onClearFile, inputId }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const displayUrl = previewUrl || getImageUrl(templateImage);

  return (
    <div className="upload-zone-wrapper">
      <div className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) onFileChange(f); }}>
        {displayUrl ? (
          <div className="upload-preview-img-wrap">
            <img src={displayUrl} alt="Preview" className="upload-preview-img" onError={(e) => { e.target.src = '/images/default_food.jpg'; }} />
            <div className="upload-preview-overlay"><ImagePlus size={20} /><span>Click or drag to replace</span></div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon-wrap"><Upload size={26} /></div>
            <p className="upload-placeholder-title">Upload Photo</p>
            <p className="upload-placeholder-hint">Click or drag & drop · JPG, PNG, WEBP · max 5MB</p>
          </div>
        )}
        {file && <button type="button" className="upload-clear-btn" onClick={(e) => { e.stopPropagation(); onClearFile(); inputRef.current.value = ''; }}><X size={14} /></button>}
      </div>
      <input ref={inputRef} id={inputId} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.[0]) onFileChange(e.target.files[0]); }} />
      {file && <p className="upload-file-name"><Package size={12} /> {file.name}</p>}
    </div>
  );
}

export default function MenuPage() {
  const { toast, confirm } = useToast();
  const [menu, setMenu] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState(null);

  // Create/Edit form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [image, setImage] = useState('/images/wagyu_burger.jpg');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  useEffect(() => { if (!file) { setPreviewUrl(''); return; } const url = URL.createObjectURL(file); setPreviewUrl(url); return () => URL.revokeObjectURL(url); }, [file]);

  useEffect(() => {
    if (!category && dbCategories.length > 0) {
      setCategory(dbCategories[0].name);
    }
  }, [dbCategories, category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuData, categoryData] = await Promise.all([
        apiFetch('/menu'),
        apiFetch('/categories'),
      ]);
      if (menuData) setMenu(menuData);
      if (categoryData) {
        setDbCategories(categoryData);
        if (categoryData.length > 0) {
          setCategory((current) => current || categoryData[0].name);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMenu = fetchData;

  const resetForm = () => {
    setName(''); setPrice(''); setDesc(''); setIngredients('');
    setCategory(dbCategories[0]?.name || '');
    setFile(null);
    setImage('/images/wagyu_burger.jpg');
    setEditing(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name); fd.append('price', price); fd.append('category', category);
      fd.append('description', desc); fd.append('ingredients', ingredients); fd.append('available', 'true');
      if (file) fd.append('image', file); else fd.append('image', image);
      const data = await apiFetch('/menu', { method: 'POST', body: fd });
      if (data) {
        resetForm();
        fetchMenu();
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name);
    setPrice(String(item.price));
    setCategory(item.category);
    setDesc(item.description || '');
    setIngredients(item.ingredients?.join(', ') || item.tags?.join(', ') || '');
    setImage(item.image);
    setFile(null);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing || !name || !price) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name); fd.append('price', price); fd.append('category', category);
      fd.append('description', desc); fd.append('ingredients', ingredients);
      if (file) fd.append('image', file); else fd.append('image', image);
      const data = await apiFetch(`/menu/${editing.id}`, { method: 'PUT', body: fd });
      if (data) {
        resetForm();
        fetchMenu();
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const toggleAvailable = async (itemId, current) => {
    try {
      const data = await apiFetch(`/menu/${itemId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available: !current }),
      });
      if (data) fetchMenu();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (itemId) => {
    if (!await confirm('Delete this menu item permanently?', { danger: true, confirmText: 'Delete' })) return;
    try { await apiFetch(`/menu/${itemId}`, { method: 'DELETE' }); fetchMenu(); }
    catch (err) { console.error(err); }
  };

  const filtered = menu.filter(item => {
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="menu-page fade-in">
      <div className="page-header"><h1><ChefHat size={22} /> Menu Manager</h1><span className="order-count-badge">{menu.length} items</span></div>
      <div className="menu-manager-layout">
        <div className="item-form-card glass">
          <h3><Plus size={18} /> {editing ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={editing ? handleUpdate : handleCreate} className="menu-item-form">
            <ImageUploadZone file={file} previewUrl={previewUrl} templateImage={image} inputId="new-image"
              onFileChange={setFile} onClearFile={() => setFile(null)} />
            <div className="form-group-row">
              <div className="form-group flex-2">
                <label htmlFor="name">Dish / Drink Name</label>
                <input id="name" type="text" placeholder="e.g. Garlic Butter Shrimp" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ minWidth: '90px', flex: 1 }}>
                <label htmlFor="price">Price ($)</label>
                <input id="price" type="number" step="0.01" placeholder="15.50" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
            </div>
            <div className="form-group menu-category-field">
              <label htmlFor="category">Category</label>
              <CategoryDropdown
                id="category"
                value={category}
                onChange={setCategory}
                categories={dbCategories}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ingredients">Ingredients (comma separated)</label>
              <input id="ingredients" type="text" placeholder="e.g. Lettuce, Tomato, Onion, Beef Patty" value={ingredients} onChange={e => setIngredients(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="desc">Description</label>
              <textarea id="desc" rows="3" placeholder="Describe flavors, ingredients, allergens…" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="edit-modal-actions" style={{ marginTop: '1rem' }}>
              {editing && <button type="button" className="btn-secondary flex-1" onClick={cancelEdit}>Cancel</button>}
              <button type="submit" className={editing ? "btn-primary flex-1" : "btn-primary w-full"} disabled={submitting || dbCategories.length === 0 || !category}>
                {submitting ? (editing ? 'Saving…' : 'Adding…') : <>{editing ? 'Save Changes' : <><Plus size={16} /> Add to Menu</>}</>}
              </button>
            </div>
          </form>
        </div>

        <div className="catalog-list-card glass">
          <h3><ChefHat size={18} /> Menu Catalog <span className="catalog-count">{menu.length} items</span></h3>
          <div className="catalog-toolbar">
            <div className="search-wrapper" style={{ flex: 1 }}>
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search menu items…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && <X size={14} className="clear-search" onClick={() => setSearchQuery('')} />}
            </div>
          </div>
          <div className="catalog-grid">
            {loading ? <div className="view-loader-container"><div className="spinner" /></div> : null}
            {!loading && filtered.length === 0 && <div className="empty-column" style={{ border: 'none', padding: '2rem 0' }}>No items match your filter.</div>}
            {filtered.map(item => (
              <div key={item.id} className={`catalog-item-row ${!item.available ? 'catalog-unavailable' : ''}`}>
                <img src={getImageUrl(item.image)} alt={item.name} className="catalog-thumb" onError={e => { e.target.src = '/images/default_food.jpg'; }} />
                <div className="catalog-info">
                  <h4>{item.name}</h4>
                  <span className="catalog-category-tag">{item.category}</span>
                  <span className="catalog-price">${item.price.toFixed(2)}</span>
                </div>
                <div className="catalog-actions">
                  <button className={`btn-action-icon ${item.available ? 'btn-visible' : 'btn-hidden'}`} onClick={() => toggleAvailable(item.id, item.available)} title={item.available ? 'Hide item' : 'Show item'}>
                    {item.available ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                  <button className="btn-action-icon btn-edit" onClick={() => openEdit(item)} title="Edit"><Edit size={17} /></button>
                  <button className="btn-action-icon btn-delete" onClick={() => handleDelete(item.id)} title="Delete"><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
