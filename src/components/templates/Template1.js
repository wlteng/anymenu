import React, { useState } from 'react';
import { ChefHat, Flame, Clock } from 'lucide-react';
import PopupItem from '../PopupItem';

const Template1 = ({ menuItems = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = [
    'All', 
    'Appetizers', 
    'Main Course', 
    'Desserts', 
    'Drinks',
    { id: 'chefs', icon: <ChefHat className="w-4 h-4 text-white" /> },
    { id: 'spicy', icon: <Flame className="w-4 h-4 text-white" /> }
  ];

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'chefs') return item.isChefRecommended;
    if (selectedCategory === 'spicy') return item.isSpicy;
    return item.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Categories */}
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
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {typeof category === 'string' ? category : category.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items - Single Column Layout */}
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
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                    />
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.isChefRecommended && (
                      <div className="bg-yellow-500 p-1.5 rounded-full shadow-md">
                        <ChefHat className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {item.isSpicy && (
                      <div className="bg-red-500 p-1.5 rounded-full shadow-md">
                        <Flame className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  {/* Price tag at bottom center */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    {item.promotionalPrice ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs bg-white rounded-full px-2 py-0.5 line-through text-gray-500">
                          ${item.price}
                        </div>
                        <div className="bg-green-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                          ${item.promotionalPrice}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-full px-3 py-1 text-sm font-semibold shadow-md">
                        ${item.price}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{item.preparationTime} mins</span>
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
      />
    </div>
  );
};

export default Template1;