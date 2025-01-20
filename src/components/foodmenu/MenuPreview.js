import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/loading';
import { trackShopVisit } from '../../firebase/utils';
import Template1 from '../templates/Template1';
import Template2 from '../templates/Template2';
import Template3 from '../templates/Template3';
import Header from '../Layout/Header';
import SeoMeta from '../common/SeoMeta';
import ShopPwa from '../common/ShopPwa';

const MenuPreview = () => {
  const { username } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [orderedItems, setOrderedItems] = useState({});
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  
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

        // Set ordered categories from shop data
        setOrderedCategories(shopData.categoryOrder || shopData.categories);

        // Track shop visit if user is logged in
        if (user) {
          try {
            await trackShopVisit(user.uid, shopData);
          } catch (error) {
            console.error('Error tracking shop visit:', error);
          }
        }
        
        if (shopData.defaultTemplate) {
          setSelectedTemplate(shopData.defaultTemplate);
        }

        // Load menu items
        const menuItemsRef = collection(db, 'menuItems');
        const menuQuery = query(menuItemsRef, where('shopId', '==', shopDoc.id));
        const menuSnapshot = await getDocs(menuQuery);

        const items = menuSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Order the items according to saved order
        const orderedMenuItems = {};
        if (shopData.itemOrder) {
          // Use saved item order
          shopData.categories.forEach(category => {
            const categoryOrder = shopData.itemOrder[category] || [];
            const orderedCategoryItems = [
              // First add items that are in the order
              ...categoryOrder
                .map(id => items.find(item => item.id === id))
                .filter(item => item), // Remove any null items
              // Then add any items that aren't in the order
              ...items.filter(item => 
                item.category === category && 
                !categoryOrder.includes(item.id)
              )
            ];
            orderedMenuItems[category] = orderedCategoryItems;
          });
        } else {
          // Default ordering by category
          shopData.categories.forEach(category => {
            orderedMenuItems[category] = items.filter(item => item.category === category);
          });
        }

        setOrderedItems(orderedMenuItems);
        setMenuItems(items);

      } catch (error) {
        console.error('Error loading menu:', error);
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    loadShopAndMenu();
  }, [username, user]);

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
      orderedItems,
      orderedCategories,
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
      <SeoMeta shop={shop} />
      <Header 
        shop={shop}
        onTemplateChange={setSelectedTemplate}
        currentTemplate={selectedTemplate}
        isDarkHeader={shop?.isDarkHeader || false}
      />
      {renderTemplate()}
      {shop && <ShopPwa shop={shop} />}
    </div>
  );
};

export default MenuPreview;