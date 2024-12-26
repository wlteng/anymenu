import React from 'react';
import { X, User } from 'lucide-react';

const MenuHeader = ({ onClose, shop, user, activeTab, setActiveTab, isHomePage }) => {
  const TabButton = ({ type, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      }`}
    >
      {type === 'shop' ? (
        isHomePage ? (
          // Show app logo for homepage
          <img 
            src="/img/logo/applogo.png"
            alt="Sample Restaurant"
            className="w-7 h-7 object-cover rounded"
          />
        ) : shop?.squareLogo ? (
          <img 
            src={shop.squareLogo}
            alt={shop.name}
            className="w-7 h-7 object-cover rounded"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/img/logo/applogo.png';
            }}
          />
        ) : (
          <div className="w-7 h-7 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-sm text-gray-600">{shop?.name?.charAt(0) || 'S'}</span>
          </div>
        )
      ) : user?.photoURL ? (
        <img 
          src={user.photoURL}
          alt={user.displayName || 'User'}
          className="w-7 h-7 rounded-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
          }}
        />
      ) : (
        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </button>
  );

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <TabButton 
            type="shop"
            isActive={activeTab === 'shop'}
            onClick={() => setActiveTab('shop')}
          />
          <TabButton 
            type="user"
            isActive={activeTab === 'user'}
            onClick={() => setActiveTab('user')}
          />
        </div>
      </div>
      <button 
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MenuHeader;