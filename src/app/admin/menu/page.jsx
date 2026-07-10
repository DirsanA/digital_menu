'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Plus, Edit, Trash2, Eye, EyeOff, ChefHat, X,
  Upload, ImagePlus, Package, Search,
} from 'lucide-react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/default_food.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;
  return imagePath;
};

function ImageUploadZone({ file, previewUrl, templateImage, onFileChange, onClearFile, inputId, onTemplateChange }) {
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
      {!file && (
        <div className="upload-template-row">
          <label className="upload-template-label">Or use template:</label>
          <select className="upload-template-select" value={templateImage} onChange={(e) => onTemplateChange(e.target.value)}>
            <option value="/images/wagyu_burger.jpg">🍔 Artisan Burger</option>
            <option value="/images/truffle_fries.jpg">🍟 Truffle Fries</option>
            <option value="/images/wild_salmon.jpg">🐟 Wild Salmon</option>
            <option value="/images/chocolate_lava_cake.jpg">🍫 Lava Cake</option>
            <option value="/images/passionfruit_cooler.jpg">🍹 Passionfruit Cooler</option>
          </select>
        </div>
      )}
      {file && <p className="upload-file-name"><Package size={12} /> {file.name}</p>}
    </div>
  );
}

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Create form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mains');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('/images/wagyu_burger.jpg');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [eName, setEName] = useState('');
  const [ePrice, setEPrice] = useState('');
  const [eCategory, setECategory] = useState('Mains');
  const [eDesc, setEDesc] = useState('');
  const [eTags, setETags] = useState('');
  const [eImage, setEImage] = useState('');
  const [eFile, setEFile] = useState(null);
  const [ePreviewUrl, setEPreviewUrl] = useState('');

  useEffect(() => { fetchMenu(); }, []);
  useEffect(() => { if (!file) { setPreviewUrl(''); return; } const url = URL.createObjectURL(file); setPreviewUrl(url); return () => URL.revokeObjectURL(url); }, [file]);
  useEffect(() => { if (!eFile) { setEPreviewUrl(''); return; } const url = URL.createObjectURL(eFile); setEPreviewUrl(url); return () => URL.revokeObjectURL(url); }, [eFile]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/menu');
      if (data) setMenu(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !price) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name); fd.append('price', price); fd.append('category', category);
      fd.append('description', desc); fd.append('tags', tags); fd.append('available', 'true');
      if (file) fd.append('image', file); else fd.append('image', image);
      const data = await apiFetch('/menu', { method: 'POST', body: fd });
      if (data) { setName(''); setPrice(''); setDesc(''); setTags(''); setCategory('Mains'); setFile(null); fetchMenu(); }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const openEdit = (item) => {
    setEditing(item); setEName(item.name); setEPrice(String(item.price));
    setECategory(item.category); setEDesc(item.description || ''); setETags(item.tags?.join(', ') || '');
    setEImage(item.image); setEFile(null); setEPreviewUrl(''); setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing || !eName || !ePrice) return;
    try {
      const fd = new FormData();
      fd.append('name', eName); fd.append('price', ePrice); fd.append('category', eCategory);
      fd.append('description', eDesc); fd.append('tags', eTags);
      if (eFile) fd.append('image', eFile); else fd.append('image', eImage);
      const data = await apiFetch(`/menu/${editing.id}`, { method: 'PUT', body: fd });
      if (data) { setEditModal(false); setEditing(null); setEFile(null); fetchMenu(); }
    } catch (err) { console.error(err); }
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
    if (!confirm('Delete this menu item permanently?')) return;
    try { await apiFetch(`/menu/${itemId}`, { method: 'DELETE' }); fetchMenu(); }
    catch (err) { console.error(err); }
  };

  const categories = ['All', ...new Set(menu.map(m => m.category))];
  const filtered = menu.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="menu-page fade-in">
      <div className="page-header"><h1><ChefHat size={22} /> Menu Manager</h1><span className="order-count-badge">{menu.length} items</span></div>
      <div className="menu-manager-layout">
        <div className="item-form-card glass">
          <h3><Plus size={18} /> Add New Item</h3>
          <form onSubmit={handleCreate} className="menu-item-form">
            <ImageUploadZone file={file} previewUrl={previewUrl} templateImage={image} inputId="new-image"
              onFileChange={setFile} onClearFile={() => setFile(null)} onTemplateChange={setImage} />
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
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Starters">Starters</option>
                <option value="Mains">Mains</option>
                <option value="Desserts">Desserts</option>
                <option value="Drinks">Drinks</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tags">Dietary Tags (comma separated)</label>
              <input id="tags" type="text" placeholder="e.g. Vegetarian, Spicy, Gluten-Free" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="desc">Description</label>
              <textarea id="desc" rows="3" placeholder="Describe flavors, ingredients, allergens…" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Adding…' : <><Plus size={16} /> Add to Menu</>}
            </button>
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
            <select className="catalog-filter" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
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

      {editModal && editing && (
        <div className="modal-backdrop fade-in" onClick={() => setEditModal(false)}>
          <div className="modal-content glass edit-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditModal(false)}><X size={18} /></button>
            <div className="modal-body" style={{ paddingTop: '2.5rem', overflowY: 'auto' }}>
              <h2 className="edit-modal-title"><Edit size={18} /> Edit Menu Item</h2>
              <form onSubmit={handleUpdate} className="menu-item-form">
                <ImageUploadZone file={eFile} previewUrl={ePreviewUrl}
                  templateImage={eImage.startsWith('/uploads') ? '/images/wagyu_burger.jpg' : eImage}
                  inputId="edit-image" onFileChange={setEFile} onClearFile={() => { setEFile(null); }}
                  onTemplateChange={(val) => { setEImage(val); setEFile(null); }} />
                <div className="form-group-row">
                  <div className="form-group flex-2"><label>Name</label><input type="text" value={eName} onChange={e => setEName(e.target.value)} required /></div>
                  <div className="form-group" style={{ minWidth: '90px', flex: 1 }}><label>Price ($)</label><input type="number" step="0.01" value={ePrice} onChange={e => setEPrice(e.target.value)} required /></div>
                </div>
                <div className="form-group"><label>Category</label><select value={eCategory} onChange={e => setECategory(e.target.value)}>
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                </select></div>
                <div className="form-group"><label>Tags</label><input type="text" value={eTags} onChange={e => setETags(e.target.value)} /></div>
                <div className="form-group"><label>Description</label><textarea rows="3" value={eDesc} onChange={e => setEDesc(e.target.value)} /></div>
                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
