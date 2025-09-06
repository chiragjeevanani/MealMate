import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeCard } from '../components/RecipeCard';
import { XIcon } from '../components/icons/Icons';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim().toLowerCase())) {
      setIngredients([...ingredients, currentIngredient.trim().toLowerCase()]);
      setCurrentIngredient('');
    }
  };
  
  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
  };
  
  const handleIngredientSearch = () => {
    if (ingredients.length > 0) {
      navigate(`/categories?ingredients=${encodeURIComponent(ingredients.join(','))}`);
    }
  };

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl shadow-sm">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700 dark:text-emerald-400">Find Your Next Favorite Meal</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore delicious recipes with easy-to-follow steps, cook-along timers, and helpful AI tips to guide you.
        </p>
        <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for any recipe..."
            className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-l-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white dark:bg-gray-700 dark:placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-r-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Search
          </button>
        </form>
      </section>
      
      {/* Cook with what you have Section */}
      <section className="text-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl shadow-sm">
         <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-400">Cook With What You Have</h2>
         <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enter the ingredients you have on hand, and we'll help you find or create a delicious recipe.
        </p>
        <div className="mt-8 max-w-xl mx-auto">
            <div className="flex">
                <input
                    type="text"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyDown={handleIngredientKeyDown}
                    placeholder="e.g., chicken, broccoli, rice"
                    className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-l-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-white dark:bg-gray-700 dark:placeholder-gray-400"
                />
                <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-r-full hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                >
                    Add
                </button>
            </div>
             {ingredients.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {ingredients.map(ing => (
                        <span key={ing} className="flex items-center gap-2 bg-amber-200 dark:bg-gray-700 text-amber-800 dark:text-amber-200 text-sm font-medium px-3 py-1 rounded-full">
                            {ing}
                            <button onClick={() => handleRemoveIngredient(ing)} className="text-amber-600 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-100">
                                <XIcon className="h-4 w-4"/>
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <button
              onClick={handleIngredientSearch}
              disabled={ingredients.length === 0}
              className="mt-6 px-8 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Find Recipes
            </button>
        </div>
      </section>
    </div>
  );
};