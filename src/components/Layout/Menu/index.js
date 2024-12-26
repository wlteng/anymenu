import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Menu as MenuIcon } from 'lucide-react';
import ShopInfoMenu from './ShopInfoMenu';
import ShopInfoMenuSample from './ShopInfoMenuSample';
import UserMenu from './UserMenu';

const Menu = ({ preview = false, shop = null, isDarkHeader = false }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const isHomePage = location.pathname === '/';
  const isShopPage = /^\/[^/]+$/.test(location.pathname) && 
                    !['/my-shops', '/profile', '/love-food'].includes(location.pathname);
                    
  const renderMenu = () => {
    if (isHomePage) {
      return <ShopInfoMenuSample isOpen={isOpen} onClose={() => setIsOpen(false)} />;
    }
    
    if (isShopPage) {
      return <ShopInfoMenu isOpen={isOpen} onClose={() => setIsOpen(false)} shop={shop} user={user} />;
    }

    return <UserMenu isOpen={isOpen} onClose={() => setIsOpen(false)} user={user} />;
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