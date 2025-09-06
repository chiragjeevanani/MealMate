import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHatIcon, MenuIcon, XIcon, SunIcon, MoonIcon, UserCircleIcon } from './icons/Icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
        </button>
    );
};

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isGuest, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-600 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-700 hover:text-emerald-700 dark:hover:text-white'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'bg-emerald-600 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-700'
    }`;

  const desktopNavLinks = (
    <>
      <NavLink to="/" className={navLinkClass}>Home</NavLink>
      <NavLink to="/categories" className={navLinkClass}>Categories</NavLink>
      <NavLink to="/favorites" className={navLinkClass}>Favorites</NavLink>
      <NavLink to="/about" className={navLinkClass}>About</NavLink>
    </>
  );

  const mobileNavLinks = (
     <>
      <NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu}>Home</NavLink>
      <NavLink to="/categories" className={mobileNavLinkClass} onClick={closeMenu}>Categories</NavLink>
      <NavLink to="/favorites" className={mobileNavLinkClass} onClick={closeMenu}>Favorites</NavLink>
      <NavLink to="/about" className={mobileNavLinkClass} onClick={closeMenu}>About</NavLink>
    </>
  );
  
  const mobileAuthLinks = user ? (
    <>
      <NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMenu}>Profile</NavLink>
      <button onClick={() => { logout(); closeMenu(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-700">Logout</button>
    </>
  ) : (
    <>
      <NavLink to="/login" className={mobileNavLinkClass} onClick={closeMenu}>Login</NavLink>
      <NavLink to="/signup" className={mobileNavLinkClass} onClick={closeMenu}>Sign Up</NavLink>
    </>
  );

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2 text-emerald-600">
              <ChefHatIcon className="h-8 w-8" />
              <span className="text-xl font-bold">MealMate</span>
            </NavLink>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {desktopNavLinks}
          </nav>
          
          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isGuest && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Guest Mode</span>}

            {user ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Open user menu"
                >
                  <UserCircleIcon className="h-7 w-7" />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400" id="user-menu-email-label">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" aria-labelledby="user-menu-email-label">{user.email}</p>
                      </div>
                      <NavLink to="/profile" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</NavLink>
                      <button onClick={() => { logout(); closeAllMenus(); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                <NavLink to="/signup" className="px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Sign Up</NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-emerald-100 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {mobileNavLinks}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 space-y-1">
              {isGuest && <span className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-400">Guest Mode</span>}
              {mobileAuthLinks}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};