import React, { useState, useEffect, useMemo } from 'react';
import { ChefHat, Flame, Star, Store } from 'lucide-react';
import { getStores } from '../../firebase/utils';

export const useTemplateLogic = ({ menuItems = [], shop = null }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStore, setSelectedStore] = useState('All');
  const [stores, setStores] = useState([]);

  // Load stores if shop type is Food Court
  useEffect(() => {
    const loadStores = async () => {
      if (shop?.shopType === 'Food Court') {
        try {
          const storesData = await getStores(shop.id);
          setStores(storesData);
        } catch (error) {
          console.error('Error loading stores:', error);
        }
      }
    };
    loadStores();
  }, [shop]);

  // Filter items by store first
  const storeFilteredItems = useMemo(() => {
    if (!shop?.shopType === 'Food Court' || selectedStore === 'All') {
      return menuItems;
    }
    return menuItems.filter(item => item.storeId === selectedStore);
  }, [menuItems, selectedStore, shop?.shopType]);

  // Get available categories for current store selection
  const availableCategories = useMemo(() => {
    const uniqueCategories = new Set(['All']);
    
    storeFilteredItems.forEach(item => {
      if (item.category) {
        uniqueCategories.add(item.category);
      }
      if (item.isChefRecommended) {
        uniqueCategories.add('chefs');
      }
      if (item.isSpicy) {
        uniqueCategories.add('spicy');
      }
    });

    return Array.from(uniqueCategories);
  }, [storeFilteredItems]);

  // Create categories array based on available categories
  const categories = useMemo(() => {
    const categoryArray = availableCategories.map(category => {
      if (category === 'chefs') {
        return { id: 'chefs', icon: <ChefHat className="w-4 h-4" /> };
      }
      if (category === 'spicy') {
        return { id: 'spicy', icon: <Flame className="w-4 h-4" /> };
      }
      return category;
    });

    // Reset selected category if it's no longer available
    if (!availableCategories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }

    return categoryArray;
  }, [availableCategories, selectedCategory]);

  const showItemCodes = shop?.showItemCodes ?? false;

  const getCategoryStyle = (category) => {
    const isString = typeof category === 'string';
    const categoryId = isString ? category : category.id;
    const isSelected = selectedCategory === categoryId;

    if (isString) {
      return isSelected 
        ? 'bg-gray-800 text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }

    const styles = {
      chefs: {
        default: 'bg-yellow-100 text-yellow-600',
        active: 'bg-yellow-500 text-white'
      },
      spicy: {
        default: 'bg-red-100 text-red-600',
        active: 'bg-red-500 text-white'
      }
    };

    return isSelected ? styles[categoryId].active : styles[categoryId].default;
  };

  // Filter items by category after store filtering
  const filteredItems = useMemo(() => {
    return storeFilteredItems.filter(item => {
      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'chefs') return item.isChefRecommended;
      if (selectedCategory === 'spicy') return item.isSpicy;
      return item.category === selectedCategory;
    });
  }, [storeFilteredItems, selectedCategory]);

  const renderItemCode = (itemCode) => {
    if (!showItemCodes || !itemCode) return null;

    return (
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
        {itemCode}
      </div>
    );
  };

  // Common store filter navigation - only show for food courts
  const StoreNavigation = () => {
    if (shop?.shopType !== 'Food Court' || stores.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <div className="flex space-x-4 px-4">
          <button
            key="all-stores"
            onClick={() => setSelectedStore('All')}
            className={`
              px-4 py-2 
              rounded-full 
              whitespace-nowrap 
              text-sm 
              flex 
              items-center 
              gap-1
              transition-colors
              duration-200
              ${selectedStore === 'All'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <Store className="w-4 h-4" />
            All Stores
          </button>
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store.id)}
              className={`
                px-4 py-2 
                rounded-full 
                whitespace-nowrap 
                text-sm 
                flex 
                items-center 
                gap-1
                transition-colors
                duration-200
                ${selectedStore === store.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Store className="w-4 h-4" />
              {store.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Common category navigation - shows categories based on current store selection
  const CategoryNavigation = () => (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 px-4 pb-4">
        {categories.map((category) => {
          const isString = typeof category === 'string';
          const categoryId = isString ? category : category.id;
          
          return (
            <button
              key={categoryId}
              onClick={() => setSelectedCategory(categoryId)}
              className={`
                px-4 py-2 
                rounded-full 
                whitespace-nowrap 
                text-sm 
                flex 
                items-center 
                gap-1
                transition-colors
                duration-200
                ${getCategoryStyle(category)}
              `}
            >
              {isString ? category : category.icon}
            </button>
          );
        })}
      </div>
    </div>
  );

  return {
    selectedCategory,
    selectedItem,
    setSelectedItem,
    selectedStore,
    stores,
    categories,
    showItemCodes,
    filteredItems,
    getCategoryStyle,
    renderItemCode,
    StoreNavigation,
    CategoryNavigation
  };
};