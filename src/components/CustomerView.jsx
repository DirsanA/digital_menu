'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSocket } from '@/context/SocketContext';
import DishCard from './DishCard';
import DishDetailModal from './DishDetailModal';
import OrderTray from './OrderTray';
import { Utensils, Plus, ShoppingCart, Grid, List } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

function adaptToDish(item) {
  const tags = item.tags || [];
  const isPopular = tags.some(t => typeof t === 'string' && t.toLowerCase() === 'popular');
  const spicyTags = tags.filter(t => typeof t === 'string' && ['mild', 'medium', 'hot', 'spicy'].includes(t.toLowerCase()));
  const spicyLevel = spicyTags.length > 0 ? Math.min(spicyTags.length + 1, 3) : 0;

  // Get ingredients from item
  let dishIngredients = [];
  if (item.ingredients) {
    dishIngredients = item.ingredients;
  } else if (item.tags) {
    dishIngredients = item.tags;
  }
  
  // If it's a string, split by commas
  if (typeof dishIngredients === 'string') {
    dishIngredients = dishIngredients.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } else if (!Array.isArray(dishIngredients)) {
    // If it's not an array or string, make it an empty array
    dishIngredients = [];
  } else {
    // Ensure all elements are strings
    dishIngredients = dishIngredients.filter(ing => typeof ing === 'string').map(ing => ing.trim()).filter(ing => ing.length > 0);
  }

  // Extract allergens from tags as well
  const allergenTags = tags.filter(t => 
    ['milk', 'gluten', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'wheat'].includes(t.toLowerCase())
  );

  return {
    id: item.id,
    name: item.name,
    description: item.description || 'A delicious dish made with the freshest ingredients',
    price: item.price,
    image: item.image,
    category: item.category || 'Mains',
    allergens: allergenTags.length > 0 ? allergenTags : [],
    spicyLevel,
    isVegetarian: tags.some(t => t.toLowerCase() === 'vegetarian' || t.toLowerCase() === 'vegan'),
    isVegan: tags.some(t => t.toLowerCase() === 'vegan'),
    isGlutenFree: tags.some(t => t.toLowerCase() === 'gluten-free'),
    prepTime: item.prepTime || Math.floor(Math.random() * 15) + 10, // Use item's prepTime if available
    calories: item.calories || 500, // Use item's calories if available
    nutrition: item.nutrition || { protein: 25, carbs: 40, fat: 20 }, // Use item's nutrition if available
    ingredients: dishIngredients,
    popular: isPopular, // Only use tag-based popularity, no random
  };
}

