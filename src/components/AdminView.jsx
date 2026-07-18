'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import {
  Bell, Check, ChefHat, Play, CheckCircle,
  Trash2, DollarSign, ShoppingBag, TrendingUp, Plus, Eye, EyeOff, Edit, X,
  Upload, ImagePlus, Package
} from 'lucide-react';

const API_BASE = '/api';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/default_food.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;
  return imagePath;
};

// ─── Reusable Image Upload Zone ──────────────────────────────────────────────
function ImageUploadZone({ file, previewUrl, templateImage, onFileChange, onClearFile, inputId }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      onFileChange(dropped);
    }
  };

  const displayUrl = previewUrl || getImageUrl(templateImage);

  return (
    <div className="upload-zone-wrapper">
      {/* Preview card */}
      <div
        className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          <div className="upload-preview-img-wrap">
            <img
              src={displayUrl}
              alt="Preview"
              className="upload-preview-img"
              onError={(e) => { e.target.src = '/images/default_food.jpg'; }}
            />
            <div className="upload-preview-overlay">
              <ImagePlus size={20} />
              <span>Click or drag to replace</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon-wrap"><Upload size={26} /></div>
            <p className="upload-placeholder-title">Upload Photo</p>
            <p className="upload-placeholder-hint">Click or drag & drop · JPG, PNG, WEBP · max 5MB</p>
          </div>
        )}
        {file && (
          <button
            type="button"
            className="upload-clear-btn"
            onClick={(e) => { e.stopPropagation(); onClearFile(); inputRef.current.value = ''; }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) onFileChange(e.target.files[0]);
        }}
      />

      {file && (
        <p className="upload-file-name">
          <Package size={12} /> {file.name}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminView() {
  const { menu, fetchMenu } = useCart();
  const { joinAdminRoom } = useSocket();
  const { toast, confirm } = useToast();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // Create/Edit form state
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Mains');
  const [itemDesc, setItemDesc] = useState('');
  const [itemIngredients, setItemIngredients] = useState('');
  const [itemImage, setItemImage] = useState('/images/wagyu_burger.jpg');
  const [itemFile, setItemFile] = useState(null);
  const [itemPreviewUrl, setItemPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep track of order count for the chime
  const orderCountRef = useRef(0);

  // Generate object URLs for previews
  useEffect(() => {
    if (!itemFile) { setItemPreviewUrl(''); return; }
    const url = URL.createObjectURL(itemFile);
    setItemPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [itemFile]);

  // Play a chime for new orders
  const playChimeSound = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const play = (time, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.25, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        osc.start(time); osc.stop(time + 0.6);
      };
      const now = ctx.currentTime;
      play(now, 587.33);
      play(now + 0.12, 880.00);
    } catch (_) {}
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        if (orderCountRef.current !== 0 && data.data.length > orderCountRef.current) {
          playChimeSound();
        }
        orderCountRef.current = data.data.length;
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll orders every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Status transition
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) setOrders(prev => prev.map(o => o.id === orderId ? data.data : o));
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setItemName(''); setItemPrice(''); setItemDesc('');
    setItemIngredients(''); setItemCategory('Mains'); setItemFile(null);
    setItemImage('/images/wagyu_burger.jpg');
    setEditingItem(null);
  };

  // Create menu item
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', itemName);
      fd.append('price', itemPrice);
      fd.append('category', itemCategory);
      fd.append('description', itemDesc);
      fd.append('ingredients', itemIngredients);
      fd.append('available', 'true');
      if (itemFile) fd.append('image', itemFile);
      else fd.append('image', itemImage);

      const res = await fetch(`${API_BASE}/menu`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchMenu();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  // Open edit
  const openEdit = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(item.price);
    setItemCategory(item.category);
    setItemDesc(item.description || '');
    setItemIngredients(item.ingredients?.join(', ') || item.tags?.join(', ') || '');
    setItemImage(item.image);
    setItemFile(null);
  };

  // Cancel edit
  const cancelEdit = () => {
    resetForm();
  };

  // Update menu item
  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    if (!editingItem || !itemName || !itemPrice) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', itemName); fd.append('price', itemPrice);
      fd.append('category', itemCategory); fd.append('description', itemDesc);
      fd.append('ingredients', itemIngredients);
      if (itemFile) fd.append('image', itemFile);
      else fd.append('image', itemImage);

      const res = await fetch(`${API_BASE}/menu/${editingItem.id}`, { method: 'PUT', body: fd });
      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchMenu();
      } else { toast.error(data.message || 'Update failed'); }
    } catch (err) { console.error(err); toast.error('Error updating item'); }
    finally { setIsSubmitting(false); }
  };

  // Toggle availability
  const handleToggleAvailable = async (itemId, current) => {
    try {
      const res = await fetch(`${API_BASE}/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !current })
      });
      const data = await res.json();
      if (data.success) fetchMenu();
    } catch (err) { console.error(err); }
  };

  // Delete item
  const handleDeleteMenuItem = async (itemId) => {
    if (!await confirm('Delete this menu item permanently?', { danger: true, confirmText: 'Delete' })) return;
    try {
      const res = await fetch(`${API_BASE}/menu/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchMenu();
    } catch (err) { console.error(err); }
  };

  // Derived order lists
  const pendingOrders   = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders     = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue    = completedOrders.reduce((s, o) => s + o.totalAmount, 0);
  const avgTicket       = completedOrders.length ? totalRevenue / completedOrders.length : 0;

  // â”€â”€â”€ Order Ticket Component â”€â”€â”€
  const OrderTicket = ({ order, action }) => (
    <div className="order-ticket glass fade-in">
      <div className="ticket-header">
        <h4>Table {order.tableNumber}</h4>
        <span className="order-time">
          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="ticket-body">
        {order.items.map((item, idx) => (
          <div key={idx} className="ticket-item">
            <span><strong>{item.quantity}Ã—</strong> {item.name}</span>
            {item.customizations && <span className="ticket-customization">"{item.customizations}"</span>}
          </div>
        ))}
        {order.notes && <div className="ticket-notes"><strong>Note:</strong> {order.notes}</div>}
      </div>
      <div className="ticket-footer">
        <span>Total: ${order.totalAmount.toFixed(2)}</span>
        {action}
      </div>
    </div>
  );

  return (
    <div className="admin-container fade-in">

      {/* â”€â”€ Tabs â”€â”€ */}
      <div className="admin-nav-tabs glass">
        <button className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <Bell size={18} /> <span>Live Orders</span>
          {pendingOrders.length > 0 && <span className="queue-alert-badge">{pendingOrders.length}</span>}
        </button>
        <button className={`admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
          <ChefHat size={18} /> <span>Menu Manager</span>
        </button>
        <button className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <TrendingUp size={18} /> <span>Analytics</span>
        </button>
      </div>

      {/* â”€â”€ Tab 1: Live Orders â”€â”€ */}
      {activeTab === 'orders' && (
        <div className="orders-queue-layout">
          {loadingOrders ? (
            <div className="view-loader-container"><div className="spinner" /></div>
          ) : (
            <div className="queue-columns-container">
              <div className="queue-column glass">
                <div className="column-header border-pending">
                  <h3>New Orders</h3>
                  <span className="item-count-badge bg-pending">{pendingOrders.length}</span>
                </div>
                <div className="column-orders-list">
                  {pendingOrders.map(order => (
                    <OrderTicket key={order.id} order={order} action={
                      <button className="btn-primary btn-sm flex-1 mt-2" onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                        <Play size={13} /> Cook Order
                      </button>
                    } />
                  ))}
                  {pendingOrders.length === 0 && <div className="empty-column">No incoming orders</div>}
                </div>
              </div>

              <div className="queue-column glass">
                <div className="column-header border-preparing">
                  <h3>In Kitchen</h3>
                  <span className="item-count-badge bg-preparing">{preparingOrders.length}</span>
                </div>
                <div className="column-orders-list">
                  {preparingOrders.map(order => (
                    <OrderTicket key={order.id} order={order} action={
                      <button className="btn-primary btn-sm btn-preparing-action flex-1 mt-2" onClick={() => handleUpdateStatus(order.id, 'ready')}>
                        <Check size={13} /> Ready to Serve
                      </button>
                    } />
                  ))}
                  {preparingOrders.length === 0 && <div className="empty-column">Kitchen is idle</div>}
                </div>
              </div>

              <div className="queue-column glass">
                <div className="column-header border-ready">
                  <h3>Ready / Pickup</h3>
                  <span className="item-count-badge bg-ready">{readyOrders.length}</span>
                </div>
                <div className="column-orders-list">
                  {readyOrders.map(order => (
                    <OrderTicket key={order.id} order={order} action={
                      <button className="btn-primary btn-sm btn-ready-action flex-1 mt-2" onClick={() => handleUpdateStatus(order.id, 'completed')}>
                        <CheckCircle size={13} /> Served
                      </button>
                    } />
                  ))}
                  {readyOrders.length === 0 && <div className="empty-column">No orders waiting</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* â”€â”€ Tab 2: Menu Manager â”€â”€ */}
      {activeTab === 'menu' && (
        <div className="menu-manager-layout">

          {/* Left: Add Form */}
          <div className="item-form-card glass">
            <h3><Plus size={18} /> {editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={editingItem ? handleUpdateMenuItem : handleCreateMenuItem} className="menu-item-form">

              {/* Photo Upload Zone */}
              <ImageUploadZone
                file={itemFile}
                previewUrl={itemPreviewUrl}
                templateImage={itemImage}
                inputId="item-image-upload"
                onFileChange={setItemFile}
                onClearFile={() => setItemFile(null)}
              />

              {/* Name + Price */}
              <div className="form-group-row">
                <div className="form-group flex-2">
                  <label htmlFor="name-input">Dish / Drink Name</label>
                  <input id="name-input" type="text" placeholder="e.g. Garlic Butter Shrimp"
                    value={itemName} onChange={e => setItemName(e.target.value)} required />
                </div>
                <div className="form-group" style={{ minWidth: '90px', flex: 1 }}>
                  <label htmlFor="price-input">Price ($)</label>
                  <input id="price-input" type="number" step="0.01" placeholder="15.50"
                    value={itemPrice} onChange={e => setItemPrice(e.target.value)} required />
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category-select">Category</label>
                <select id="category-select" value={itemCategory} onChange={e => setItemCategory(e.target.value)}>
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>

              {/* Ingredients */}
              <div className="form-group">
                <label htmlFor="ingredients-input">Ingredients (comma separated)</label>
                <input id="ingredients-input" type="text" placeholder="e.g. Lettuce, Tomato, Onion, Beef Patty"
                  value={itemIngredients} onChange={e => setItemIngredients(e.target.value)} />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="desc-textarea">Description</label>
                <textarea id="desc-textarea" rows="3" placeholder="Describe flavors, ingredients, allergens…"
                  value={itemDesc} onChange={e => setItemDesc(e.target.value)} />
              </div>

              <div className="edit-modal-actions" style={{ marginTop: '1rem' }}>
                {editingItem && <button type="button" className="btn-secondary flex-1" onClick={cancelEdit}>Cancel</button>}
                <button type="submit" className={editingItem ? "btn-primary flex-1" : "btn-primary w-full"} disabled={isSubmitting}>
                  {isSubmitting ? (editingItem ? 'Saving…' : 'Adding…') : <>{editingItem ? 'Save Changes' : <><Plus size={16} /> Add to Menu</>}</>}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Catalog */}
          <div className="catalog-list-card glass">
            <h3><ChefHat size={18} /> Menu Catalog
              <span className="catalog-count">{menu.length} items</span>
            </h3>
            <div className="catalog-grid">
              {menu.length === 0 && (
                <div className="empty-column" style={{ border: 'none', padding: '2rem 0' }}>No menu items yet</div>
              )}
              {menu.map(item => (
                <div key={item.id} className={`catalog-item-row ${!item.available ? 'catalog-unavailable' : ''}`}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="catalog-thumb"
                    onError={e => { e.target.src = '/images/default_food.jpg'; }}
                  />
                  <div className="catalog-info">
                    <h4>{item.name}</h4>
                    <span className="catalog-category-tag">{item.category}</span>
                    <span className="catalog-price">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="catalog-actions">
                    <button
                      className={`btn-action-icon ${item.available ? 'btn-visible' : 'btn-hidden'}`}
                      onClick={() => handleToggleAvailable(item.id, item.available)}
                      title={item.available ? 'Hide item' : 'Show item'}
                    >
                      {item.available ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                    <button className="btn-action-icon btn-edit" onClick={() => openEditModal(item)} title="Edit item">
                      <Edit size={17} />
                    </button>
                    <button className="btn-action-icon btn-delete" onClick={() => handleDeleteMenuItem(item.id)} title="Delete item">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Tab 3: Analytics â”€â”€ */}
      {activeTab === 'analytics' && (
        <div className="analytics-layout fade-in">
          <div className="analytics-metrics-grid">
            <div className="metric-card glass">
              <div className="metric-icon bg-indigo-glow"><DollarSign size={22} style={{ color: 'var(--primary-light)' }} /></div>
              <div className="metric-data"><span>Completed Sales</span><h2>${totalRevenue.toFixed(2)}</h2></div>
            </div>
            <div className="metric-card glass">
              <div className="metric-icon bg-emerald-glow"><ShoppingBag size={22} style={{ color: 'var(--success)' }} /></div>
              <div className="metric-data"><span>Orders Served</span><h2>{completedOrders.length}</h2></div>
            </div>
            <div className="metric-card glass">
              <div className="metric-icon bg-amber-glow"><TrendingUp size={22} style={{ color: 'var(--accent)' }} /></div>
              <div className="metric-data"><span>Avg. Ticket</span><h2>${avgTicket.toFixed(2)}</h2></div>
            </div>
          </div>

          <div className="served-history-card glass">
            <h3><CheckCircle size={18} /> Served Orders Registry</h3>
            <div className="history-table-container">
              {completedOrders.length === 0 ? (
                <p className="no-history-text">No served orders yet today.</p>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Table</th>
                      <th>Items</th>
                      <th>Time</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id.slice(-6).toUpperCase()}</td>
                        <td>Table {order.tableNumber}</td>
                        <td>{order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                        <td>{new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Edit Menu Item Modal â”€â”€ */}
      {isEditModalOpen && editingItem && (
        <div className="modal-backdrop fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content glass edit-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsEditModalOpen(false)}><X size={18} /></button>

            <div className="modal-body" style={{ paddingTop: '2.5rem', overflowY: 'auto' }}>
              <h2 className="edit-modal-title"><Edit size={18} /> Edit Menu Item</h2>

              <form onSubmit={handleUpdateMenuItem} className="menu-item-form">

                {/* Image Upload Zone */}
                <ImageUploadZone
                  file={editFile}
                  previewUrl={editPreviewUrl}
                  templateImage={editImage.startsWith('/uploads') ? '/images/wagyu_burger.jpg' : editImage}
                  inputId="edit-image-upload"
                  onFileChange={setEditFile}
                  onClearFile={() => { setEditFile(null); }}
                  onTemplateChange={(val) => { setEditImage(val); setEditFile(null); }}
                />

                {/* Name + Price */}
                <div className="form-group-row">
                  <div className="form-group flex-2">
                    <label htmlFor="edit-name">Name</label>
                    <input id="edit-name" type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ minWidth: '90px', flex: 1 }}>
                    <label htmlFor="edit-price">Price ($)</label>
                    <input id="edit-price" type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} required />
                  </div>
                </div>

                {/* Category */}
                <div className="form-group">
                  <label htmlFor="edit-category">Category</label>
                  <select id="edit-category" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                    <option value="Starters">Starters</option>
                    <option value="Mains">Mains</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>

                {/* Ingredients */}
                <div className="form-group">
                  <label htmlFor="edit-ingredients">Ingredients</label>
                  <input id="edit-ingredients" type="text" value={editIngredients} onChange={e => setEditIngredients(e.target.value)} />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="edit-desc">Description</label>
                  <textarea id="edit-desc" rows="3" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                </div>

                <div className="edit-modal-actions">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1" disabled={isUpdatingItem}>
                    {isUpdatingItem ? 'Savingâ€¦' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

