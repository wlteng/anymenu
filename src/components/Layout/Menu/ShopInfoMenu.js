import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import MenuLayout from './MenuLayout';
import MenuHeader from './MenuHeader';
import ShopInfo from './ShopInfo';
import NonLogin from './NonLogin';
import LoveFood from './LoveFood';
import UserMenu from './UserMenu';
import RecentShops from './RecentShops';
import { getUserRecentVisits, getShopById } from '../../../firebase/utils';

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
  const [lastVisitedShop, setLastVisitedShop] = useState(null);

  useEffect(() => {
    const loadLastVisitedShop = async () => {
      if (!user) return;
      
      try {
        const visits = await getUserRecentVisits(user.uid);
        if (visits && visits.length > 0) {
          // Get the most recent visit
          const latestVisit = visits.reduce((latest, current) => {
            return latest.visitedAt.seconds > current.visitedAt.seconds ? latest : current;
          });
          
          // Get fresh shop data
          const shopData = await getShopById(latestVisit.shopId);
          if (shopData) {
            setLastVisitedShop({
              ...shopData,
              visitedAt: latestVisit.visitedAt
            });
          }
        }
      } catch (error) {
        console.error('Error loading last visited shop:', error);
      }
    };

    loadLastVisitedShop();
  }, [user]);

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
          {!isHomePage && (
            <LoveFood 
              shopId={shop?.id} 
              isSample={isHomePage}
              showAllFavorites={false}
            />
          )}
        </>
      ) : (
        <NonLogin onSuccess={onClose} />
      )}
    </div>
  );

  const renderShopContent = () => (
    <div className="flex-1 overflow-auto">
      <ShopInfo shop={lastVisitedShop || shop} isSample={isHomePage} />
      <LoveFood 
        shopId={lastVisitedShop?.id || shop?.id} 
        isSample={isHomePage}
        showAllFavorites={false}
      />
    </div>
  );

  const header = (
    <MenuHeader
      onClose={onClose}
      shop={lastVisitedShop || shop}
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isHomePage={isHomePage}
      onShopClick={() => {
        if (lastVisitedShop?.username) {
          window.location.href = `/${lastVisitedShop.username}`;
          onClose();
        }
      }}
    />
  );

  return (
    <MenuLayout isOpen={isOpen} onClose={onClose} header={header}>
      {activeTab === 'shop' ? renderShopContent() : renderUserContent()}
    </MenuLayout>
  );
};

export default ShopInfoMenu;