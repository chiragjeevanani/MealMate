export interface Step {
  description: string;
  time: number; // in seconds
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'Vegetarian' | 'Non-Vegetarian' | 'Quick Meals' | 'Desserts' | string; // Allow string for AI-generated categories
  imageUrl: string;
  ingredients: string[];
  steps: Step[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  isGenerated?: boolean;
}
