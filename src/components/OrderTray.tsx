import React, { useState, useEffect } from "react";
import { CartItem } from "../types";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2, Clock, ChefHat, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OrderStatus {
  id: string;
  status: string;
  tableNumber: number;
  orderNumber: number;
  items: Array<{ name: string; quantity: number }>;
}

interface OrderTrayProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, change: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckout: (tableNumber: string) => Promise<void>;
  activeOrder?: OrderStatus | null;
  lastOrder?: OrderStatus | null;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Flame },
];

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending': return 'Your order has been placed. Waiting for the waiter to approve...';
    case 'approved': return 'Order approved! The kitchen is picking it up...';
    case 'preparing': return 'The chef is cooking your order right now!';
    case 'ready': return 'Your order is ready! It will be served shortly.';
    case 'completed': return 'Order has been served. Enjoy your meal!';
    case 'cancelled': return 'This order was cancelled.';
    default: return 'Tracking your order...';
  }
}

function OrderStatusTracker({ order: initialOrder }: { order: OrderStatus }) {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const currentIdx = getStepIndex(currentOrder.status);
  const isTerminal = ['completed', 'cancelled'].includes(currentOrder.status);

  useEffect(() => {
    if (isTerminal) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${initialOrder.id}`, {
          headers: { 'x-tenant-slug': localStorage.getItem('tenantSlug') || '' },
        });
        const data = await res.json();
        if (data.success) {
          setCurrentOrder(data.data);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [initialOrder.id, isTerminal]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="order-status-tracker"
    >
      <div className="order-status-steps">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx || (isTerminal && currentOrder.status === 'completed');
          const isActive = idx === currentIdx && !isTerminal;
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.key}>
              {idx > 0 && (
                <div className={`order-status-connector ${idx <= currentIdx ? 'active' : ''}`} />
              )}
              <div className="order-status-step">
                <div className={`order-status-step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <StepIcon size={14} />
                </div>
                <span className={`order-status-step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <p className="order-status-message">
        {currentOrder.status === 'cancelled' ? (
          <span style={{ color: '#ef4444' }}>{getStatusMessage(currentOrder.status)}</span>
        ) : (
          <>{getStatusMessage(currentOrder.status)}</>
        )}
      </p>

      {currentOrder.status === 'ready' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80', padding: '0.5rem 1rem', borderRadius: '0.75rem',
            fontSize: '0.8rem', fontWeight: 700
          }}>
            <CheckCircle2 size={16} /> Your order is ready!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function OrderTray({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  activeOrder,
  lastOrder,
}: OrderTrayProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [tableNumber, setTableNumber] = useState("04");

  const displayOrder = activeOrder || lastOrder;

  const subtotal = cartItems.reduce((total, item) => {
    const itemBase = item.dish.price;
    const additionsCost = item.selectedAdditions.reduce((sum, a) => sum + a.price, 0);
    return total + (itemBase + additionsCost) * item.quantity;
  }, 0);

  const tax = subtotal * 0.0825;
  const serviceCharge = subtotal > 0 ? 3.50 : 0;
  const total = subtotal + tax + serviceCharge;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await onCheckout(tableNumber);
      setIsCheckingOut(false);
      setCheckoutComplete(true);
    } catch (err) {
      console.error("Failed to submit order:", err);
      setIsCheckingOut(false);
    }
  };

  const handleReset = () => {
    onClearCart();
    setCheckoutComplete(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-screen max-w-md bg-zinc-950 text-white shadow-2xl flex flex-col h-full border-l border-zinc-800"
          id="order-tray-sidebar"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-white">
                  {checkoutComplete ? 'Order Status' : 'Your Gourmet Tray'}
                </h2>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Table {tableNumber} {checkoutComplete ? '• Live Tracking' : '• Real-time Order Builder'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              id="close-tray-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main content body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {checkoutComplete ? (
              /* Success / Status Tracker Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-6"
                id="checkout-success-view"
              >
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-white">Order Placed!</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Order #{displayOrder ? String(displayOrder.orderNumber).padStart(4, '0') : '----'} • Table {displayOrder?.tableNumber || tableNumber}
                  </p>
                </div>

                {displayOrder && <OrderStatusTracker order={displayOrder} />}

                {/* Receipt */}
                <div className="bg-white text-zinc-900 p-5 rounded-2xl text-left font-mono text-xs space-y-3 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                  <div className="text-center font-bold pb-2 border-b border-dashed border-zinc-300">
                    <p className="text-sm font-display font-extrabold uppercase tracking-wider text-amber-600">Gourmet Kiosk</p>
                    <p className="text-[10px] text-zinc-400 font-normal mt-0.5">Order Ref: #{displayOrder ? String(displayOrder.orderNumber).padStart(4, '0') : '----'}</p>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {displayOrder?.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{item.quantity}x {item.name}</p>
                        </div>
                      </div>
                    )) || cartItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{item.quantity}x {item.dish.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-[10px] text-zinc-400 pt-3 border-t border-dashed border-zinc-300">
                    Thank you for dining with us!
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-all border border-zinc-700"
                  id="reset-tray-btn"
                >
                  Close & Order Something Else
                </button>
              </motion.div>
            ) : cartItems.length === 0 ? (
              /* Empty Tray View */
              <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-zinc-200">Your Tray is Empty</h3>
                  <p className="text-zinc-500 text-xs mt-1 max-w-[240px] mx-auto">
                    Choose from our delectable dishes, select custom toppings or allergen preferences, and build your perfect meal!
                  </p>
                </div>
              </div>
            ) : (
              /* Active Tray Items List */
              <div className="space-y-4" id="active-cart-list">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Dishes Selected ({cartItems.length})</span>
                  <button
                    onClick={onClearCart}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-rose-500/10 py-1 px-2.5 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </div>

                <AnimatePresence>
                  {cartItems.map((item, idx) => {
                    const itemAdditionsCost = item.selectedAdditions.reduce((sum, a) => sum + a.price, 0);
                    const itemTotalPrice = (item.dish.price + itemAdditionsCost) * item.quantity;
                    return (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 relative group"
                        id={`cart-item-${idx}`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.dish.image}
                            alt={item.dish.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800 shadow-md shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-display font-extrabold text-white text-sm leading-tight truncate pr-2">
                                {item.dish.name}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(idx)}
                                className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-xs text-amber-500 font-bold font-display">
                              ${(item.dish.price + itemAdditionsCost).toFixed(2)}
                            </span>

                            {(item.selectedExclusions.length > 0 || item.selectedAdditions.length > 0) && (
                              <div className="mt-1.5 space-y-0.5 border-l border-amber-500/40 pl-2 text-[10px] text-zinc-400 font-medium">
                                {item.selectedExclusions.map((ex) => (
                                  <span key={ex} className="block text-rose-400">- No {ex}</span>
                                ))}
                                {item.selectedAdditions.map((ad) => (
                                  <span key={ad.name} className="block text-emerald-400">+ {ad.name}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-zinc-800/60">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onUpdateQuantity(idx, -1)}
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-mono text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(idx, 1)}
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-display font-black text-white text-sm">
                            ${itemTotalPrice.toFixed(2)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Tray Footer (Pricing & Checkout) */}
          {!checkoutComplete && cartItems.length > 0 && (
            <div className="bg-zinc-900 border-t border-zinc-800 p-6 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Sales Tax (8.25%):</span>
                  <span className="font-mono text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Kitchen Service Fee:</span>
                  <span className="font-mono text-white">${serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-display font-extrabold text-white pt-2 border-t border-zinc-800">
                  <span>Total Bill:</span>
                  <span className="text-amber-500 font-mono text-base">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs">
                <label className="text-zinc-400 font-bold uppercase tracking-wider pl-1">Dining Table #:</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-16 bg-zinc-900 text-amber-500 font-black font-display text-center py-1 rounded border border-zinc-800 focus:outline-none focus:border-amber-500"
                  maxLength={4}
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-amber-500 hover:bg-orange-500 text-zinc-950 font-display font-black py-4 px-6 rounded-2xl text-center shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                id="tray-checkout-btn"
              >
                {isCheckingOut ? (
                  <>
                    <span className="animate-pulse">Placing Order...</span>
                  </>
                ) : (
                  <>
                    Place Order & Send to Kitchen
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
