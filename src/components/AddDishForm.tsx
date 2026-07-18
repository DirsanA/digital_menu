import React, { useState } from "react";
import { Dish } from "../types";
import { ALLERGENS } from "../data";
import { X, Sparkles, Plus, Check } from "lucide-react";
import { motion } from "motion/react";

interface AddDishFormProps {
  onClose: () => void;
  onAddDish: (newDish: Dish) => void;
}

// Curated Unsplash images for common restaurant foods that look outstanding
const FOOD_PRESETS = [
  {
    name: "Classic Burger",
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Neapolitan Pizza",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Golden Fries",
    url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Garden Salad",
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Pasta Bowl",
    url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Gourmet Dessert",
    url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop",
  },
];

export default function AddDishForm({ onClose, onAddDish }: AddDishFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("21.99");
  const [category, setCategory] = useState("Burgers");
  const [selectedImage, setSelectedImage] = useState(FOOD_PRESETS[0].url);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [spicyLevel, setSpicyLevel] = useState<0 | 1 | 2 | 3>(0);
  const [prepTime, setPrepTime] = useState(15);
  const [calories, setCalories] = useState(650);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);

  const handleAllergenToggle = (name: string) => {
    setAllergens((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    const parsedPrice = parseFloat(price) || 19.99;
    const finalImage = customImageUrl.trim() !== "" ? customImageUrl.trim() : selectedImage;

    const newDish: Dish = {
      id: `custom-dish-${Date.now()}`,
      name,
      description,
      price: parsedPrice,
      image: finalImage,
      category,
      allergens,
      spicyLevel,
      isVegetarian,
      isVegan,
      isGlutenFree,
      prepTime,
      calories,
      nutrition: {
        protein: Math.round(calories * 0.04), // Mock ratios
        carbs: Math.round(calories * 0.08),
        fat: Math.round(calories * 0.03),
      },
      ingredients: name.split(" ").concat(["Special Sauce", "Fresh Herbs"]),
      popular: false,
    };

    onAddDish(newDish);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-zinc-900 text-white rounded-[32px] border border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
        id="add-dish-form-modal"
      >
        <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-950 rounded-t-[32px]">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-500">
              <Sparkles className="w-5 h-5 fill-amber-500/10" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">Add Your Custom Dish</h3>
              <p className="text-[10px] text-zinc-400">Design your own card design exactly with custom pricing & allergy indicators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Dish Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dish Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Double Beef Cheeseburger"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</label>
            <textarea
              required
              rows={2}
              placeholder="Provide a delicious description including sensory details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Price, Category, Prep Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pricing ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.99"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-mono transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="Burgers">Burgers</option>
                <option value="Pizzas">Pizzas</option>
                <option value="Pastas">Pastas</option>
                <option value="Salads">Salads</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prep Time (mins)</label>
              <input
                type="number"
                min="1"
                required
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 15)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Spicy Level & Calories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Spiciness</label>
              <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                {[0, 1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSpicyLevel(lvl as any)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      spicyLevel === lvl
                        ? "bg-rose-500 text-white shadow-md"
                        : "hover:bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    {lvl === 0 ? "Mild" : "🔥".repeat(lvl)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Calories (kcal)</label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Food Preset Photo Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Select Dish Cover Image</label>
            <div className="grid grid-cols-6 gap-2">
              {FOOD_PRESETS.map((preset, idx) => {
                const isSelected = selectedImage === preset.url && customImageUrl === "";
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImage(preset.url);
                      setCustomImageUrl("");
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                      isSelected ? "border-amber-500 scale-95 shadow-md" : "border-transparent hover:border-zinc-700"
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-amber-500 stroke-[3px]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="pt-2">
              <div className="text-zinc-500 text-[10px] text-center uppercase tracking-widest">— OR PROVIDE CUSTOM IMAGE URL —</div>
              <input
                type="url"
                placeholder="https://images.unsplash.com/your-custom-image-url..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono transition-colors mt-2"
              />
            </div>
          </div>

          {/* Allergens warning selection (Crucial) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Declare Allergens (Select All That Apply)</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ALLERGENS.map((a) => {
                const active = allergens.includes(a.name);
                return (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => handleAllergenToggle(a.name)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-md"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                    }`}
                  >
                    <span className="text-sm">{a.icon}</span>
                    {a.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diet Preferences Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Dietary Suitability</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setIsVegetarian(!isVegetarian)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isVegetarian
                    ? "bg-emerald-950/30 border-emerald-500 text-emerald-400"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500"
                }`}
              >
                🥦 Vegetarian
              </button>

              <button
                type="button"
                onClick={() => setIsVegan(!isVegan)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isVegan
                    ? "bg-green-950/30 border-green-500 text-green-400"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500"
                }`}
              >
                🌿 Vegan
              </button>

              <button
                type="button"
                onClick={() => setIsGlutenFree(!isGlutenFree)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isGlutenFree
                    ? "bg-amber-950/30 border-amber-500 text-amber-400"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500"
                }`}
              >
                🌾 Gluten-Free
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-zinc-850 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-orange-500 text-zinc-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/15 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              Create Custom Card
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
