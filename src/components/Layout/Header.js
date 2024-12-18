import React, { useState } from 'react';
import { Layout } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Menu from './Menu';

const Header = ({ onTemplateChange, currentTemplate, shop, pageTitle }) => {
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

  const getHeaderTitle = () => {
    if (pageTitle) {
      return pageTitle;
    }

    const path = location.pathname;
    
    if (path === '/my-shops') {
      return 'My Shops';
    }

    if (path.startsWith('/menu/')) {
      return 'Create Menu';
    }
    
    if (shop?.useTextLogo) {
      return shop.textLogo || shop.name;
    }
    
    return null;
  };

  const renderCenterContent = () => {
    const title = getHeaderTitle();
    const isSampleMenu = location.pathname === '/';
    
    if (title) {
      return (
        <span className="text-xl font-bold">
          {title}
        </span>
      );
    }
    
    // For sample menu page, use static logo
    if (isSampleMenu) {
      return (
        <img 
          src="/img/logo/logo.png"
          alt="Sample Menu"
          className="h-8 w-auto cursor-pointer"
        />
      );
    }
    
    // For actual shops with logo
    if (shop?.rectangleLogo) {
      return (
        <img 
          src={shop.rectangleLogo} 
          alt={shop.name}
          className="h-8 w-auto cursor-pointer"
        />
      );
    }

    return (
      <span className="text-xl font-bold">
        Sample Menu
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center px-3 md:px-4 lg:px-4 py-2">
        <div className="flex items-center w-1/4">
          <Menu 
            onTemplateChange={onTemplateChange} 
            currentTemplate={currentTemplate} 
            shop={shop} 
          />
        </div>

        <div className="flex items-center justify-center w-2/4">
          {renderCenterContent()}
        </div>

        <div className="w-1/4 flex justify-end">
          {shouldShowLayoutIcon() && onTemplateChange ? (
            <div className="relative">
              <button 
                className="p-2 hover:bg-gray-100 rounded-full"
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
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;