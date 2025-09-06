import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { AuthError, Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string) => Promise<{ error: AuthError | null; }>;
  logout: () => Promise<{ error: AuthError | null; }>;
  setGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        // Check for guest mode in session storage
        const guestStatus = sessionStorage.getItem('isGuest');
        if (guestStatus === 'true') {
          setIsGuest(true);
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if(session?.user) {
        setIsGuest(false);
        sessionStorage.removeItem('isGuest');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  const login = async (email: string) => {
     // This is a placeholder for a passwordless login flow. 
     // In a real app, you'd also take a password or use OAuth.
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    setIsGuest(false);
    sessionStorage.removeItem('isGuest');
    return { error };
  };
  
  const setGuestMode = () => {
    setIsGuest(true);
    sessionStorage.setItem('isGuest', 'true');
  };

  const value = {
    user,
    session,
    loading,
    isGuest,
    login,
    logout,
    setGuestMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
