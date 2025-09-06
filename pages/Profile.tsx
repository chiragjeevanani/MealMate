import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      navigate('/');
    } else {
      console.error("Failed to log out:", error.message);
    }
  };
  
  if (!user) {
    return (
        <div className="text-center p-8">
            <p>You must be logged in to view this page.</p>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md animate-fade-in">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-emerald-700 dark:text-emerald-400">My Profile</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h2>
          <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user.email}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</h2>
          <p className="mt-1 text-xs text-gray-500 font-mono">{user.id}</p>
        </div>
        <div className="border-t dark:border-gray-700 pt-6 mt-6">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};