import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { generateRecipe, generateRecipeFromIngredients, generateRecipesForCategory } from '../services/geminiService';

const CATEGORIES = ['Vegetarian', 'Quick Meals', 'Desserts', 'Chicken', 'Seafood', 'Pasta'];

export const Categories: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('Explore Recipes');

  // Effect to handle search/ingredient-based generation from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    const ingredientsQuery = searchParams.get('ingredients');

    const handleGeneration = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedCategory(null);
      setDisplayedRecipes([]);

      if (ingredientsQuery) {
        setPageTitle(`Generating ideas for your ingredients...`);
        const ingredients = ingredientsQuery.split(',');
        const generatedData = await generateRecipeFromIngredients(ingredients);
        if (generatedData) {
            navigate(`/recipe/${generatedData.id}`, { state: { recipe: generatedData } });
            return; // Exit early as we are navigating away
        } else {
             setError(`Sorry, we couldn't generate a recipe with those ingredients.`);
        }

      } else if (searchQuery) {
        setPageTitle(`Generating a recipe for "${searchQuery}"...`);
        const generatedData = await generateRecipe(searchQuery);
         if (generatedData) {
            navigate(`/recipe/${generatedData.id}`, { state: { recipe: generatedData } });
            return; // Exit early
        } else {
             setError(`Sorry, we couldn't generate a recipe for "${searchQuery}".`);
        }
      }
      setIsLoading(false);
    };

    if (searchQuery || ingredientsQuery) {
      handleGeneration();
    } else {
        // Reset to default state if there are no search params
        setPageTitle('Explore Recipes');
        setError(null);
        setDisplayedRecipes([]);
        setSelectedCategory(null);
    }
  }, [location.search, navigate]);

  const handleCategoryClick = async (category: string) => {
    if (isLoading) return;
    
    // Clear search bar when browsing categories
    if (searchTerm) setSearchTerm('');
    navigate('/categories', { replace: true }); // Clear URL params

    setSelectedCategory(category);
    setIsLoading(true);
    setError(null);
    setDisplayedRecipes([]);
    setPageTitle(`AI-Generated Ideas for ${category}`);

    try {
      const recipes = await generateRecipesForCategory(category);
      if (recipes && recipes.length > 0) {
        setDisplayedRecipes(recipes);
      } else {
        setError(`Sorry, we couldn't find any recipes for the "${category}" category right now. Please try another one.`);
        setDisplayedRecipes([]);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-extrabold text-center mb-4 text-emerald-700 dark:text-emerald-400">{pageTitle}</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Search for a specific dish or browse AI-generated ideas by category. Images can be generated on the recipe page.</p>
      
      {/* Search Bar */}
      <div className="mb-8 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Search for a specific recipe to generate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim()) {
              navigate(`/categories?search=${encodeURIComponent(searchTerm.trim())}`);
            }
          }}
          className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white dark:bg-gray-700 dark:placeholder-gray-400"
        />
      </div>

      {/* Category Buttons */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-center mb-4">Or Browse Categories</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              disabled={isLoading}
              className={`px-5 py-2 font-semibold rounded-full transition-colors duration-200
                ${selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }
                disabled:bg-gray-300 dark:disabled:bg-gray-500 disabled:cursor-not-allowed`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Results Display */}
      <div className="mt-8">
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-pulse text-xl text-gray-600 dark:text-gray-300">Our AI chef is cooking up some ideas...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-xl text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && displayedRecipes.length > 0 && (
          <div className="space-y-12">
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};