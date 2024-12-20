import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { LoadingSpinner } from '../ui/loading';
import Template1 from '../templates/Template1';
import Template2 from '../templates/Template2';
import Template3 from '../templates/Template3';
import Header from '../Layout/Header';

const MenuPreview = () => {
  const { username } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  
  // Get isDarkHeader from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const isDarkHeader = searchParams.get('darkHeader') === 'true';

  useEffect(() => {
    const loadShopAndMenu = async () => {
      try {
        setLoading(true);
        const shopsRef = collection(db, 'shops');
        const shopQuery = query(shopsRef, where('username', '==', username));
        const shopSnapshot = await getDocs(shopQuery);
        
        if (shopSnapshot.empty) {
          setError('Shop not found');
          return;
        }

        const shopDoc = shopSnapshot.docs[0];
        const shopData = { id: shopDoc.id, ...shopDoc.data() };
        setShop(shopData);
        
        if (shopData.defaultTemplate) {
          setSelectedTemplate(shopData.defaultTemplate);
        }

        const menuItemsRef = collection(db, 'menuItems');
        const menuQuery = query(menuItemsRef, where('shopId', '==', shopDoc.id));
        const menuSnapshot = await getDocs(menuQuery);

        const items = menuSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
      } catch (error) {
        console.error('Error loading menu:', error);
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    loadShopAndMenu();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!shop) return null;

  const renderTemplate = () => {
    const props = { 
      menuItems,
      shop,
      isPreview: true
    };

    switch (selectedTemplate) {
      case 'template2':
        return <Template2 {...props} />;
      case 'template3':
        return <Template3 {...props} />;
      default:
        return <Template1 {...props} />;
    }
  };

  return (
    
        <div className="min-h-screen bg-gray-50">
          <Header 
            shop={shop}
            onTemplateChange={setSelectedTemplate}
            currentTemplate={selectedTemplate}
            isDarkHeader={shop?.isDarkHeader || false}
          />
          {renderTemplate()}
        </div>
  );
};

export default MenuPreview;