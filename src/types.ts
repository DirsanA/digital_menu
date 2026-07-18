export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  allergens: string[]; // e.g., 'Gluten', 'Dairy', 'Nuts', 'Soy', 'Shellfish'
  spicyLevel: 0 | 1 | 2 | 3; // 0 = not spicy, 3 = very spicy
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  prepTime: number; // in minutes
  calories: number;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  popular: boolean;
}

export interface AllergenInfo {
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  selectedExclusions: string[];
  selectedAdditions: { name: string; price: number }[];
}
