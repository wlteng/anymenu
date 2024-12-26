import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Menu as MenuIcon } from 'lucide-react';
import ShopInfoMenu from './ShopInfoMenu';

const Menu = ({ preview = false, shop = null, isDarkHeader = false }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const isHomePage = location.pathname === '/';
  const isShopPage = /^\/[^/]+$/.test(location.pathname) && 
                    !['/my-shops', '/profile', '/love-food'].includes(location.pathname);
                    
  const renderMenu = () => {
    // Homepage - show sample data
    if (isHomePage) {
      return (
        <ShopInfoMenu 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          isHomePage={true}
          defaultTab="shop"
        />
      );
    }
    
    // Shop page - show shop data
    if (isShopPage) {
      return (
        <ShopInfoMenu 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          shop={shop} 
          user={user}
          defaultTab="shop"
        />
      );
    }

    // Other pages - show user menu
    return (
      <ShopInfoMenu 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        user={user}
        defaultTab="user"
      />
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 ${isDarkHeader ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} rounded-full transition-colors relative z-[51]`}
        aria-label="Menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {renderMenu()}
    </>
  );
};

export default Menu;