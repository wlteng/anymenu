import React from 'react';
import PopupItem from '../PopupItem';
import { useTemplateLogic } from './TemplateCore';

const Template3 = ({ menuItems = [], shop = null }) => {
  const {
    selectedItem,
    setSelectedItem,
    filteredItems,
    renderPriceTag,
    stores,
    StoreNavigation,
    NavigationContainer,
    CategoryNavigation
  } = useTemplateLogic({ menuItems, shop });

  const renderItem = (item) => (
    <div
      key={item.id}
      onClick={() => setSelectedItem(item)}
      className="relative cursor-pointer group"
    >
      <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-100">
        {item.image ? (
          <img 
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">{item.title}</span>
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          {renderPriceTag(item, 'small')}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <NavigationContainer>
            <StoreNavigation />
            <CategoryNavigation />
          </NavigationContainer>

      {/* Gallery Grid */}
      <div className="p-2">
        <div className="grid grid-cols-3 md:grid-cols-8 gap-2">
          {filteredItems.map(item => renderItem(item))}
        </div>
      </div>

      {/* Popup Item Detail */}
      <PopupItem 
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        shop={shop}
        stores={stores}
      />
    </div>
  );
};

export default Template3;