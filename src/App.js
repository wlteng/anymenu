import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContextProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Page & Component Imports
import ShopMenu from './components/ShopMenu';
import MenuPreview from './components/foodmenu/MenuPreview';
import ShopManager from './components/foodmenu/ShopManager';
import ShopMenuCreator from './components/foodmenu/ShopMenuCreator';
import ShopMenuCreateForm from './components/foodmenu/ShopMenuCreateForm';
import CreateStores from './components/foodmenu/CreateStores';
import StoreSelector from './components/foodmenu/StoreSelector';
import LoveFoodPage from './pages/LoveFoodPage';
import ShopForm from './pages/ShopForm';
import Profile from './pages/Profile';
import CompanyInfo from './components/foodmenu/CompanyInfo';
import RecentShopsPage from './pages/RecentShopsPage';

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
            {/* Public Routes */}
            <Route path="/" element={<ShopMenu />} />
            <Route path="/:username" element={<MenuPreview />} />

            {/* Private Routes */}
            {/* Profile */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />

            {/* Shop Management */}
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

            {/* Company Info */}
            <Route 
              path="/my-shops/:username/company-info" 
              element={
                <PrivateRoute>
                  <CompanyInfo />
                </PrivateRoute>
              } 
            />

            {/* Store Management */}
            <Route 
              path="/my-shops/:username/stores" 
              element={
                <PrivateRoute>
                  <CreateStores />
                </PrivateRoute>
              } 
            />

            {/* Menu Management */}
            <Route 
              path="/menu/:username/store-select" 
              element={
                <PrivateRoute>
                  <StoreSelector />
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

            {/* Additional Features */}
            <Route 
              path="/love-food" 
              element={
                <PrivateRoute>
                  <LoveFoodPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/recent-visits" 
              element={
                <PrivateRoute>
                  <RecentShopsPage />
                </PrivateRoute>
              } 
            />
            
            {/* Catch All - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastContextProvider>
    </AuthProvider>
  );
}

export default App;