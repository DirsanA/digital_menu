import { AllergenInfo } from "./types";

export const ALLERGENS: AllergenInfo[] = [
  {
    name: "Gluten",
    icon: "🌾",
    description: "Contains wheat, rye, barley, or oats.",
    color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
  },
  {
    name: "Dairy",
    icon: "🥛",
    description: "Contains milk, cheese, butter, or cream.",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
  },
  {
    name: "Nuts",
    icon: "🥜",
    description: "Contains peanuts, tree nuts, or sesame.",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50",
  },
  {
    name: "Soy",
    icon: "🫘",
    description: "Contains soybeans or soy products.",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
  },
  {
    name: "Shellfish",
    icon: "🦐",
    description: "Contains shrimp, crab, lobster, or molluscs.",
    color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50",
  },
];
