import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { ChefHatIcon } from '../components/icons/Icons';

export const Login: React.FC = () => {
  const { user, setGuestMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setError(error.message);
  };
  
  const handleGuestMode = () => {
    setGuestMode();
    navigate('/');
  };

  const inputClasses = "mt-1 block w-full px-4 py-3 bg-emerald-50/50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:border-emerald-500 text-base transition-all duration-200 ease-in-out";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
            <Link to="/" className="flex justify-center items-center gap-2 text-emerald-600 mb-2">
                <ChefHatIcon className="h-10 w-10" />
            </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Sign in to your account</h2>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
             <div>
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <span className="sr-only">Sign in with Google</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  {/* Google Icon SVG Path */}
                  <path d="M20 10.021C20 9.32 19.943 8.645 19.832 8H10.22v3.66h5.42c-.235 1.18-.9 2.18-1.93 2.86v2.37h3.06c1.79-1.65 2.83-4.1 2.83-6.87z" />
                  <path d="M10.22 20c2.75 0 5.06-0.91 6.75-2.46l-3.06-2.37c-.91.61-2.08.97-3.69.97-2.83 0-5.23-1.9-6.09-4.45H1.05v2.46C2.7 18.05 6.16 20 10.22 20z" />
                  <path d="M4.13 11.16c-.19-.57-.3-1.17-.3-1.79s.11-1.22.3-1.79V5.11H1.05C.38 6.48 0 8.18 0 10s.38 3.52 1.05 4.89l3.08-2.73z" />
                  <path d="M10.22 3.98c1.5 0 2.85.52 3.91 1.5l2.71-2.71C15.28.91 12.97 0 10.22 0 6.16 0 2.7 1.95 1.05 5.11l3.08 2.46C5 4.95 7.39 3.98 10.22 3.98z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-4 text-center">
             <button
                onClick={handleGuestMode}
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Continue as Guest
              </button>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Not a member?{' '}
          <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};