export default function CustomerView() {
  const searchParams = useSearchParams();
  const slugParam = searchParams.get('slug');

  const {
    menu, menuLoading, menuError,
    cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount,
    clearCart,
    submitOrder, activeOrder, setActiveOrder, checkActiveOrderStatus,
    setTenantSlug,
  } = useCart();
  const { connected } = useSocket();

  useEffect(() => {
    if (slugParam) setTenantSlug(slugParam);
  }, [slugParam, setTenantSlug]);

  const [tableNumber, setTableNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewMode');
      if (saved === 'grid' || saved === 'list') return saved;
      return window.innerWidth < 630 ? 'list' : 'grid';
    }
    return 'grid';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);



  const [selectedDish, setSelectedDish] = useState(null);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Real-time tracking
  useEffect(() => {
    if (activeOrder) {
      const interval = setInterval(() => checkActiveOrderStatus(activeOrder.id), 12000);
      return () => clearInterval(interval);
    }
  }, [activeOrder]);

  const adaptedDishes = useMemo(() =>
    menu.filter(item => item.available).map(adaptToDish),
    [menu]
  );

  // Get unique categories from menu items
  const CATEGORIES = useMemo(() => {
    const categories = ['ALL'];
    const uniqueCats = new Set();
    adaptedDishes.forEach(dish => {
      const cat = dish.category?.trim().toUpperCase();
      if (cat && !uniqueCats.has(cat)) {
        uniqueCats.add(cat);
        categories.push(cat);
      }
    });
    return categories;
  }, [adaptedDishes]);

  const filteredDishes = useMemo(() =>
    adaptedDishes.filter(dish => {
      if (selectedCategory !== 'ALL') {
        return dish.category?.trim().toUpperCase() === selectedCategory;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return dish.name.toLowerCase().includes(q) || dish.description.toLowerCase().includes(q);
      }
      return true;
    }),
    [adaptedDishes, selectedCategory, searchQuery]
  );

  // Build prototype CartItems from API-driven cart
  const trayCartItems = useMemo(() =>
    cart.map(cartItem => {
      const dish = adaptedDishes.find(d => d.id === cartItem.id);
      return dish ? {
        dish,
        quantity: cartItem.quantity,
        selectedExclusions: [],
        selectedAdditions: [],
      } : null;
    }).filter(Boolean),
    [cart, adaptedDishes]
  );

  // OrderTray ops → adapt to CartContext
  const handleTrayUpdateQuantity = (idx, change) => {
    const item = trayCartItems[idx];
    if (!item) return;
    const newQ = item.quantity + change;
    const cartItem = cart.find(c => c.id === item.dish.id);
    if (!cartItem) return;
    if (newQ <= 0) {
      removeFromCart(cartItem.id, cartItem.customizations);
    } else {
      updateQuantity(cartItem.id, cartItem.customizations, newQ);
    }
  };

  const handleTrayRemoveItem = (idx) => {
    const item = trayCartItems[idx];
    if (!item) return;
    const cartItem = cart.find(c => c.id === item.dish.id);
    if (cartItem) removeFromCart(cartItem.id, cartItem.customizations);
  };

  const handleDishAddToCart = (dish, exclusions = [], additions = []) => {
    const menuItem = menu.find(m => m.id === dish.id);
    if (menuItem) {
      // Combine exclusions and additions into notes for the cart
      const notes = [];
      if (exclusions.length > 0) notes.push(`No: ${exclusions.join(', ')}`);
      if (additions.length > 0) notes.push(`Add: ${additions.map(a => a.name).join(', ')}`);
      
      addToCart(menuItem, 1, notes.join(' | '));
      setIsTrayOpen(true);
    }
  };

  // OrderTray checkout → real submit
  const handleTrayCheckout = async (trayTableNumber) => {
    const result = await submitOrder(trayTableNumber || '1', '');
    if (result?.success) {
      setLastOrder(result.order);
    }
  };

  if (menuLoading && menu.length === 0) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-zinc-400 text-center space-y-3">
          <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading the menu…</p>
        </div>
      </div>
    );
  }

  if (menuError && menu.length === 0) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-8">
        <div className="bg-zinc-900/60 border border-zinc-800 p-8 rounded-3xl text-center max-w-sm space-y-4">
          <Utensils size={40} className="mx-auto text-zinc-500" />
          <h3 className="text-white font-bold text-lg">Unable to Load Menu</h3>
          <p className="text-zinc-400 text-sm">{menuError}</p>
          <button className="bg-amber-500 hover:bg-orange-500 text-zinc-900 font-bold py-2.5 px-6 rounded-xl transition-all" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 font-sans antialiased overflow-x-hidden pb-24">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <Utensils className="w-5 h-5 text-zinc-900 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-black text-base uppercase leading-none text-white flex items-center gap-1.5">
                Digital Menu
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-amber-500 text-xs ml-1">LIVE</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
           
            <button
              onClick={() => setIsTrayOpen(true)}
              className="bg-amber-500 hover:bg-orange-500 text-zinc-900 font-bold py-2 px-4 rounded-xl transition-all text-sm flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="bg-zinc-900 text-white rounded-full text-[10px] font-bold px-2 py-0.5">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Category Bar */}
        <div className="bg-zinc-900/70 backdrop-blur-sm rounded-2xl p-4 border border-zinc-700 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Categories</span>
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedCategory === cat
                        ? "bg-amber-500 text-zinc-900 shadow-md"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">View Mode</span>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500 hover:bg-zinc-800'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500 hover:bg-zinc-800'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Dish Display */}
        <section className="relative">
          {filteredDishes.length === 0 ? (
            <div className="py-20 text-center">
              <Utensils size={40} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-400 text-sm">No matching dishes found.</p>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-24 pt-16 pb-8">
                <AnimatePresence mode="popLayout">
                  {filteredDishes.map(dish => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      onSelect={setSelectedDish}
                      onAddToCart={handleDishAddToCart}
                      isInCart={cart.some(c => c.id === dish.id)}
                      isListView={false}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div layout className="flex flex-col gap-6 pt-6 pb-8">
                <AnimatePresence mode="popLayout">
                  {filteredDishes.map(dish => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      onSelect={setSelectedDish}
                      onAddToCart={handleDishAddToCart}
                      isInCart={cart.some(c => c.id === dish.id)}
                      isListView={true}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )
          )}
        </section>
      </main>

      <DishDetailModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={handleDishAddToCart}
        isInCart={cart.some(c => c.id === selectedDish?.id)}
      />

      <OrderTray
        isOpen={isTrayOpen}
        onClose={() => setIsTrayOpen(false)}
        cartItems={trayCartItems}
        onUpdateQuantity={handleTrayUpdateQuantity}
        onRemoveItem={handleTrayRemoveItem}
        onClearCart={clearCart}
        onCheckout={handleTrayCheckout}
        activeOrder={activeOrder}
        lastOrder={lastOrder}
      />
    </div>
  );
}
