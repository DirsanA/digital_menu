import React, { useState } from "react";
import { Dish } from "../types";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DishDetailModalProps {
  dish: Dish | null;
  onClose: () => void;
  onAddToCart: (
    dish: Dish,
    exclusions: string[],
    additions: { name: string; price: number }[]
  ) => void;
  isInCart: boolean;
}

export default function DishDetailModal({ dish, onClose, onAddToCart, isInCart }: DishDetailModalProps) {
  const [exclusionsText, setExclusionsText] = useState<string>("");
  const [additions, setAdditions] = useState<{ name: string; price: number }[]>([]);

  if (!dish) return null;

  // Customization lists based on category
  const possibleAdditions = [
    { name: "Extra Cheese", price: 2.50 },
    { name: "Add Bacon / Avocado", price: 3.00 },
  ].filter((add) => {
    // Only show relevant options
    if (dish.category !== "Burgers" && add.name === "Add Bacon / Avocado") return false;
    if (dish.category !== "Pizzas" && dish.category !== "Burgers" && add.name === "Extra Cheese") return false;
    return true;
  });

  const toggleAddition = (add: { name: string; price: number }) => {
    setAdditions((prev) =>
      prev.some((a) => a.name === add.name)
        ? prev.filter((a) => a.name !== add.name)
        : [...prev, add]
    );
  };

  const handleAddWithCustomizations = () => {
    // Split text into array (split by commas, trim whitespace, remove empty strings)
    const exclusionsArray = exclusionsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    
    onAddToCart(dish, exclusionsArray, additions);
    onClose();
  };

  const totalCustomizedPrice = dish.price + additions.reduce((sum, a) => sum + a.price, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl max-w-4xl w-full overflow-hidden border border-zinc-100 dark:border-zinc-800 z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
          id="dish-detail-modal"
        >
          {/* Left Side: High-res Media Banner */}
          <div className="relative w-full md:w-5/12 bg-zinc-100 dark:bg-zinc-950/50 flex flex-col justify-between overflow-hidden">
            {/* Top Image Portion */}
            <div className="relative aspect-video md:aspect-square w-full">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
              
              {/* Close Button on Mobile overlay */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 md:hidden bg-zinc-900/60 hover:bg-zinc-900 text-white p-2 rounded-full backdrop-blur-sm transition-colors border border-white/10"
                id="close-modal-mobile"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Float Category Overlay */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <span className="bg-amber-500 text-zinc-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  {dish.category}
                </span>
                {dish.popular && (
                  <span className="bg-zinc-900/80 backdrop-blur-sm text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-white/10 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                    Best Seller
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Header, Allergen Warnings, Customizer, Add to Tray */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 md:p-8">
            
            {/* Header portion */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-display font-black text-zinc-900 dark:text-zinc-50 text-2xl md:text-3xl leading-tight">
                    {dish.name}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="hidden md:flex bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 p-2 rounded-full transition-colors border border-transparent dark:border-zinc-700"
                  id="close-modal-desktop"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3.5 leading-relaxed">
                {dish.description}
              </p>

              {/* Ingredients List */}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-display font-black text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider mb-3">
                    📝 Ingredients
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dish.ingredients.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization Exclusions Text Input */}
              <div className="mt-6">
                <h4 className="font-display font-black text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  🔄 Exclude Ingredients
                </h4>
                <input
                  type="text"
                  value={exclusionsText}
                  onChange={(e) => setExclusionsText(e.target.value)}
                  placeholder="e.g. Onions, Garlic, Extra Salt (comma separated)"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              {/* Customization Additions Checklist */}
              {possibleAdditions.length > 0 && (
                <div className="mt-6">
                  <div className="space-y-2">
                    {possibleAdditions.map((addition) => {
                      const isAdded = additions.some((a) => a.name === addition.name);
                      return (
                        <div
                          key={addition.name}
                          onClick={() => toggleAddition(addition)}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                            isAdded
                              ? "bg-amber-50/70 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/40 text-zinc-950 dark:text-amber-100"
                              : "bg-zinc-50/50 hover:bg-zinc-50 border-zinc-100 dark:bg-zinc-800/40 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 text-xs font-bold">
                            {addition.name}
                          </div>
                          <span className="text-xs font-display font-black text-amber-600 dark:text-amber-400">
                            +${addition.price.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Add-To-Tray Footer Block */}
            <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-5 flex items-center justify-between gap-4">
              <div>
                <span className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Total Price</span>
                <span className="font-display font-black text-3xl text-zinc-900 dark:text-zinc-50">
                  ${totalCustomizedPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleAddWithCustomizations}
                className="flex-1 max-w-xs bg-amber-500 hover:bg-orange-500 text-zinc-950 font-display font-black py-4 px-6 rounded-2xl text-center shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                id="modal-add-to-cart-btn"
              >
                {isInCart ? "Customize / Add Another" : "Add to Cart"}
                <span className="bg-zinc-950 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                  ${totalCustomizedPrice.toFixed(2)}
                </span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
