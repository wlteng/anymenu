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
import CreateStores from './components/CreateStores';
import StoreSelector from './components/foodmenu/StoreSelector';
import LoveFoodPage from './pages/LoveFoodPage';
import ShopForm from './pages/ShopForm';
import Profile from './pages/Profile';
import CompanyInfo from './components/CompanyInfo';
import RecentShopsPage from './pages/RecentShopsPage';
import MyRewardPage from './pages/MyRewardPage';

// Reward Management Imports
import ShopRewardPage from './pages/ShopRewardPage';
import RewardScanner from './components/ShopReward/RewardScanner';
import CustomerList from './components/ShopReward/CustomerList';
import CreateReward from './components/ShopReward/CreateReward';

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
            <Route path="/" element={<ShopMenu />} /> <Route path="/:username" element={<MenuPreview />} />

            {/* Profile */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Shop Management */}
            <Route path="/my-shops" element={<PrivateRoute><ShopManager /></PrivateRoute>} />
            <Route path="/my-shops/:username/edit" element={<PrivateRoute><ShopForm /></PrivateRoute>} />
            <Route path="/my-shops/:username/company-info" element={<PrivateRoute><CompanyInfo /></PrivateRoute>} />
            <Route path="/my-shops/:username/stores" element={<PrivateRoute><CreateStores /></PrivateRoute>} />

            {/* Menu Management */}
            <Route path="/menu/:username/store-select" element={<PrivateRoute><StoreSelector /></PrivateRoute>} />
            <Route path="/menu/:username" element={<PrivateRoute><ShopMenuCreator /></PrivateRoute>} />
            <Route path="/menu/:username/:category/add" element={<PrivateRoute><ShopMenuCreateForm /></PrivateRoute>} />
            <Route path="/menu/:username/:category/:itemId" element={<PrivateRoute><ShopMenuCreateForm /></PrivateRoute>} />

            {/* Reward Management */}
            
            <Route path="/my-shops/:username/rewards" element={<PrivateRoute><ShopRewardPage /></PrivateRoute>} />
            <Route path="/my-shops/:username/rewards/create" element={<PrivateRoute><CreateReward /></PrivateRoute>} />
            <Route path="/my-shops/:username/rewards/edit/:rewardId" element={<PrivateRoute><CreateReward /></PrivateRoute>} />
            <Route path="/my-shops/:username/rewards/scan" element={<PrivateRoute><RewardScanner /></PrivateRoute>} />
            <Route path="/my-shops/:username/rewards/:rewardId/customers" element={<PrivateRoute><CustomerList /></PrivateRoute>} />

            {/* User Features */}
            <Route path="/love-food" element={<PrivateRoute><LoveFoodPage /></PrivateRoute>} />
            <Route path="/recent-visits" element={<PrivateRoute><RecentShopsPage /></PrivateRoute>} />
            <Route path="/my-rewards" element={<PrivateRoute><MyRewardPage /></PrivateRoute>} />
            
            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastContextProvider>
    </AuthProvider>
  );
}

export default App;