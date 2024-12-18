import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { getMenuItems, getShopByUsername, deleteMenuItem } from '../../firebase/utils';
import { Plus, Trash2, Edit, ChefHat, Flame, Star } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../ui/alert';

const ShopMenuCreator = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const categories = [
    "Appetizers",
    "Main Course",
    "Desserts",
    "Drinks",
    "Specials",
    "Sides"
  ];

  useEffect(() => {
    loadShopAndMenuItems();
  }, [username]);

  const loadShopAndMenuItems = async () => {
    setIsLoading(true);
    try {
      const shopData = await getShopByUsername(username);
      if (!shopData) {
        showToast({
          title: 'Error',
          description: 'Shop not found',
          type: 'error'
        });
        navigate('/my-shops');
        return;
      }
      setShop(shopData);

      const items = await getMenuItems(shopData.id);
      setMenuItems(items);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load shop data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, imageUrl) => {
    try {
      setIsLoading(true);
      await deleteMenuItem(itemId, imageUrl);
      showToast({
        title: 'Success',
        description: 'Menu item deleted successfully'
      });
      loadShopAndMenuItems();
      setShowDeleteConfirm(null);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to delete menu item',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderItemTags = (item) => (
    <div className="flex gap-1">
      {item.isChefRecommended && (
        <div className="bg-yellow-500 p-1 rounded-full shadow-sm">
          <ChefHat className="w-3 h-3 text-white" />
        </div>
      )}
      {item.isSpicy && (
        <div className="bg-red-500 p-1 rounded-full shadow-sm">
          <Flame className="w-3 h-3 text-white" />
        </div>
      )}
      {item.isPopular && (
        <div className="bg-purple-500 p-1 rounded-full shadow-sm">
          <Star className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          {!selectedCategory ? (
            <>
              <div className="mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
                >
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="p-6 text-center border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="text-lg font-medium">{category}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {menuItems.filter(item => item.category === category).length} items
                    </p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
                >
                  Back to Categories
                </button>
                <button
                  onClick={() => navigate(`/menu/${username}/${selectedCategory}/add`)}
                  className="p-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {menuItems
                  .filter(item => item.category === selectedCategory)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.title}</h3>
                            {renderItemTags(item)}
                          </div>
                          <div className="text-sm mt-2">
                            {item.promotionalPrice ? (
                              <span>
                                <span className="line-through text-gray-400">${item.price}</span>
                                {' '}
                                <span className="text-green-600">${item.promotionalPrice}</span>
                              </span>
                            ) : (
                              <span>${item.price}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/menu/${username}/${selectedCategory}/${item.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

      <AlertDialog 
        open={!!showDeleteConfirm} 
        onOpenChange={() => setShowDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this menu item? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteItem(showDeleteConfirm.id, showDeleteConfirm.image)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <LoadingSpinner />}
              Delete
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShopMenuCreator;