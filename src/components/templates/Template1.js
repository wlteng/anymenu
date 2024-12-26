import React from 'react';
import PopupItem from '../PopupItem';
import { useTemplateLogic } from './TemplateCore';

const Template1 = ({ menuItems = [], shop = null }) => {
  const {
    selectedItem,
    setSelectedItem,
    stores,
    showItemCodes,
    filteredItems,
    renderItemCode,
    renderItemFooter,
    renderBadges,
    StoreNavigation,
    CategoryNavigation
  } = useTemplateLogic({ menuItems, shop });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm z-15 [&:not(:first-child)]:pt-4">
        <StoreNavigation />
        <CategoryNavigation />
      </div>

      <div className="max-w-3xl mx-auto p-4">
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row">
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
                  
                  {renderItemCode(item.itemCode)}
                  
                  <div className="absolute top-2 left-2 md:hidden">
                    {renderBadges(item, 'normal')}
                  </div>

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

                <div className="flex-1 p-6 relative">
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-gray-500 line-clamp-2">{item.description}</p>
                      
                      <div className="md:hidden mt-2">
                        {renderItemFooter(item)}
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-3 mt-auto">
                      <div className="flex items-center gap-2">
                        {renderBadges(item, 'normal')}
                      </div>
                      {renderItemFooter(item)}
                    </div>

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
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        shop={shop}
        stores={stores}
      />
    </div>
  );
};

export default Template1;