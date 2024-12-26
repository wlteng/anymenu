import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import MenuLayout from './MenuLayout';
import MenuHeader from './MenuHeader';
import ShopInfo from './ShopInfo';
import NonLogin from './NonLogin';
import LoveFood from './LoveFood';
import UserMenu from './UserMenu';
import RecentShops from './RecentShops';

const ShopInfoMenu = ({ 
  isOpen, 
  onClose, 
  shop, 
  isHomePage = false,
  defaultTab = 'shop'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);

  const renderUserContent = () => (
    <div className="flex-1 overflow-auto">
      {user ? (
        <>
          <div className="p-4 border-b">
            <button 
              onClick={() => {
                navigate('/profile');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {(user.displayName || 'U').charAt(0)}
                </div>
              )}
              <div className="flex-1 text-left">
                <div className="font-medium text-base">{user.displayName || 'User'}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </button>
          </div>
          <UserMenu 
            onNavigate={(path) => {
              navigate(path);
              onClose();
            }}
            user={user}
          />
          <RecentShops />
          <LoveFood />
        </>
      ) : (
        <NonLogin onSuccess={onClose} />
      )}
    </div>
  );

  const renderShopContent = () => (
    <div className="flex-1 overflow-auto">
      <ShopInfo shop={shop} isSample={isHomePage} />
      <LoveFood shopId={shop?.id} />
    </div>
  );

  const header = (
    <MenuHeader
      onClose={onClose}
      shop={shop}
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isHomePage={isHomePage}
    />
  );

  return (
    <MenuLayout isOpen={isOpen} onClose={onClose} header={header}>
      {activeTab === 'shop' ? renderShopContent() : renderUserContent()}
    </MenuLayout>
  );
};

export default ShopInfoMenu;