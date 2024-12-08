import React, { useState } from 'react';
import { ChefHat, Flame, X, Heart, Share2, Clock, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../components/ui/dialog";

const PopupItem = ({ item, isOpen, onClose }) => {
  const [isLiked, setIsLiked] = useState(false);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0">
        <div className="relative">
          {/* Image Section */}
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
            
            {/* Top Actions */}
            <div className="absolute top-4 left-4 flex gap-4">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="transition-transform hover:scale-110"
              >
                <Heart 
                  className={`w-6 h-6 drop-shadow-lg ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`}
                />
              </button>
              <button className="transition-transform hover:scale-110">
                <Share2 className="w-6 h-6 text-white drop-shadow-lg" />
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 transition-transform hover:scale-110"
            >
              <X className="w-6 h-6 text-white drop-shadow-lg" />
            </button>

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
            {/* Title */}
            <div className="mb-4">
              <DialogTitle className="text-xl font-semibold mb-3">
                {item.title}
              </DialogTitle>
              {/* Signature Icons */}
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
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base mb-4">
              {item.description}
            </p>

            {/* Time Info */}
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">15-20 minutes</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupItem;