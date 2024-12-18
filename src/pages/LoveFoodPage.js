import React, { useState, useEffect } from 'react';
import { Heart, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFavoriteItems, removeFavoriteItem } from '../firebase/utils';
import { LoadingSpinner } from '../components/ui/loading';
import PopupItem from '../components/PopupItem';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../components/ui/alert';
import { useToast } from '../contexts/ToastContext';

const LoveFoodPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedShop, setSelectedShop] = useState('All');
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [itemToUnfavorite, setItemToUnfavorite] = useState(null);
  const [isUnfavoriting, setIsUnfavoriting] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const items = await getFavoriteItems(user.uid);
      const processedItems = items.map(favorite => ({
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

  const handleUnfavorite = async () => {
    if (!itemToUnfavorite || !user) return;

    setIsUnfavoriting(true);
    try {
      await removeFavoriteItem(user.uid, itemToUnfavorite.id);
      showToast({
        title: 'Success',
        description: 'Item removed from favorites'
      });
      // Remove item from local state
      setFavorites(prev => prev.filter(item => item.id !== itemToUnfavorite.id));
    } catch (error) {
      console.error('Error removing favorite:', error);
      showToast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        type: 'error'
      });
    } finally {
      setIsUnfavoriting(false);
      setItemToUnfavorite(null);
    }
  };

  // Get unique shops from favorites with valid shop data
  const uniqueShops = Array.from(new Set(
    favorites
      .filter(item => item.shop?.name && typeof item.shop.name === 'string')
      .map(item => item.shop.name)
  )).sort();

  const showShopFilter = uniqueShops.length > 0;
  const shops = showShopFilter ? ['All', ...uniqueShops] : ['All'];

  const filteredItems = favorites.filter(item => 
    selectedShop === 'All' || (item.shop?.name && item.shop.name === selectedShop)
  );

  const renderItem = (item) => {
    const hasValidImage = item.image && typeof item.image === 'string';
    const hasValidShopLogo = item.shop?.squareLogo && typeof item.shop.squareLogo === 'string';
    const price = item.promotionalPrice || item.price;
    const hasValidPrice = typeof price === 'number' || typeof price === 'string';

    return (
      <div
        key={item.id}
        className="relative cursor-pointer group"
      >
        <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-100">
          <div 
            onClick={() => setSelectedItem(item)}
            className="w-full h-full"
          >
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
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-sm">{item.title}</span>
              </div>
            )}
          </div>

          {/* Unfavorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setItemToUnfavorite(item);
            }}
            className="absolute top-2 left-2 p-2 bg-black/20 rounded-full backdrop-blur-sm transition-all hover:scale-110"
          >
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </button>

          {/* Shop Logo */}
          {hasValidShopLogo && (
            <div className="absolute top-2 right-2 w-7 h-7">
              <img 
                src={item.shop.squareLogo}
                alt={item.shop.name}
                className="w-full h-full object-cover rounded-lg shadow-md bg-white/20 backdrop-blur-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Price Tag */}
          {hasValidPrice && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <div className="bg-white rounded-full px-2 py-0.5 text-xs font-semibold shadow-md">
                ${price}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header */}
      <div className="sticky top-0 bg-white shadow-sm z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">My Favorites</h1>
              </div>
            </div>
            
            {/* Shop Filter Dropdown - Only show if there are multiple shops */}
            {showShopFilter && (
              <div className="relative">
                <button
                  onClick={() => setShowShopDropdown(!showShopDropdown)}
                  className="px-4 py-2 bg-gray-100 rounded-full flex items-center gap-2 text-sm"
                >
                  <span className="truncate max-w-[150px]">{selectedShop}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </button>

                {showShopDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowShopDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-20 py-1">
                      {shops.map((shop) => (
                        <button
                          key={shop}
                          onClick={() => {
                            setSelectedShop(shop);
                            setShowShopDropdown(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            selectedShop === shop ? 'text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          {shop}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-4xl mx-auto p-2">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredItems.map(renderItem)}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No favorite items yet</p>
          </div>
        )}
      </div>

      {/* Item Detail Popup */}
      <PopupItem 
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        shop={selectedItem?.shop}
      />

      {/* Unfavorite Confirmation Dialog */}
      <AlertDialog 
        open={!!itemToUnfavorite} 
        onOpenChange={() => !isUnfavoriting && setItemToUnfavorite(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Remove from Favorites</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this item from your favorites?
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setItemToUnfavorite(null)}
              disabled={isUnfavoriting}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUnfavorite}
              disabled={isUnfavoriting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
            >
              {isUnfavoriting && <LoadingSpinner />}
              Remove
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoveFoodPage;