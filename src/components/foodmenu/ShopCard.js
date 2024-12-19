import React, { useState, useRef, useEffect } from 'react';
import { Eye, Edit2, Trash2, MoreVertical, PlusCircle } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../ui/alert';
import { LoadingSpinner } from '../ui/loading';
import { deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ShopCard = ({ shop, onView, onEdit, onCreateMenu, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateMenu = () => {
    // If shop type is Food Court, navigate to store selection
    if (shop.shopType === 'Food Court') {
      window.location.href = `/menu/${shop.username}/store-select`;
    } else {
      // Otherwise, proceed directly to menu creation
      onCreateMenu(shop.username);
    }
  };

  const handleDelete = async () => {
    if (deleteText !== shop.name) return;
    
    setIsLoading(true);
    try {
      // 1. Get all menu items for this shop
      const menuItemsQuery = query(collection(db, 'menuItems'), where('shopId', '==', shop.id));
      const menuItemsSnapshot = await getDocs(menuItemsQuery);
      
      // Only proceed with favorites deletion if there are menu items
      if (!menuItemsSnapshot.empty) {
        const menuItemIds = menuItemsSnapshot.docs.map(doc => doc.id);
        
        // 2. Get and delete favorites referencing these menu items
        const favoritesQuery = query(collection(db, 'favorites'), where('itemId', 'in', menuItemIds));
        const favoritesSnapshot = await getDocs(favoritesQuery);

        // Delete all favorites if any exist
        if (!favoritesSnapshot.empty) {
          const favoriteDeletions = favoritesSnapshot.docs.map(doc => 
            deleteDoc(doc.ref)
          );
          await Promise.all(favoriteDeletions);
        }

        // 3. Delete all menu items
        const menuItemDeletions = menuItemsSnapshot.docs.map(doc =>
          deleteDoc(doc.ref)
        );
        await Promise.all(menuItemDeletions);
      }

      // 4. Delete shop
      await onDelete(shop);
      
      setShowDeleteConfirm(false);
      setDeleteText('');
    } catch (error) {
      console.error('Error deleting shop:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {shop.squareLogo ? (
              <img 
                src={shop.squareLogo} 
                alt={shop.name} 
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-gray-500">{shop.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{shop.name}</h2>
              <div className="text-sm text-gray-500 mt-1">
                <span>domain.com/{shop.username}</span>
                
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => window.open(`/${shop.username}`, '_blank')}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  >
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      View
                    </div>
                  </button>
                  <button
                    onClick={handleCreateMenu}
                    className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                  >
                    Create Menu
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="rounded-full"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(shop);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </button>

                {shop.shopType === 'Food Court' && (
                  <button
                    onClick={() => {
                      window.location.href = `/my-shops/${shop.username}/stores`;
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Create Stores
                  </button>
                )}

                <div className="h-px bg-gray-200 my-1" />

                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Shop</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>This action cannot be undone. This will permanently delete the shop and all associated data.</p>
            <p>Please type <strong>{shop.name}</strong> to confirm.</p>
            
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="Type shop name to confirm"
              className="w-full mt-2 h-10 px-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteText('');
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteText !== shop.name || isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <LoadingSpinner />}
              Delete Shop
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShopCard;