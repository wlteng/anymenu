import React, { useState, useEffect } from 'react';
import { ChefHat, Flame, Heart, Share2, Clock, Tag, Star, Store, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../components/ui/dialog";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LoadingSpinner } from './ui/loading';
import { 
  addFavoriteItem, 
  removeFavoriteItem, 
  checkIsFavorited 
} from '../firebase/utils';

const PopupItem = ({ item, isOpen, onClose, shop, stores = [] }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const showItemCodes = shop?.showItemCodes ?? false;

  useEffect(() => {
    const checkFavorite = async () => {
      if (user && item?.id && isOpen) {
        try {
          const isFavorited = await checkIsFavorited(user.uid, item.id);
          setIsLiked(isFavorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    checkFavorite();
  }, [user, item?.id, isOpen]);

  const getStoreName = () => {
    if (!stores.length || !item?.storeId) return null;
    const store = stores.find(s => s.id === item.storeId);
    return store?.name;
  };

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      showToast({
        title: 'Login Required',
        description: 'Please login to add items to favorites',
        type: 'error'
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        await removeFavoriteItem(user.uid, item.id);
        setIsLiked(false);
        showToast({
          title: 'Success',
          description: 'Item removed from favorites'
        });
      } else {
        const cleanItem = {
          id: item.id,
          title: item.title,
          description: item.description || '',
          price: item.price,
          promotionalPrice: item.promotionalPrice || null,
          itemCode: item.itemCode || '',
          image: item.image || '',
          category: item.category || '',
          preparationTime: item.preparationTime || '',
          isSpicy: item.isSpicy || false,
          isChefRecommended: item.isChefRecommended || false,
          isPopular: item.isPopular || false,
          shopId: shop.id,
          storeId: item.storeId || null
        };

        const cleanShop = {
          id: shop.id,
          name: shop.name || '',
          username: shop.username || '',
          squareLogo: shop.squareLogo || '',
          rectangleLogo: shop.rectangleLogo || '',
          shopType: shop.shopType || ''
        };

        if (shop.shopType === 'Food Court' && item.storeId) {
          const store = stores.find(s => s.id === item.storeId);
          if (store) {
            cleanItem.storeName = store.name;
            cleanItem.store = {
              id: store.id,
              name: store.name,
              storeImage: store.storeImage || null
            };
          }
        }

        await addFavoriteItem(user.uid, {
          ...cleanItem,
          shopId: shop.id,
          shop: cleanShop
        });

        setIsLiked(true);
        showToast({
          title: 'Success',
          description: 'Item added to favorites'
        });
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update favorites',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (platform) => async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSharing) return;

    setIsSharing(true);
    try {
      const shareUrl = window.location.href;
      const shareText = `Check out ${item.title} at ${shop.name}!`;
      
      let shareLink = '';
      
      switch (platform) {
        case 'whatsapp':
          shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
          break;
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'telegram':
          shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          showToast({
            title: 'Success',
            description: 'Link copied to clipboard'
          });
          setShowShareMenu(false);
          return;
        default:
          if (navigator.share) {
            await navigator.share({
              title: item.title,
              text: shareText,
              url: shareUrl
            });
          }
      }

      if (shareLink) {
        window.open(shareLink, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        showToast({
          title: 'Error',
          description: 'Failed to share item',
          type: 'error'
        });
      }
    } finally {
      setIsSharing(false);
      setShowShareMenu(false);
    }
  };

  const handleVisitShop = () => {
    window.open(`/${shop.username}`, '_blank');
  };

  if (!item) return null;

  const storeName = getStoreName();
  const hasPreparationTime = item.preparationTime && item.preparationTime.trim() !== '';

  const renderFooterInfo = () => {
    const hasFooterContent = hasPreparationTime || storeName;
    if (!hasFooterContent) return null;

    return (
      <div className="flex items-center gap-4 text-gray-500">
        {hasPreparationTime && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{item.preparationTime} minutes</span>
          </div>
        )}
        {storeName && (
          <div className="flex items-center">
            <Store className="w-4 h-4 mr-1" />
            <span className="text-sm">{storeName}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <div className="relative h-[300px]">
            {item.image ? (
              <img 
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                <span className="text-lg">{item.title}</span>
              </div>
            )}
            
            {showItemCodes && item.itemCode && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                {item.itemCode}
              </div>
            )}
            
            {/* Top Actions */}
            <div className="absolute top-4 left-4 flex gap-4">
              {user && (
                <button 
                  onClick={handleLikeToggle}
                  disabled={isLoading}
                  className="transition-transform hover:scale-110 disabled:opacity-50 p-2 bg-black/20 rounded-full backdrop-blur-sm"
                >
                  {isLoading ? (
                    <LoadingSpinner className="w-6 h-6 text-white" />
                  ) : (
                    <Heart 
                      className={`w-6 h-6 drop-shadow-lg ${
                        isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              )}
              <div className="relative">
                <button 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  disabled={isSharing}
                  className="p-2 bg-black/20 rounded-full backdrop-blur-sm transition-transform hover:scale-110 disabled:opacity-50"
                >
                  {isSharing ? (
                    <LoadingSpinner className="w-6 h-6 text-white" />
                  ) : (
                    <Share2 className="w-6 h-6 text-white drop-shadow-lg" />
                  )}
                </button>

                {showShareMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-50"
                      onClick={() => setShowShareMenu(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <button
                          onClick={handleShare('whatsapp')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Share on WhatsApp
                        </button>
                        <button
                          onClick={handleShare('facebook')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Share on Facebook
                        </button>
                        <button
                          onClick={handleShare('twitter')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Share on Twitter
                        </button>
                        <button
                          onClick={handleShare('telegram')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Share on Telegram
                        </button>
                        <button
                          onClick={handleShare('copy')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {item.promotionalPrice && (
                <div className="bg-white rounded-full px-4 py-2 text-sm font-semibold text-gray-500 line-through shadow-md">
                  ${item.price}
                </div>
              )}
              <div className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold shadow-md ${
                item.promotionalPrice ? 'bg-green-50' : 'bg-white'
              }`}>
                {item.promotionalPrice && (
                  <Tag className="w-4 h-4 text-green-600" />
                )}
                <span className={item.promotionalPrice ? 'text-green-600' : ''}>
                  ${item.promotionalPrice || item.price}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 bg-white">
            <div className="mb-4">
              <DialogTitle className="text-xl font-semibold">
                {item.title}
              </DialogTitle>
              
              {/* Item Tags */}
              <div className="flex gap-2 mt-2.5">
                {item.isChefRecommended && (
                  <div className="bg-yellow-500 p-1.5 rounded-full shadow-md">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                )}
                {item.isSpicy && (
                  <div className="bg-red-500 p-1.5 rounded-full shadow-md">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                )}
                {item.isPopular && (
                  <div className="bg-purple-500 p-1.5 rounded-full shadow-md">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base mb-4">
              {item.description}
            </p>

            {/* Footer Information */}
            {renderFooterInfo()}

            {/* Visit Shop Button (shown when viewing from favorites) */}
            {window.location.pathname === '/love-food' && (
              <button
                onClick={handleVisitShop}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Visit {shop.name}</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupItem;