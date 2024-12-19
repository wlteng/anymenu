import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { getMenuItems, getShopByUsername, deleteMenuItem, updateMenuItem, getStores } from '../../firebase/utils';
import { Plus, Trash2, Edit, ChefHat, Flame, Star } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../ui/alert';

const ShopMenuCreator = () => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('store');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [currentStore, setCurrentStore] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingItemCode, setEditingItemCode] = useState(null);

  useEffect(() => {
    loadShopAndMenuItems();
  }, [username, storeId]);

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

      // If it's a food court, verify store exists
      if (shopData.shopType === 'Food Court') {
        if (!storeId) {
          navigate(`/menu/${username}/store-select`);
          return;
        }

        // Load stores and find current store
        const stores = await getStores(shopData.id);
        const store = stores.find(s => s.id === storeId);
        if (!store) {
          showToast({
            title: 'Error',
            description: 'Store not found',
            type: 'error'
          });
          navigate(`/menu/${username}/store-select`);
          return;
        }
        setCurrentStore(store);
      }

      // Load menu items for the shop or specific store
      const items = await getMenuItems(storeId || shopData.id);
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

  const handleItemCodeChange = async (itemId, newCode) => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;

      await updateMenuItem(itemId, {
        ...item,
        itemCode: newCode
      });

      showToast({
        title: 'Success',
        description: 'Item code updated successfully'
      });
      await loadShopAndMenuItems();
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update item code',
        type: 'error'
      });
    } finally {
      setEditingItemCode(null);
    }
  };

  const handleAddItem = () => {
    const baseUrl = `/menu/${username}`;
    const url = storeId ? `${baseUrl}/${selectedCategory}/add?store=${storeId}` : `${baseUrl}/${selectedCategory}/add`;
    navigate(url);
  };

  const handleEditItem = (itemId) => {
    const baseUrl = `/menu/${username}/${selectedCategory}`;
    const url = storeId ? `${baseUrl}/${itemId}?store=${storeId}` : `${baseUrl}/${itemId}`;
    navigate(url);
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

  const renderItemCode = (item) => {
    if (editingItemCode === item.id) {
      return (
        <input
          type="text"
          defaultValue={item.itemCode || ''}
          className="w-20 px-2 py-1 text-sm border rounded"
          autoFocus
          onBlur={(e) => handleItemCodeChange(item.id, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleItemCodeChange(item.id, e.target.value);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setEditingItemCode(item.id);
        }}
        className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
      >
        {item.itemCode || 'Code'}
      </div>
    );
  };

  const getPageTitle = () => {
    if (selectedCategory) {
      if (currentStore) {
        return `Create Menu - ${currentStore.name} - ${selectedCategory}`;
      }
      return `Create Menu - ${selectedCategory}`;
    }
    if (currentStore) {
      return `Create Menu - ${currentStore.name}`;
    }
    return "Create Menu";
  };

  if (isLoading && !menuItems.length) {
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
      <Header 
        shop={shop} 
        pageTitle={getPageTitle()}
      />
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
              {shop.categories.map((category) => (
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
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
                >
                  Back
                </button>
              </div>
              <button
                onClick={handleAddItem}
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

                    <div className="flex items-center gap-4">
                      {renderItemCode(item)}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item.id)}
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