import React, { useState } from 'react';
import { ChefHat, Flame } from 'lucide-react';
import PopupItem from '../PopupItem';

const Template3 = ({ menuItems = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  // Categories including tag filters
  const categories = [
    'All', 
    'Appetizers', 
    'Main Course', 
    'Desserts', 
    'Drinks',
    { id: 'chefs', icon: <ChefHat className="w-4 h-4 text-white" /> },
    { id: 'spicy', icon: <Flame className="w-4 h-4 text-white" /> }
  ];

  // Filter items based on all categories including tags
  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'chefs') return item.isChefRecommended;
    if (selectedCategory === 'spicy') return item.isSpicy;
    return item.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Category Navigation */}
      <div className="sticky top-0 bg-white shadow-sm z-40">
        <div className="overflow-x-auto">
          <div className="flex space-x-4 p-4">
            {categories.map((category) => (
              <button
                key={typeof category === 'string' ? category : category.id}
                onClick={() => setSelectedCategory(typeof category === 'string' ? category : category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm flex items-center gap-1 ${
                  selectedCategory === (typeof category === 'string' ? category : category.id)
                    ? 'bg-blue-600 text-white'
                    : typeof category === 'object'
                      ? category.id === 'chefs'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {typeof category === 'string' ? category : category.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="p-2">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
          {filteredItems.map(item => (
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
                    <span className="text-sm">{item.title}</span>
                  </div>
                )}
                {/* Centered bottom price - smaller size */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <div className="bg-white rounded-full px-2 py-0.5 text-xs font-semibold shadow-md">
                    ${item.promotionalPrice || item.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup */}
      <PopupItem 
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default Template3;