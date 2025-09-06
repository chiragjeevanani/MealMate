import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { RecipeDetail } from './pages/RecipeDetail';
import { Favorites } from './pages/Favorites';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const AppLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen font-sans">
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest, loading } = useAuth();
  if (loading) {
    return <div className="text-center p-8">Loading...</div>; // Or a spinner component
  }
  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="categories" element={<Categories />} />
                <Route path="recipe/:id" element={<RecipeDetail />} />
                <Route 
                  path="favorites" 
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route path="about" element={<About />} />
              </Route>
            </Routes>
          </HashRouter>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;