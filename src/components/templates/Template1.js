import React, { useState, useEffect } from 'react';
import { ChefHat, Flame, Clock, Store } from 'lucide-react';
import PopupItem from '../PopupItem';
import { getStores } from '../../firebase/utils';

const Template1 = ({ menuItems = [], shop = null }) => {
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

  // Create categories array based on shop settings
  const categories = [
    'All',
    ...(shop?.categories || []),
    { id: 'chefs', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'spicy', icon: <Flame className="w-4 h-4" /> }
  ];

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

  // Filter items based on both category and store
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = 
      selectedCategory === 'All' ||
      selectedCategory === 'chefs' && item.isChefRecommended ||
      selectedCategory === 'spicy' && item.isSpicy ||
      item.category === selectedCategory;

    const matchesStore = 
      selectedStore === 'All' ||
      item.storeId === selectedStore;

    return matchesCategory && matchesStore;
  });

  const renderItemCode = (itemCode) => {
    if (!showItemCodes || !itemCode) return null;

    return (
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
        {itemCode}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Categories and Store Filter */}
      <div className="sticky top-0 bg-white shadow-sm z-40">
        {/* Store Filter for Food Court */}
        {shop?.shopType === 'Food Court' && stores.length > 0 && (
          <div className="">
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
          </div>
        )}

        {/* Categories */}
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
      </div>

      {/* Menu Items */}
      <div className="max-w-3xl mx-auto p-4">
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image and Mobile Layout */}
                <div className="relative w-full md:w-48 h-48">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-t-xl md:rounded-l-xl md:rounded-tr-none flex items-center justify-center">
                      <span className="text-gray-400">{item.title}</span>
                    </div>
                  )}
                  
                  {/* Item Code */}
                  {renderItemCode(item.itemCode)}
                  
                  {/* Mobile: Badges at top left */}
                  <div className="absolute top-2 left-2 flex gap-1 md:hidden">
                    {item.isSpicy && (
                      <div className="bg-red-500 p-1.5 rounded-full shadow-md">
                        <Flame className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {item.isChefRecommended && (
                      <div className="bg-yellow-500 p-1.5 rounded-full shadow-md">
                        <ChefHat className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Mobile: Prices at bottom center */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 md:hidden">
                    {item.promotionalPrice ? (
                      <>
                        <div className="bg-white rounded-full px-3 py-1 text-sm font-semibold text-gray-500 line-through shadow-md">
                          ${item.price}
                        </div>
                        <div className="bg-green-500 text-white rounded-full px-3 py-1 text-sm font-semibold shadow-md">
                          ${item.promotionalPrice}
                        </div>
                      </>
                    ) : (
                      <div className="bg-white rounded-full px-3 py-1 text-sm font-semibold shadow-md">
                        ${item.price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section - Desktop Layout */}
                <div className="flex-1 p-6 relative">
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-gray-500 line-clamp-2">{item.description}</p>
                      
                      {/* Mobile: Preparation Time */}
                      <div className="md:hidden mt-2 text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        <span className="text-sm">{item.preparationTime} mins</span>
                      </div>
                    </div>

                    {/* Desktop: Store Name for Food Court */}
                    {shop?.shopType === 'Food Court' && item.storeName && (
                      <div className="hidden md:flex items-center gap-2 mt-2 text-gray-500">
                        <Store className="w-4 h-4" />
                        <span className="text-sm">{item.storeName}</span>
                      </div>
                    )}

                    {/* Desktop: Badges and Minutes */}
                    <div className="hidden md:flex items-center gap-2 mt-auto">
                      {item.isSpicy && (
                        <div className="bg-red-500 p-1.5 rounded-full shadow-md">
                          <Flame className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {item.isChefRecommended && (
                        <div className="bg-yellow-500 p-1.5 rounded-full shadow-md">
                          <ChefHat className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{item.preparationTime} mins</span>
                      </div>
                    </div>

                    {/* Desktop: Floating Price */}
                    <div className="hidden md:flex items-center text-xl gap-1 absolute right-0 translate-y-1/2" style={{bottom:'22px'}}>
                      {item.promotionalPrice ? (
                        <>
                          <div className="text-gray-300 line-through">
                            ${item.price}
                          </div>
                          <div className="bg-green-500 text-white px-4 py-2 rounded-tl-lg rounded-br-lg ml-2">
                            ${item.promotionalPrice}
                          </div>
                        </>
                      ) : (
                        <div className="bg-blue-50 text-gray-400 px-4 py-2 rounded-tl-lg rounded-br-lg">
                          ${item.price}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PopupItem 
        item={{
          ...selectedItem,
          shopId: shop?.id
        }}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        shop={shop}
      />
    </div>
  );
};

export default Template1;