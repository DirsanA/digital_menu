'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSocket } from '@/context/SocketContext';
import {
  ShoppingCart, Plus, Minus, Trash2, Utensils,
  Sparkles, ChefHat, CheckCircle2, MessageSquare,
  Coffee, IceCream, X, Flame, Search, ArrowRight,
  HelpCircle, MapPin, Star, Clock3, Package,
  Camera, Share2
} from 'lucide-react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/default_food.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;
  return imagePath;
};

export default function CustomerView() {
  const searchParams = useSearchParams();
  const slugParam = searchParams.get('slug');

  const {
    menu, menuLoading, menuError,
    cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount,
    submitOrder, activeOrder, setActiveOrder, checkActiveOrderStatus,
    setTenantSlug,
  } = useCart();

  const { connected } = useSocket();

  useEffect(() => {
    if (slugParam) setTenantSlug(slugParam);
  }, [slugParam, setTenantSlug]);

  const [tableNumber, setTableNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customQuantity, setCustomQuantity] = useState(1);
  const [customInstructions, setCustomInstructions] = useState('');

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [tableError, setTableError] = useState('');

  const tableInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraItem, setCameraItem] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  // Real-time tracking relies on polling in Vercel Serverless

  useEffect(() => {
    if (activeOrder) {
      const interval = setInterval(() => checkActiveOrderStatus(activeOrder.id), 12000);
      return () => clearInterval(interval);
    }
  }, [activeOrder]);

  useEffect(() => {
    if (checkoutStep === 'table' && tableInputRef.current) {
      setTimeout(() => tableInputRef.current?.focus(), 120);
    }
  }, [checkoutStep]);

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];
  const categoryIcons = {
    All: <Utensils size={15} />,
    Starters: <ChefHat size={15} />,
    Mains: <Package size={15} />,
    Desserts: <IceCream size={15} />,
    Drinks: <Coffee size={15} />,
  };

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const openCustomizationModal = (item) => {
    setSelectedItem(item); setCustomQuantity(1); setCustomInstructions(''); setIsModalOpen(true);
  };
  const handleAddToOrder = () => { addToCart(selectedItem, customQuantity, customInstructions); setIsModalOpen(false); };
  const openCart = () => { setCheckoutStep('cart'); setIsCartDrawerOpen(true); };
  const handleProceedToTable = () => { setTableError(''); setCheckoutStep('table'); };
  const handleTableSubmit = (e) => {
    e.preventDefault();
    if (!tableNumber.trim()) { setTableError('Please enter your table number to continue.'); return; }
    setTableError(''); setCheckoutStep('confirm');
  };
  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !tableNumber.trim()) return;
    setIsSubmitting(true);
    const result = await submitOrder(tableNumber.trim(), orderNotes);
    setIsSubmitting(false);
    if (result.success) {
      setIsCartDrawerOpen(false); setCheckoutStep('cart'); setOrderNotes('');
    } else { alert(result.error || 'Failed to place order. Please try again.'); }
  };
  const handleCloseDrawer = () => { setIsCartDrawerOpen(false); setCheckoutStep('cart'); };

  const openCamera = (item, e) => {
    e.stopPropagation();
    setCameraItem(item);
    setCapturedPhoto(null);
    setIsCameraOpen(true);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Camera access denied or not available.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedPhoto(canvas.toDataURL('image/jpeg'));
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  };

  const closeCamera = () => {
    const video = videoRef.current;
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    setIsCameraOpen(false); setCapturedPhoto(null); setCameraItem(null);
  };

  const shareItem = async (item, e) => {
    e.stopPropagation();
    const data = { title: item.name, text: `Check out ${item.name} — ${item.description || 'from our menu!'}`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch (err) { if (err.name !== 'AbortError') console.error(err); }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(`${item.name} — ${item.description || ''} ${window.location.href}`); alert('Link copied!'); } catch { alert('Sharing not supported.'); }
    } else { alert('Sharing not supported.'); }
  };

  useEffect(() => {
    if (isCameraOpen) startCamera();
    return () => { if (videoRef.current?.srcObject) { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); } };
  }, [isCameraOpen]);

  if (menuLoading && menu.length === 0) {
    return (
      <div className="view-loader-container">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Loading the menu…</p>
      </div>
    );
  }

  if (menuError && menu.length === 0) {
    return (
      <div className="view-error-container">
        <HelpCircle size={48} style={{ color: 'var(--danger)' }} />
        <h3>Unable to Load Menu</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{menuError}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (activeOrder) {
    const steps = [
      { key: 'pending',   label: 'Order Placed',     desc: 'Your order has been submitted',       icon: <Clock3 size={14} /> },
      { key: 'approved',  label: 'Confirmed',         desc: 'Staff has approved your order',       icon: <CheckCircle2 size={14} /> },
      { key: 'preparing', label: 'Preparing',         desc: 'Chefs are cooking your meal',         icon: <ChefHat size={14} /> },
      { key: 'ready',     label: 'Ready to Serve',    desc: 'Your food is leaving the kitchen',    icon: <Star size={14} /> },
    ];
    const statusMap = { pending: 1, approved: 2, preparing: 3, ready: 4, completed: 5, cancelled: 0 };
    const currentLevel = statusMap[activeOrder.status] || 0;
    const getStepClass = (key) => {
      if (activeOrder.status === 'cancelled') return 'step-cancelled';
      const level = statusMap[key];
      if (currentLevel >= level) return 'step-completed';
      if (currentLevel + 1 === level) return 'step-active';
      return 'step-pending';
    };

    return (
      <div className="tracker-container fade-in">
        <div className="tracker-card glass">
          <div className="tracker-header">
            <Sparkles className="spark-icon" size={28} />
            <h2>Order Tracking</h2>
            <p>Table <strong>{activeOrder.tableNumber}</strong> · Order #{activeOrder.id.slice(-6).toUpperCase()}</p>
          </div>
          {activeOrder.status === 'cancelled' ? (
            <div className="cancelled-banner">
              <h3>Order Cancelled</h3>
              <p>Your order was cancelled. Please call a staff member or place a new order.</p>
            </div>
          ) : activeOrder.status === 'completed' ? (
            <div className="completed-banner">
              <CheckCircle2 size={52} className="completed-icon" />
              <h3>Bon Appétit!</h3>
              <p>Your order has been fully served. Enjoy your meal!</p>
            </div>
          ) : (
            <div className="timeline">
              {steps.map((step) => {
                const cls = getStepClass(step.key);
                return (
                  <div key={step.key} className={`timeline-step ${cls}`}>
                    <div className="step-bullet">{cls === 'step-completed' ? <CheckCircle2 size={10} /> : step.icon}</div>
                    <div className="step-content"><h4>{step.label}</h4><p>{step.desc}</p></div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="order-summary-box">
            <h4>Items in This Order</h4>
            <div className="summary-list">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <span>{item.quantity}× {item.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Total</span><span>${activeOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <button className="btn-secondary w-full" onClick={() => setActiveOrder(null)}>← Back to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-browsing-container fade-in">
      <div className="menu-hero">
        <div className="menu-hero-text">
          <h1 className="menu-hero-title">Explore Our <span className="hero-highlight">Menu</span></h1>
          <p className="menu-hero-subtitle">Browse, customise, and order — your table, your pace.</p>
        </div>
        <div className="menu-hero-meta">
          <span className="hero-badge">
            <span className={`status-indicator ${connected ? 'online' : 'offline'}`} />
            {connected ? 'Kitchen Online' : 'Connecting…'}
          </span>
          <span className="hero-badge hero-badge-count">
            <Utensils size={13} /> {menu.length} items
          </span>
        </div>
      </div>

      <div className="search-bar-row">
        <div className="search-wrapper">
          <Search size={17} className="search-icon" />
          <input type="text" placeholder="Search dishes, drinks…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && <X size={15} className="clear-search" onClick={() => setSearchQuery('')} />}
        </div>
      </div>

      <div className="category-tabs-container">
        {categories.map((cat) => (
          <button key={cat} className={`category-tab ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
            {categoryIcons[cat]}{cat}
          </button>
        ))}
      </div>

      <div className="food-grid">
        {filteredMenu.map((item) => (
          <div key={item.id} className="food-card glass glass-hover" onClick={() => openCustomizationModal(item)}>
            <div className="food-image-wrapper">
              <img src={getImageUrl(item.image)} alt={item.name} onError={(e) => { e.target.src = '/images/default_food.jpg'; }} />
              {item.tags?.length > 0 && (
                <div className="food-card-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className={`badge ${tag.toLowerCase() === 'spicy' ? 'badge-accent' : tag.toLowerCase().includes('healthy') || tag.toLowerCase().includes('vegan') ? 'badge-success' : 'badge-primary'}`}>
                      {tag.toLowerCase() === 'spicy' && <Flame size={9} />}{tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="food-price-overlay">${item.price.toFixed(2)}</span>
            </div>
            <div className="food-card-body">
              <h3 className="food-card-name">{item.name}</h3>
              <p className="food-desc">{item.description}</p>
              <div className="food-card-actions-row">
                <button className="add-to-cart-btn btn-primary" onClick={(e) => { e.stopPropagation(); openCustomizationModal(item); }}>
                  <Plus size={15} /> Add to Order
                </button>
                <button className="food-action-btn" onClick={(e) => shareItem(item, e)} title="Share"><Share2 size={15} /></button>
                <button className="food-action-btn" onClick={(e) => openCamera(item, e)} title="Snap"><Camera size={15} /></button>
              </div>
            </div>
          </div>
        ))}
        {filteredMenu.length === 0 && <div className="no-items-found"><p>No items match your search.</p></div>}
      </div>

      {cartCount > 0 && (
        <button className="floating-cart-btn" onClick={openCart}>
          <ShoppingCart size={20} />
          <span>View Cart ({cartCount})</span>
          <span className="cart-btn-price">${cartTotal.toFixed(2)}</span>
        </button>
      )}

      {isModalOpen && selectedItem && (
        <div className="modal-backdrop fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            <div className="modal-header-image">
              <img src={getImageUrl(selectedItem.image)} alt={selectedItem.name} onError={(e) => { e.target.src = '/images/default_food.jpg'; }} />
            </div>
            <div className="modal-body">
              <div className="modal-title-row">
                <h2>{selectedItem.name}</h2>
                <span className="modal-price">${(selectedItem.price * customQuantity).toFixed(2)}</span>
              </div>
              <p className="modal-desc">{selectedItem.description}</p>
              <div className="customization-section">
                <label className="section-label"><MessageSquare size={14} /> Special Instructions</label>
                <textarea placeholder="e.g. No onions, extra spicy, allergy note…" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} />
              </div>
              <div className="modal-footer">
                <div className="quantity-selector">
                  <button className="qty-btn" onClick={() => setCustomQuantity(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                  <span className="qty-number">{customQuantity}</span>
                  <button className="qty-btn" onClick={() => setCustomQuantity(q => q + 1)}><Plus size={16} /></button>
                </div>
                <button className="btn-primary flex-1" onClick={handleAddToOrder}>Add to Order</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="modal-backdrop fade-in" onClick={closeCamera}>
          <div className="camera-modal glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCamera}><X size={18} /></button>
            <div className="camera-modal-header">
              <Camera size={18} />
              <h3>Snap — {cameraItem?.name}</h3>
            </div>
            <div className="camera-body">
              {!capturedPhoto ? (
                <>
                  <div className="camera-viewfinder">
                    <video ref={videoRef} autoPlay playsInline className="camera-video" />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                  <button className="camera-capture-btn" onClick={capturePhoto}>
                    <div className="capture-ring" />
                  </button>
                </>
              ) : (
                <div className="camera-preview">
                  <img src={capturedPhoto} alt="Captured" className="camera-preview-img" />
                  <div className="camera-preview-actions">
                    <button className="btn-secondary" onClick={() => { setCapturedPhoto(null); startCamera(); }}>Retake</button>
                    <button className="btn-primary" onClick={closeCamera}>Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCartDrawerOpen && (
        <div className="drawer-backdrop fade-in" onClick={handleCloseDrawer}>
          <div className="drawer-content glass" onClick={(e) => e.stopPropagation()}>
            {checkoutStep === 'cart' && (
              <>
                <div className="drawer-header">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={19} style={{ color: 'var(--primary)' }} />
                    <h3>Your Order</h3>
                  </div>
                  <button className="drawer-close" onClick={handleCloseDrawer}><X size={19} /></button>
                </div>
                <div className="drawer-body">
                  {cart.length === 0 ? (
                    <div className="empty-cart-view">
                      <Utensils size={44} style={{ color: 'var(--text-muted)' }} />
                      <p>Your cart is empty</p>
                      <button className="btn-primary mt-4" onClick={handleCloseDrawer}>Browse Menu</button>
                    </div>
                  ) : (
                    <div className="cart-items-list">
                      {cart.map((item, idx) => (
                        <div key={idx} className="cart-item-card">
                          <img src={getImageUrl(item.image)} alt={item.name} className="cart-item-thumb" onError={(e) => { e.target.src = '/images/default_food.jpg'; }} />
                          <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            {item.customizations && <span className="cart-item-notes">"{item.customizations}"</span>}
                            <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <div className="cart-item-actions">
                            <div className="qty-mini-selector">
                              <button onClick={() => updateQuantity(item.id, item.customizations, item.quantity - 1)}><Minus size={12} /></button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.customizations, item.quantity + 1)}><Plus size={12} /></button>
                            </div>
                            <button className="remove-item-btn" onClick={() => removeFromCart(item.id, item.customizations)}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="drawer-footer">
                    <div className="bill-breakdown">
                      <div className="bill-row"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                      <div className="bill-row"><span>Service (10%)</span><span>${(cartTotal * 0.1).toFixed(2)}</span></div>
                      <div className="bill-row grand-total"><span>Total</span><span>${(cartTotal * 1.1).toFixed(2)}</span></div>
                    </div>
                    <button className="btn-primary w-full" onClick={handleProceedToTable}>Proceed to Checkout <ArrowRight size={17} /></button>
                  </div>
                )}
              </>
            )}

            {checkoutStep === 'table' && (
              <div className="checkout-step-container fade-in">
                <button className="checkout-back-btn" onClick={() => setCheckoutStep('cart')}>← Back to cart</button>
                <div className="checkout-step-body">
                  <div className="checkout-step-icon"><MapPin size={30} /></div>
                  <h2 className="checkout-step-title">Where are you sitting?</h2>
                  <p className="checkout-step-subtitle">Enter your table number so we can deliver your order to the right place.</p>
                  <form onSubmit={handleTableSubmit} className="table-number-form">
                    <div className="table-input-wrapper">
                      <input ref={tableInputRef} type="text" id="checkout-table-input"
                        className={`table-number-input ${tableError ? 'input-error' : ''}`}
                        placeholder="e.g. 5 or Bar-2" value={tableNumber}
                        onChange={(e) => { setTableNumber(e.target.value); setTableError(''); }} maxLength={10} />
                    </div>
                    {tableError && <p className="input-error-msg">{tableError}</p>}
                    <button type="submit" className="btn-primary w-full" style={{ marginTop: '1.5rem' }}>
                      Confirm Table <ArrowRight size={17} />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {checkoutStep === 'confirm' && (
              <div className="checkout-step-container fade-in">
                <button className="checkout-back-btn" onClick={() => setCheckoutStep('table')}>← Change table</button>
                <div className="checkout-step-body">
                  <div className="checkout-step-icon confirm-icon"><CheckCircle2 size={30} /></div>
                  <h2 className="checkout-step-title">Ready to order?</h2>
                  <div className="confirm-table-pill"><MapPin size={14} /> Table <strong>{tableNumber}</strong></div>
                  <div className="confirm-order-summary">
                    {cart.map((item, idx) => (
                      <div key={idx} className="confirm-item-row">
                        <span className="confirm-item-qty">{item.quantity}×</span>
                        <span className="confirm-item-name">{item.name}</span>
                        <span className="confirm-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="confirm-total-row">
                      <span>Total (incl. service)</span>
                      <span>${(cartTotal * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="confirm-notes-section">
                    <label className="section-label"><MessageSquare size={13} /> Notes for Kitchen</label>
                    <input type="text" className="confirm-notes-input" placeholder="e.g. Serve drinks first, no rush…"
                      value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} />
                  </div>
                  <button className="btn-primary w-full place-order-btn" onClick={handlePlaceOrder} disabled={isSubmitting}>
                    {isSubmitting ? (<><div className="btn-spinner" /> Sending to Kitchen…</>) : (<><Sparkles size={16} /> Place Order for Table {tableNumber}</>)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
