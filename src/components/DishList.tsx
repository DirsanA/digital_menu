import React from "react";
import { Dish } from "../types";
import { ALLERGENS } from "../data";
import { Eye, Flame, Clock, PlusCircle } from "lucide-react";
import { motion } from "motion/react";

interface DishListProps {
  key?: any;
  dish: Dish;
  onSelect: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
  isInCart: boolean;
}

export default function DishList({ dish, onSelect, onAddToCart, isInCart }: DishListProps) {
  const dishAllergens = ALLERGENS.filter((a) => dish.allergens.includes(a.name));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl shadow-md border border-zinc-100 p-4 md:p-5 flex flex-col md:flex-row items-center gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-500/15 w-full"
      id={`dish-list-${dish.id}`}
    >
      {/* Food Image Circle with subtle hover glow */}
      <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0">
        <div className="w-full h-full rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-orange-500 shadow-md">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full rounded-full object-cover border-4 border-white transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        {dish.popular && (
          <span className="absolute -top-1 -left-1 bg-amber-500 text-zinc-950 font-bold text-[9px] px-2 py-0.5 rounded-full shadow border border-white uppercase tracking-wider">
            Best Seller
          </span>
        )}
      </div>

      {/* Content Center */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-1.5">
          <span className="bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-100">
            {dish.category}
          </span>
          {dish.spicyLevel > 0 && (
            <span className="flex items-center gap-0.5 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
              <Flame className="w-3.5 h-3.5 fill-red-600 text-red-600" />
              Spicy Level {dish.spicyLevel}
            </span>
          )}
          <span className="flex items-center gap-1 bg-zinc-50 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-100">
            <Clock className="w-3 h-3" />
            {dish.prepTime} mins
          </span>
        </div>

        <h3 
          className="font-display font-extrabold text-zinc-900 text-xl leading-snug hover:text-orange-500 cursor-pointer transition-colors"
          onClick={() => onSelect(dish)}
        >
          {dish.name}
        </h3>
        
        <p className="text-zinc-400 text-sm mt-1.5 line-clamp-2 md:line-clamp-1">
          {dish.description}
        </p>

        {/* Ingredients preview */}
        <div className="hidden md:flex flex-wrap gap-1.5 mt-3">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider self-center mr-1">Ingredients:</span>
          {dish.ingredients.slice(0, 4).map((ing, i) => (
            <span key={i} className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md">
              {ing}
            </span>
          ))}
          {dish.ingredients.length > 4 && (
            <span className="text-[11px] text-zinc-400 font-bold self-center">+{dish.ingredients.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Allergens warning and Pricing block on the Right side */}
      <div className="w-full md:w-auto shrink-0 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-zinc-100 pt-3 md:pt-0 md:pl-5">
        
        {/* Allergen list or safe indicator */}
        <div className="flex flex-col items-start md:items-center gap-1">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Allergies:</span>
          <div className="flex gap-1.5">
            {dishAllergens.map((a) => (
              <span
                key={a.name}
                className="w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm bg-zinc-50 border border-zinc-200"
                title={`Allergy Warning: ${a.name}`}
              >
                {a.icon}
              </span>
            ))}
            {dishAllergens.length === 0 && (
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                🛡️ Allergen Safe
              </span>
            )}
          </div>
        </div>

        {/* Interactive action controls */}
        <div className="flex items-center gap-2">
          {/* Detailed Info Button */}
          <button
            onClick={() => onSelect(dish)}
            className="p-2.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-orange-500 hover:bg-zinc-50 transition-all"
            title="View full recipe and detailed nutritional metrics"
            id={`view-details-list-btn-${dish.id}`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Pricing Add Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(dish);
            }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-display font-black text-sm tracking-wide transition-all shadow-md ${
              isInCart
                ? "bg-zinc-900 text-orange-400 border border-zinc-800"
                : "bg-amber-500 hover:bg-orange-500 text-zinc-950"
            }`}
            id={`add-to-cart-list-${dish.id}`}
          >
            <span>$ {dish.price.toFixed(2).replace(".", ",")}</span>
            <PlusCircle className={`w-4 h-4 transition-transform duration-300 ${isInCart ? 'rotate-45 text-orange-400' : ''}`} />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
