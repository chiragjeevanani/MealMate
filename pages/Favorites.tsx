import React from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { RecipeCard } from '../components/RecipeCard';
import { Link } from 'react-router-dom';

export const Favorites: React.FC = () => {
  const { favorites, loading, error } = useFavorites();

  if (loading) {
    return <div className="text-center py-16">Loading favorites...</div>;
  }

  if (error) {
    const isConfigError = error.includes("Database Setup Required");

    return (
      <div className="max-w-3xl mx-auto animate-fade-in py-10">
        <div className={`text-center rounded-xl p-8 border ${isConfigError ? 'bg-orange-50 dark:bg-gray-800 border-orange-200 dark:border-orange-700 shadow-md' : 'bg-red-50 dark:bg-gray-800 border-red-200 dark:border-red-700 shadow-md'}`}>
          <div className="flex justify-center items-center mx-auto w-16 h-16 rounded-full mb-4 bg-white dark:bg-gray-700">
            <svg className={`w-10 h-10 ${isConfigError ? 'text-orange-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h1 className={`text-3xl font-extrabold mb-4 ${isConfigError ? 'text-orange-800 dark:text-orange-300' : 'text-red-600 dark:text-red-400'}`}>
            {isConfigError ? 'Database Setup Required' : 'An Error Occurred'}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">{isConfigError ? error.split(': ')[1] : error}</p>
          {isConfigError ? (
            <div className="mt-6 text-left text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                <p className="font-bold text-orange-900 dark:text-orange-200">How to fix this:</p>
                <p className="mt-2">
                  This error usually means the <strong>`user_favorites`</strong> table is missing from your Supabase database.
                </p>
                <p className="mt-2">
                  To create it, you need to run a setup script in your project's <strong>SQL Editor</strong> on the Supabase dashboard.
                </p>
            </div>
          ) : (
            <p className="mt-4 text-gray-500 dark:text-gray-400">Please try again later or contact support if the problem persists.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-emerald-700 dark:text-emerald-400">My Favorite Recipes</h1>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 dark:text-gray-300">You haven't saved any favorite recipes yet.</p>
          <Link to="/categories" className="mt-4 inline-block bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors">
            Explore Recipes
          </Link>
        </div>
      )}
    </div>
  );
};