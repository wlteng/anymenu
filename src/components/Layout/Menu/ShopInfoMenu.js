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
          <UserMenu 
            onNavigate={(path, options) => {
              navigate(path, options);
              onClose();
            }}
            user={user}
          />
          <RecentShops />
          <LoveFood /> {/* Always show LoveFood in user tab */}
        </>
      ) : (
        <NonLogin onSuccess={onClose} />
      )}
    </div>
  );

  const renderShopContent = () => (
    <div className="flex-1 overflow-auto">
      <ShopInfo shop={shop} isSample={isHomePage} />
      <LoveFood shopId={shop?.id} /> {/* Show shop-specific favorites */}
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