'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const API_BASE = '/api';

export const CartProvider = ({ children }) => {
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  // Restore active order from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('activeOrder');
    if (saved) setActiveOrder(JSON.parse(saved));
  }, []);

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const res = await fetch(`${API_BASE}/menu`);
      const data = await res.json();
      if (data.success) setMenu(data.data);
      else setMenuError(data.message || 'Failed to fetch menu');
    } catch (err) {
      setMenuError('Could not connect to API server');
      console.error(err);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  useEffect(() => {
    if (activeOrder) localStorage.setItem('activeOrder', JSON.stringify(activeOrder));
    else localStorage.removeItem('activeOrder');
  }, [activeOrder]);

  const addToCart = (menuItem, quantity = 1, customizations = '') => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === menuItem.id && i.customizations === customizations);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, { id: menuItem.id, name: menuItem.name, price: menuItem.price, image: menuItem.image, quantity, customizations }];
    });
  };

  const removeFromCart = (itemId, customizations = '') =>
    setCart(prev => prev.filter(i => !(i.id === itemId && i.customizations === customizations)));

  const updateQuantity = (itemId, customizations = '', quantity) => {
    if (quantity <= 0) { removeFromCart(itemId, customizations); return; }
    setCart(prev => prev.map(i => i.id === itemId && i.customizations === customizations ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  const cartTotal = parseFloat(cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2));
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const submitOrder = async (tableNumber, notes = '') => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber, items: cart, notes })
      });
      const data = await res.json();
      if (data.success) { setActiveOrder(data.data); clearCart(); return { success: true, order: data.data }; }
      return { success: false, error: data.message };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Network error' };
    }
  };

  const checkActiveOrderStatus = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`);
      const data = await res.json();
      if (data.success) setActiveOrder(data.data);
    } catch (err) { console.error(err); }
  };

  return (
    <CartContext.Provider value={{
      menu, menuLoading, menuError, fetchMenu,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount,
      submitOrder, activeOrder, setActiveOrder, checkActiveOrderStatus
    }}>
      {children}
    </CartContext.Provider>
  );
};
