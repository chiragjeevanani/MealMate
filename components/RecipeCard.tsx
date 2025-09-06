import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { HeartIcon, ClockIcon } from './icons/Icons';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(recipe.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFavorite(recipe.id);
    } else {
      addFavorite(recipe); // Pass the full recipe object
    }
  };
  
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Link to={`/recipe/${recipe.id}`} state={{ recipe }} className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-gray-800 dark:hover:border-emerald-500 dark:border-gray-700 dark:border animate-slide-in-up">
      {recipe.imageUrl && (
        <div className="relative">
          <img className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300" src={recipe.imageUrl} alt={recipe.name} />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 bg-white/80 dark:bg-gray-900/80 rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon className={`h-6 w-6 ${favorite ? 'text-red-500 fill-current' : ''}`} />
          </button>
        </div>
      )}
      <div className="p-6">
        {!recipe.imageUrl && (
            <div className="flex justify-between items-start">
                 <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase">{recipe.category}</p>
                 <button
                    onClick={handleFavoriteClick}
                    className="bg-white/80 dark:bg-gray-900/80 rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors -mt-2 -mr-2"
                    aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <HeartIcon className={`h-6 w-6 ${favorite ? 'text-red-500 fill-current' : ''}`} />
                </button>
            </div>
        )}
        {recipe.imageUrl && <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase">{recipe.category}</p>}
        <h3 className="text-xl font-bold mt-2 mb-2 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{recipe.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{recipe.description}</p>
         <div className="mt-4 flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <ClockIcon className="h-5 w-5 mr-2" />
          <span>{totalTime} min</span>
        </div>
      </div>
    </Link>
  );
};