import React, { useState, useEffect, useMemo } from 'react';
import { Store, Tag, Clock, ChefHat, Flame, Star } from 'lucide-react';
import { getStores } from '../../firebase/utils';
import { foodSpecialties } from '../../data/general';

// Map icons to their Lucide components
const SPECIALTY_ICONS = {
  chefRecommended: ChefHat,
  spicy: Flame,
  popular: Star
};

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

  const showItemCodes = shop?.showItemCodes ?? false;

  // Get store name helper
  const getStoreName = (item) => {
    if (!stores.length || !item.storeId) return null;
    const store = stores.find(s => s.id === item.storeId);
    return store?.name;
  };

  // Filter items by both category and store
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = 
        selectedCategory === 'All' ||
        foodSpecialties.some(specialty => 
          selectedCategory === specialty.id && item[specialty.property]
        ) ||
        item.category === selectedCategory;

      const matchesStore = 
        selectedStore === 'All' ||
        item.storeId === selectedStore;

      return matchesCategory && matchesStore;
    });
  }, [menuItems, selectedCategory, selectedStore]);

  // Shared rendering functions
  const renderItemCode = (itemCode) => {
    if (!showItemCodes || !itemCode) return null;

    return (
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
        {itemCode}
      </div>
    );
  };

  const renderItemFooter = (item) => {
    const storeName = getStoreName(item);
    const hasPreparationTime = item.preparationTime && item.preparationTime.trim() !== '';
    const hasFooterContent = hasPreparationTime || storeName;

    if (!hasFooterContent) return null;

    return (
      <div className="flex items-center gap-3 text-gray-500">
        {hasPreparationTime && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{item.preparationTime} mins</span>
          </div>
        )}
        {storeName && (
          <div className="flex items-center">
            <Store className="w-4 h-4 mr-1" />
            <span className="text-sm">{storeName}</span>
          </div>
        )}
      </div>
    );
  };

  const renderPriceTag = (item, size = 'normal') => {
    const sizeClasses = {
      small: {
        base: 'text-xs px-2 py-0.5',
        icon: 'w-3 h-3'
      },
      normal: {
        base: 'text-sm px-3 py-1',
        icon: 'w-4 h-4'
      },
      large: {
        base: 'text-base px-4 py-2',
        icon: 'w-5 h-5'
      }
    };

    const classes = sizeClasses[size] || sizeClasses.normal;

    return item.promotionalPrice ? (
      <div className={`bg-green-50 rounded-full ${classes.base} font-semibold text-green-600 shadow-md flex items-center gap-1`}>
        <Tag className={classes.icon} />
        ${item.promotionalPrice}
      </div>
    ) : (
      <div className={`bg-white rounded-full ${classes.base} font-semibold shadow-md`}>
        ${item.price}
      </div>
    );
  };

  const renderBadges = (item, size = 'normal') => {
    const sizeClasses = {
      small: 'w-3 h-3 p-0.5',
      normal: 'w-4 h-4 p-1',
      large: 'w-5 h-5 p-1.5'
    };

    const badgeSize = sizeClasses[size] || sizeClasses.normal;

    return (
      <div className="flex gap-1">
        {foodSpecialties.map(specialty => {
          const Icon = SPECIALTY_ICONS[specialty.id];
          const isActive = item[specialty.property];
          
          if (!isActive) return null;
          
          return (
            <div key={specialty.id} className={`${specialty.bgColor} rounded-full shadow-md`}>
              <Icon className={`${badgeSize} text-white`} />
            </div>
          );
        })}
      </div>
    );
  };

  // Navigation Components
  const StoreNavigation = () => {
    if (shop?.shopType !== 'Food Court' || stores.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <div className="flex space-x-4 px-4 py-2">
          <button
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

  const CategoryNavigation = () => {
    const categories = [
      'All',
      ...(shop?.categories || []),
      ...foodSpecialties.map(specialty => ({
        id: specialty.id,
        icon: React.createElement(SPECIALTY_ICONS[specialty.id], { className: "w-4 h-4" }),
        styles: specialty
      }))
    ];

    const getCategoryStyle = (category) => {
      const isString = typeof category === 'string';
      const categoryId = isString ? category : category.id;
      const isSelected = selectedCategory === categoryId;
  
      if (isString) {
        return isSelected 
          ? 'bg-gray-800 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
      }
  
      const { styles } = category;
      return isSelected ? `${styles.bgColor} text-white` : `${styles.lightBg} ${styles.textColor}`;
    };

    return (
      <div className="overflow-x-auto">
        <div className="flex space-x-4 px-4 py-2">
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
  };

  return {
    // State
    selectedCategory,
    selectedItem,
    setSelectedItem,
    selectedStore,
    stores,
    showItemCodes,
    filteredItems,

    // Helper functions
    getStoreName,

    // Rendering functions
    renderItemCode,
    renderItemFooter,
    renderPriceTag,
    renderBadges,

    // Navigation components
    StoreNavigation,
    CategoryNavigation
  };
};