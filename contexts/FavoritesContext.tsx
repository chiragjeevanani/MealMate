import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import { Recipe } from '../types';

interface FavoritesContextType {
  favorites: Recipe[];
  addFavorite: (recipe: Recipe) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  loading: boolean;
  error: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const GUEST_FAVORITES_KEY = 'recipeGuestFavorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupabaseFavorites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('user_favorites')
        .select('recipe_data')
        .eq('user_id', user.id);

      if (supabaseError) throw supabaseError;
      setFavorites(data.map(item => item.recipe_data) as Recipe[]);
    } catch (err: any) {
      console.error("Error fetching Supabase favorites:", JSON.stringify(err, null, 2));
      const isMissingTableError = err?.code === 'PGRST205' || 
                                (typeof err?.message === 'string' && err.message.includes('relation "user_favorites" does not exist'));

      if (isMissingTableError) {
          setError("Database Setup Required: Could not connect to your favorites collection. This might be a database configuration issue.");
      } else {
          setError(`An error occurred while fetching your favorites: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchLocalFavorites = useCallback(() => {
    setLoading(true);
    try {
      const localData = localStorage.getItem(GUEST_FAVORITES_KEY);
      setFavorites(localData ? JSON.parse(localData) : []);
    } catch (error) {
      console.error("Error fetching local favorites:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const mergeFavorites = async () => {
    if (!user) return;
    try {
      const localData = localStorage.getItem(GUEST_FAVORITES_KEY);
      const localFavorites: Recipe[] = localData ? JSON.parse(localData) : [];
      if (localFavorites.length > 0) {
        
        const { data: remoteFavoritesData, error: fetchError } = await supabase
          .from('user_favorites')
          .select('recipe_data')
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;

        const remoteFavorites = remoteFavoritesData.map(item => item.recipe_data) as Recipe[];
        const remoteIds = new Set(remoteFavorites.map(r => r.id));
        
        const favoritesToMerge = localFavorites.filter(localFav => !remoteIds.has(localFav.id));

        if (favoritesToMerge.length > 0) {
          const recordsToInsert = favoritesToMerge.map(recipe => ({
            user_id: user.id,
            recipe_id: recipe.id,
            recipe_data: recipe,
          }));

          const { error: insertError } = await supabase.from('user_favorites').insert(recordsToInsert);
          if (insertError) throw insertError;
        }
        
        localStorage.removeItem(GUEST_FAVORITES_KEY);
      }
    } catch (error) {
        console.error("Error merging favorites:", error);
    }
  };


  useEffect(() => {
    if (user) {
      mergeFavorites().then(() => fetchSupabaseFavorites());
    } else if (isGuest) {
      fetchLocalFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user, isGuest, fetchSupabaseFavorites, fetchLocalFavorites]);

  const addFavorite = async (recipe: Recipe) => {
    if (isFavorite(recipe.id)) return;

    const newFavorites = [...favorites, recipe];
    setFavorites(newFavorites);

    if (user) {
      const { data, error } = await supabase.from('user_favorites').upsert({
        user_id: user.id,
        recipe_id: recipe.id,
        recipe_data: recipe
      }, { onConflict: 'user_id, recipe_id' });

      if (error) {
        console.error("Error adding/updating Supabase favorite:", error);
        setFavorites(favorites); // Revert on error
      }
    } else if (isGuest) {
      localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(newFavorites));
    }
  };

  const removeFavorite = async (id: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(newFavorites);

    if (user) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .match({ user_id: user.id, recipe_id: id });
      if (error) {
        console.error("Error removing Supabase favorite:", error);
        setFavorites(favorites); // Revert on error
      }
    } else if (isGuest) {
      localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(newFavorites));
    }
  };

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, loading, error }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};