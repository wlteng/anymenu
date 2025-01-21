import React from 'react';
import PopupItem from '../PopupItem';
import useTemplateLogic from './TemplateCore';

const Template2 = ({ menuItems = [], shop = null }) => {
  const {
    selectedItem,
    setSelectedItem,
    filteredItems,
    renderItemCode,
    renderPriceTag,
    renderBadges,
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
      <div className="relative overflow-hidden rounded-2xl aspect-square bg-gray-100">
        <div className="w-full h-full">
          {item.image ? (
            <img 
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.className = "w-full h-full flex items-center justify-center";
                e.target.parentElement.innerHTML = `<span class="text-gray-400">${item.title}</span>`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">{item.title}</span>
            </div>
          )}
        </div>
        
        {renderItemCode(item.itemCode)}

        {/* Price Tag */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          {renderPriceTag(item, 'normal')}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2">
          {renderBadges(item, 'normal')}
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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

export default Template2;