import React, { useState } from 'react';
import { Layout } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Menu from './Menu';

const Header = ({ onTemplateChange, currentTemplate, shop, pageTitle, isDarkHeader }) => {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const location = useLocation();

  const templates = [
    { id: 'template1', label: '1 Column' },
    { id: 'template2', label: '2 Columns' },
    { id: 'template3', label: '3 Columns' }
  ];

  const shouldShowLayoutIcon = () => {
    const path = location.pathname;
    return path === '/' || /^\/[^/]+$/.test(path);
  };

  const renderCenterContent = () => {
    if (pageTitle) {
      return (
        <span className={`text-xl font-bold ${isDarkHeader ? 'text-white' : 'text-gray-900'}`}>
          {pageTitle}
        </span>
      );
    }

    // Home page
    if (location.pathname === '/') {
      return (
        <img 
          src="/img/logo/logo.png"
          alt="Sample Menu"
          className="h-8 w-auto cursor-pointer"
        />
      );
    }

    // Shop page with logo configurations
    if (shop) {
      if (shop.useTextLogo && shop.textLogo) {
        return (
          <span className={`text-xl font-bold ${isDarkHeader ? 'text-white' : 'text-gray-900'}`}>
            {shop.textLogo}
          </span>
        );
      }
      
      if (shop.rectangleLogo) {
        return (
          <img 
            src={shop.rectangleLogo} 
            alt={shop.name}
            className="h-8 w-auto cursor-pointer"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/img/logo/logo.png';
            }}
          />
        );
      }

      return (
        <span className={`text-xl font-bold ${isDarkHeader ? 'text-white' : 'text-gray-900'}`}>
          {shop.name}
        </span>
      );
    }

    return null;
  };

  return (
    <header className={`${isDarkHeader ? 'bg-gray-900' : 'bg-white'} shadow-sm transition-colors duration-200`}>
      <div className="flex items-center px-3 md:px-4 lg:px-4 py-2">
        <div className="flex items-center w-1/4">
          <Menu 
            onTemplateChange={onTemplateChange} 
            currentTemplate={currentTemplate} 
            shop={shop}
            isDarkHeader={isDarkHeader}
          />
        </div>

        <div className="flex items-center justify-center w-2/4">
          {renderCenterContent()}
        </div>

        <div className="w-1/4 flex justify-end">
          {shouldShowLayoutIcon() && onTemplateChange && (
            <div className="relative">
              <button 
                className={`p-2 ${isDarkHeader ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} rounded-full transition-colors`}
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              >
                <Layout className="w-6 h-6" />
              </button>

              {showLayoutMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowLayoutMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          onTemplateChange(template.id);
                          setShowLayoutMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          currentTemplate === template.id ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;