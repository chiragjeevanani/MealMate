import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md animate-fade-in">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-emerald-700 dark:text-emerald-400">About MealMate</h1>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          Welcome to MealMate, your modern guide to making delicious meals at home. I believe that cooking should be an enjoyable and stress-free experience for everyone, from seasoned chefs to complete beginners.
        </p>
        <p>
          My app is designed to help you succeed in the kitchen with a curated library of recipes, detailed step-by-step instructions, and our unique cook-along feature.
        </p>
        <h2 className="text-2xl font-bold pt-4 text-gray-800 dark:text-gray-100">Our Features</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Recipe Library:</strong> Discover a wide range of recipes across various categories, including vegetarian, quick meals, desserts, and more.</li>
          <li><strong>Cook-Along Timers:</strong> Never miss a beat with interactive timers for each cooking step. Start, pause, and reset as you go, ensuring perfect timing for every part of your meal.</li>
          <li><strong>AI-Powered Chef's Tips:</strong> Stuck on a step? Get instant, helpful tips from our AI chef, powered by Google's Gemini API, to learn new techniques and perfect your dish.</li>
          <li><strong>AI Recipe Generation:</strong> Can't find what you're looking for? Just search for it, and our AI chef will write a brand new recipe for you on the spot!</li>
          <li><strong>Favorites:</strong> Save the recipes you love for easy access anytime.</li>
          <li><strong>Responsive Design:</strong> Cook from any device—desktop, tablet, or mobile. Our app is designed to look and work great everywhere.</li>
        </ul>
        <p>
          My mission is to empower you with the tools and confidence to create amazing food. So grab your apron, and let's get cooking!
        </p>
        <h6 className="text-2xl font-extrabold text-center mb-6 text-emerald-700 dark:text-emerald-400">By- Chirag Jeevanani</h6>
      </div>
    </div>
  );
};
