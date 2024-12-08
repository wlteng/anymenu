import React, { useState } from 'react';
import { ChefHat, Flame, Star, Tag } from 'lucide-react'; // Added Tag import
import PopupItem from '../PopupItem';

const Template2 = ({ menuItems = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = [
    'All', 
    'Appetizers', 
    'Main Course', 
    'Desserts', 
    'Drinks',
    { id: 'chefs', icon: <ChefHat className="w-4 h-4 text-white" /> },
    { id: 'spicy', icon: <Flame className="w-4 h-4 text-white" /> },
    { id: 'popular', icon: <Star className="w-4 h-4 text-white" /> }
  ];

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'chefs') return item.isChefRecommended;
    if (selectedCategory === 'spicy') return item.isSpicy;
    if (selectedCategory === 'popular') return item.isPopular;
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
                        ? 'bg-yellow-500'
                        : category.id === 'popular'
                          ? 'bg-purple-500'
                          : 'bg-red-500'
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="relative cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-square bg-gray-100">
                {item.image ? (
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-lg">{item.title}</span>
                  </div>
                )}
                
                {/* Price Tag */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  {item.promotionalPrice ? (
                    <div className="bg-green-50 rounded-full px-3 py-1 text-sm font-semibold text-green-600 shadow-md flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      ${item.promotionalPrice}
                    </div>
                  ) : (
                    <div className="bg-white rounded-full px-3 py-1 text-sm font-semibold shadow-md">
                      ${item.price}
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {item.isChefRecommended && (
                    <div className="bg-yellow-500 p-1 rounded-full shadow-md">
                      <ChefHat className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.isSpicy && (
                    <div className="bg-red-500 p-1 rounded-full shadow-md">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.isPopular && (
                    <div className="bg-purple-500 p-1 rounded-full shadow-md">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  )}
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
      />
    </div>
  );
};

export default Template2;