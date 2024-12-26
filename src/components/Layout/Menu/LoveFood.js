import React, { useState, useEffect } from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getFavoriteItems } from '../../../firebase/utils';
import { LoadingSpinner } from '../../ui/loading';
import PopupItem from '../../PopupItem';

const LoveFood = ({ shopId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, shopId]);

  const loadFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const items = await getFavoriteItems(user.uid);
      // Filter favorites by shop if shopId is provided
      const filteredItems = shopId
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
        className="relative cursor-pointer group"
        onClick={() => setSelectedItem(item)}
      >
        <div className="aspect-square rounded-lg overflow-hidden">
          {hasValidImage ? (
            <img 
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm text-gray-400">{item.title}</span>
            </div>
          )}
        </div>
        
        {/* Only show shop logo if not filtered by shop */}
        {!shopId && hasValidShopLogo && (
          <div className="absolute right-1 bottom-1 w-6 h-6">
            <img 
              src={item.shop.squareLogo}
              alt={item.shop.name || 'Shop logo'}
              className="w-full h-full object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
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
        <button 
          onClick={() => navigate('/love-food')}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          View all
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
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