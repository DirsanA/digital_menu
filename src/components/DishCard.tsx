import React from "react";
import { Dish } from "../types";
import { Eye, PlusCircle, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface DishCardProps {
  key?: any;
  dish: Dish;
  onSelect: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
  isInCart: boolean;
  isListView?: boolean;
}

export default function DishCard({ dish, onSelect, onAddToCart, isInCart, isListView = false }: DishCardProps) {
  if (isListView) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="group relative flex items-start bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10 border border-zinc-100/80 w-full cursor-pointer p-5 sm:p-5 gap-4 sm:gap-6"
        id={`dish-card-${dish.id}`}
        onClick={() => onSelect(dish)}
      >
        {/* Image on Left */}
        <div className="relative flex-shrink-0">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 p-1 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full shadow-xl overflow-visible">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full rounded-full object-cover border-2 sm:border-4 border-white transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {dish.popular && (
              <span className="absolute -top-2 -left-2 bg-amber-500 text-zinc-950 font-bold text-[10px] px-3 py-1 rounded-full shadow-md border-2 border-white uppercase tracking-wider flex items-center gap-1">
                🔥 BEST SELLER
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-3 pt-1 sm:pt-2">
          {/* Title & Tags */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="bg-zinc-200 text-zinc-700 font-bold text-[9px] sm:text-[11px] px-2 sm:px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {dish.category || "MAINS"}
                </span>
              </div>
              <h3 className="font-display font-extrabold text-zinc-900 text-lg sm:text-2xl leading-tight tracking-tight line-clamp-1 sm:line-clamp-2">
                {dish.name}
              </h3>
            </div>
          </div>

          {/* Description */}
          {dish.description && (
            <p className="text-zinc-600 text-sm sm:text-sm line-clamp-2 sm:line-clamp-2">
              {dish.description}
            </p>
          )}

          {/* Ingredients */}
          {(dish.ingredients && dish.ingredients.length > 0) && (
            <div className="hidden sm:flex flex-col gap-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ingredients:</span>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.slice(0, 4).map((ingredient, idx) => (
                  <span key={idx} className="bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full">
                    {ingredient}
                  </span>
                ))}
                {dish.ingredients.length > 4 && (
                  <span className="bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full">
                    +{dish.ingredients.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              className="hidden sm:block p-2 border border-zinc-200 rounded-full hover:bg-zinc-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(dish);
              }}
            >
              <Eye size={18} className="text-zinc-600" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(dish);
              }}
              className={`relative px-3 sm:px-5 py-2 sm:py-3 text-center transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl overflow-hidden group-hover/cart:scale-105 font-display font-extrabold text-sm sm:text-lg ${
                isInCart 
                  ? "bg-zinc-900 text-orange-400" 
                  : "bg-amber-500 hover:bg-orange-500 text-zinc-950"
              }`}
              title="Add this delicious dish to your virtual order tray"
            >
              <span>
                $ {dish.price.toFixed(2).replace(".", ",")}
              </span>
              {isInCart ? (
                <span className="text-lg sm:text-2xl">✓</span>
              ) : (
                <PlusCircle className="w-4 h-4 sm:w-6 sm:h-6" />
              )}
              {isInCart && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-zinc-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  ADDED
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between bg-white rounded-t-[40px] rounded-b-[28px] shadow-xl pt-28 pb-0 overflow-visible transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10 border border-zinc-100/80 w-full max-w-[280px] mx-auto min-h-[290px] cursor-pointer"
      id={`dish-card-${dish.id}`}
      onClick={() => onSelect(dish)}
    >
      {/* Absolute floating circle image that overflows the top of the card exactly like the design */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 h-44 z-10">
        <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-amber-400 to-orange-500 shadow-xl overflow-visible">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full rounded-full object-cover border-4 border-white transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3"
            referrerPolicy="no-referrer"
          />
          {dish.popular && (
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md border-2 border-white uppercase tracking-wider">
              ⭐ BEST
            </span>
          )}
        </div>
      </div>

      {/* Main card body (white background) */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-6 pb-6">
        {/* Dish Title */}
        <h3 className="font-display font-extrabold text-zinc-900 text-lg leading-tight tracking-tight text-center line-clamp-2 px-1 hover:text-orange-500 transition-colors">
          {dish.name}
        </h3>
      </div>

      {/* Full-width Orange footer block containing the price */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(dish);
        }}
        className={`relative w-full py-4 px-6 text-center transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 rounded-b-[28px] overflow-hidden group/footer ${
          isInCart 
            ? "bg-zinc-900 text-orange-400 hover:bg-zinc-800" 
            : "bg-amber-500 hover:bg-orange-500 text-zinc-950"
        }`}
        title="Add this delicious dish to your virtual order tray"
        id={`add-to-cart-bar-${dish.id}`}
      >
        {/* Subtle orange glow/ripple background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-amber-400/20 opacity-0 group-hover/footer:opacity-100 transition-opacity duration-300" />
        
        <span className="font-display font-black text-2xl tracking-wide">
          $ {dish.price.toFixed(2).replace(".", ",")}
        </span>

        {/* Add icon indicator */}
        <PlusCircle className={`w-5 h-5 transition-transform duration-300 ${isInCart ? 'rotate-45 text-orange-400' : 'group-hover/footer:scale-110 text-zinc-950'}`} />

        {isInCart && (
          <span className="absolute top-1 right-2 bg-orange-500 text-zinc-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            ADDED
          </span>
        )}
      </div>
    </motion.div>
  );
}
