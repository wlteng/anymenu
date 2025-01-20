// TemplateCore.js
import React, { useState, useEffect, useMemo } from 'react';
import { Store, Tag, Clock, ChefHat, Flame, Star, AlertCircle } from 'lucide-react';
import { getStores } from '../../firebase/utils';
import { foodSpecialties } from '../../data/general';

const SPECIALTY_ICONS = {
  ChefHat: ChefHat,
  Flame: Flame,
  Star: Star,
  AlertCircle: AlertCircle
};

const useTemplateLogic = ({ menuItems = [], shop = null, orderedCategories = null, orderedItems = null }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedVariant, setSelectedVariant] = useState({});
  const [stores, setStores] = useState([]);

  const categories = orderedCategories || shop?.categories || [];

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

  const formatPrice = (price) => {
    if (!price) return '';
    const symbol = shop?.currencySymbol || '$';
    
    if (shop?.currencyCode === 'IDR') {
      return `${symbol}${parseInt(price).toLocaleString('id-ID')}`;
    }
    return `${symbol}${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getStoreName = (item) => {
    if (!stores.length || !item.storeId) return null;
    const store = stores.find(s => s.id === item.storeId);
    return store?.name;
  };

  const getOrderedItemsByCategory = (category) => {
    if (!orderedItems || !orderedItems[category]) {
      return menuItems.filter(item => item.category === category);
    }
    return orderedItems[category];
  };

  const getSelectedVariantPrice = (item) => {
    if (!selectedVariant[item.id] || !item.variants) return item;
    const selectedVariantData = item.variants.find(v => v.id === selectedVariant[item.id]);
    if (!selectedVariantData) return item;
    
    return {
      ...item,
      price: selectedVariantData.price,
      promotionalPrice: selectedVariantData.promotionalPrice
    };
  };

  const filteredItems = useMemo(() => {
    let items = [];

    if (selectedCategory === 'All') {
      if (orderedCategories && orderedItems) {
        orderedCategories.forEach(category => {
          items = [...items, ...getOrderedItemsByCategory(category)];
        });
      } else {
        items = menuItems;
      }
    } else if (foodSpecialties.some(specialty => selectedCategory === specialty.id)) {
      items = menuItems.filter(item => 
        foodSpecialties.some(specialty => 
          selectedCategory === specialty.id && item[specialty.property]
        )
      );
    } else {
      items = getOrderedItemsByCategory(selectedCategory);
    }

    return items.filter(item => 
      selectedStore === 'All' || item.storeId === selectedStore
    );
  }, [menuItems, selectedCategory, selectedStore, orderedItems, orderedCategories]);

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
    const selectedVariant = getSelectedVariantPrice(item);
    const displayPrice = selectedVariant || item;

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

    if (displayPrice.promotionalPrice) {
      return (
        <div className={`bg-green-50 rounded-full ${classes.base} font-semibold text-green-600 shadow-md flex items-center gap-1`}>
          <Tag className={classes.icon} />
          {formatPrice(displayPrice.promotionalPrice)}
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-full ${classes.base} font-semibold shadow-md`}>
        {formatPrice(displayPrice.price)}
      </div>
    );
  };

  const renderVariantBadges = (item, onVariantClick) => {
    if (!item.variants?.length) return null;

    return (
      <div className="flex gap-2">
        {item.variants.map((variant) => (
          <button
            key={variant.id}
            onClick={(e) => {
              e.stopPropagation();
              onVariantClick(item.id, variant.id);
            }}
            className={`
              px-3 py-1 
              text-sm 
              border 
              rounded-lg
              transition-colors
              ${selectedVariant[item.id] === variant.id
                ? 'border-blue-200 bg-blue-50 text-blue-600'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {variant.label}
          </button>
        ))}
      </div>
    );
  };

  const renderCompactVariants = (item) => {
    if (!item.variants?.length) return null;
    
    return (
      <div className="text-sm border rounded-lg bg-gray-50 text-gray-600 px-3 py-1">
        <select
          value={selectedVariant[item.id] || ''}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedVariant(prev => ({
              ...prev,
              [item.id]: e.target.value || null
            }));
          }}
          className="bg-transparent border-none focus:ring-0 cursor-pointer pr-6"
        >
          <option value="">Size</option>
          {item.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderBadges = (item, size = 'normal') => {
    const sizeClasses = {
      small: 'w-3 h-3',
      normal: 'w-3 h-3',
      large: 'w-5 h-5'
    };

    const badgeSize = sizeClasses[size] || sizeClasses.normal;

    return (
      <div className="flex gap-1">
        {foodSpecialties.map(specialty => {
          if (!SPECIALTY_ICONS[specialty.icon]) return null;
          const Icon = SPECIALTY_ICONS[specialty.icon];
          const isActive = item[specialty.property];
          
          if (!isActive) return null;
          
          return (
            <div 
              key={specialty.id} 
              className={`${specialty.bgColor} p-1 rounded-full shadow-sm`}
            >
              <Icon className={`${badgeSize} text-white`} />
            </div>
          );
        })}
      </div>
    );
  };

  const NavigationContainer = ({ children }) => (
    <div className="sticky top-0 bg-white shadow-sm z-20">
      {children}
    </div>
  );

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
    const allCategories = [
      'All',
      ...categories,
      ...foodSpecialties.map(specialty => ({
        id: specialty.id,
        icon: specialty.icon && SPECIALTY_ICONS[specialty.icon] && React.createElement(SPECIALTY_ICONS[specialty.icon], { 
          className: "w-4 h-4" 
        }),
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
          {allCategories.map((category) => {
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
    selectedCategory,
    selectedItem,
    setSelectedItem,
    selectedStore,
    stores,
    showItemCodes,
    filteredItems,
    categories: orderedCategories || categories,
    getStoreName,
    renderItemCode,
    renderItemFooter,
    renderPriceTag,
    renderBadges,
    NavigationContainer,
    StoreNavigation,
    CategoryNavigation,
    getOrderedItemsByCategory,
    formatPrice,
    renderVariantBadges,
    renderCompactVariants,
    selectedVariant,
    setSelectedVariant,
    getSelectedVariantPrice
  };
};

export default useTemplateLogic;