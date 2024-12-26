import React, { useState, useEffect } from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getFavoriteItems } from '../../../firebase/utils';
import { LoadingSpinner } from '../../../components/ui/loading';
import PopupItem from '../../PopupItem';

// Sample data for homepage
const sampleFavorites = [
  {
    id: 'sample1',
    title: 'Classic Cheeseburger',
    image: '/img/sample/1.jpg',
    description: 'Juicy beef patty with melted cheese, fresh lettuce, tomatoes, and our special sauce.',
    price: '12.90',
    shop: {
      id: 'sample-shop',
      name: 'Sample Restaurant',
      username: 'abcshop',
      squareLogo: '/img/logo/applogo.png'
    }
  },
  {
    id: 'sample2',
    title: 'Pepperoni Pizza',
    image: '/img/sample/2.jpg',
    description: 'Traditional pizza with pepperoni, mozzarella cheese, and tomato sauce.',
    price: '18.90',
    shop: {
      id: 'sample-shop',
      name: 'Sample Restaurant',
      username: 'abcshop',
      squareLogo: '/img/logo/applogo.png'
    }
  },
  {
    id: 'sample3',
    title: 'Caesar Salad',
    image: '/img/sample/3.jpg',
    description: 'Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing.',
    price: '9.90',
    shop: {
      id: 'sample-shop',
      name: 'Sample Restaurant',
      username: 'abcshop',
      squareLogo: '/img/logo/applogo.png'
    }
  }
];

const LoveFood = ({ 
  shopId, 
  isSample = false,
  showAllFavorites = false 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (isSample) {
      // Use sample data for homepage
      setFavorites(sampleFavorites);
    } else if (user) {
      loadFavorites();
    }
  }, [user, shopId, isSample]);

  const loadFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const items = await getFavoriteItems(user.uid);
      // Filter favorites based on showAllFavorites or shopId
      const filteredItems = !showAllFavorites && shopId
        ? items.filter(favorite => favorite.item.shopId === shopId)
        : items;

      const processedItems = filteredItems.map(favorite => ({
        ...favorite.item,
        shop: favorite.item.shop || {}
      }));
      setFavorites(processedItems);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner size="w-6 h-6" />
      </div>
    );
  }

  const renderFavoriteItem = (item) => {
    const hasValidImage = item.image && typeof item.image === 'string';
    const hasValidShopLogo = item.shop?.squareLogo && typeof item.shop.squareLogo === 'string';

    return (
      <div 
        key={item.id} 
        className="relative cursor-pointer group aspect-square"
        onClick={() => setSelectedItem(item)}
      >
        <div className="w-full h-full rounded-lg overflow-hidden">
          {hasValidImage ? (
            <img 
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/placeholder-food.png';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm text-gray-400">{item.title}</span>
            </div>
          )}
        </div>

        {/* Hover overlay with item title */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
          <span className="text-xs text-white line-clamp-2">{item.title}</span>
        </div>
        
        {/* Show shop logo badge only in "all favorites" view */}
        {showAllFavorites && hasValidShopLogo && (
          <div className="absolute right-1 bottom-1 w-6 h-6 bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={item.shop.squareLogo}
              alt={item.shop.name || 'Shop logo'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/logo/applogo.png';
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          <h3 className="text-sm font-medium text-gray-900">
            {shopId ? 'Shop Favorites' : 'Favorites'}
          </h3>
        </div>
        {!isSample && (
          <button 
            onClick={() => navigate('/love-food')}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            View all
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {favorites.slice(0, 6).map(renderFavoriteItem)}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center p-4">
          {shopId ? 'No favorite items from this shop yet' : 'No favorite items yet'}
        </p>
      )}

      {selectedItem && (
        <PopupItem 
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          shop={selectedItem.shop}
        />
      )}
    </div>
  );
};

export default LoveFood;