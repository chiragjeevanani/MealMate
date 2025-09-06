import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 mt-12 border-t dark:border-gray-700">
      <div className="container mx-auto py-6 px-4 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} MealMate. Happy Cooking!</p>
      </div>
    </footer>
  );
};