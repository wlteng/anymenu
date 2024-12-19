import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContextProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ShopMenu from './components/ShopMenu';
import MenuPreview from './components/foodmenu/MenuPreview';
import ShopManager from './components/foodmenu/ShopManager';
import ShopMenuCreator from './components/foodmenu/ShopMenuCreator';
import ShopMenuCreateForm from './components/foodmenu/ShopMenuCreateForm';
import LoveFoodPage from './pages/LoveFoodPage';
import ShopForm from './pages/ShopForm';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <ToastContextProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<ShopMenu />} />
            <Route path="/:username" element={<MenuPreview />} />

            {/* Private routes */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-shops" 
              element={
                <PrivateRoute>
                  <ShopManager />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-shops/:username/edit" 
              element={
                <PrivateRoute>
                  <ShopForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/menu/:username" 
              element={
                <PrivateRoute>
                  <ShopMenuCreator />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/menu/:username/:category/add" 
              element={
                <PrivateRoute>
                  <ShopMenuCreateForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/menu/:username/:category/:itemId" 
              element={
                <PrivateRoute>
                  <ShopMenuCreateForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <ShopMenu />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/love-food" 
              element={
                <PrivateRoute>
                  <LoveFoodPage />
                </PrivateRoute>
              } 
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastContextProvider>
    </AuthProvider>
  );
}

export default App;