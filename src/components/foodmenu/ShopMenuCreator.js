import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  getMenuItems, 
  getShopByUsername, 
  deleteMenuItem, 
  updateMenuItem,
  updateShop,
  getStores 
} from '../../firebase/utils';
import { Plus, Trash2, Edit, ChefHat, Flame, Star, Store, GripVertical } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../ui/alert';

// Sortable Category Component
const SortableCategory = ({ category, itemCount, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: category});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative p-6 text-center border rounded-lg hover:bg-gray-50"
    >
      <div {...attributes} {...listeners} className="absolute top-2 right-2 cursor-move">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <button
        onClick={onClick}
        className="w-full h-full"
      >
        <h3 className="text-lg font-medium">{category}</h3>
        <p className="text-sm text-gray-500 mt-2">
          {itemCount} items
        </p>
      </button>
    </div>
  );
};

// SortableMenuItem Component
const SortableMenuItem = ({ item, onEdit, onDelete, renderItemCode, renderItemTags, shop }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: item.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const renderPrice = (price, promotionalPrice) => {
    const currencySymbol = shop?.currencySymbol || '$';
    const currencyCode = shop?.currencyCode || 'USD';

    const formatPrice = (value) => {
      if (currencyCode === 'IDR') {
        // Format IDR without decimals
        return parseInt(value).toLocaleString('id-ID');
      }
      // Other currencies with 2 decimal places
      return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    return promotionalPrice ? (
      <span>
        <span className="line-through text-gray-400">{currencySymbol}{formatPrice(price)}</span>
        {' '}
        <span className="text-green-600">{currencySymbol}{formatPrice(promotionalPrice)}</span>
      </span>
    ) : (
      <span>{currencySymbol}{formatPrice(price)}</span>
    );
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between p-4 border rounded-lg bg-white"
    >
      <div className="flex items-center gap-4 flex-1">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        {item.image && (
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{item.title}</h3>
            {renderItemTags(item)}
          </div>
          
          {/* Base Price */}
          <div className="text-sm mt-2">
            {renderPrice(item.price, item.promotionalPrice)}
          </div>

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.variants.map((variant) => (
                <div 
                  key={variant.id} 
                  className="text-sm text-gray-600 flex items-center gap-2"
                >
                  <span className="font-medium">{variant.label}:</span>
                  {renderPrice(variant.price, variant.promotionalPrice)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        {renderItemCode(item)}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [existingItemCodes, setExistingItemCodes] = useState([]);
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [itemOrder, setItemOrder] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

      // Set initial category order
      setOrderedCategories(shopData.categoryOrder || shopData.categories);

      // If it's a food court, verify store exists
      if (shopData.shopType === 'Food Court') {
        if (!storeId) {
          navigate(`/menu/${username}/store-select`);
          return;
        }

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

      // Load menu items
      const items = await getMenuItems(shopData.id);
      
      // Filter items by storeId if in food court mode
      const filteredItems = shopData.shopType === 'Food Court' && storeId
        ? items.filter(item => item.storeId === storeId)
        : items;

      // Set up item order
      const orderMap = shopData.itemOrder || {};
      const initialItemOrder = {};
      
      shopData.categories.forEach(category => {
        const categoryItems = filteredItems.filter(item => item.category === category);
        const categoryOrder = orderMap[category] || [];
        
        // Include ordered items first, then add any items not in the order
        initialItemOrder[category] = [
          ...categoryOrder.filter(id => categoryItems.some(item => item.id === id)),
          ...categoryItems
            .filter(item => !categoryOrder.includes(item.id))
            .map(item => item.id)
        ];
      });

      setItemOrder(initialItemOrder);
      setMenuItems(filteredItems);

      // Collect existing item codes
      const codes = filteredItems
        .filter(item => item.itemCode)
        .map(item => item.itemCode);
      setExistingItemCodes(codes);

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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) {
      return;
    }

    try {
      if (selectedCategory) {
        // Handle menu item reordering
        const oldIndex = itemOrder[selectedCategory].indexOf(active.id);
        const newIndex = itemOrder[selectedCategory].indexOf(over.id);
        
        const newOrder = {
          ...itemOrder,
          [selectedCategory]: arrayMove(itemOrder[selectedCategory], oldIndex, newIndex)
        };
        
        setItemOrder(newOrder);
        
        await updateShop(shop.id, {
          ...shop,
          itemOrder: newOrder
        });

        showToast({
          title: 'Success',
          description: 'Item order updated'
        });
      } else {
        // Handle category reordering
        const oldIndex = orderedCategories.indexOf(active.id);
        const newIndex = orderedCategories.indexOf(over.id);
        
        const newCategories = arrayMove(orderedCategories, oldIndex, newIndex);
        setOrderedCategories(newCategories);
        
        await updateShop(shop.id, {
          ...shop,
          categoryOrder: newCategories
        });

        showToast({
          title: 'Success',
          description: 'Category order updated'
        });
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update order'
      });
    }
  };

  const handleDeleteItem = async (itemId, imageUrl) => {
    try {
      setIsLoading(true);
      await deleteMenuItem(itemId, imageUrl);
      
      // Update item order after deletion
      const category = menuItems.find(item => item.id === itemId)?.category;
      if (category && itemOrder[category]) {
        const newOrder = itemOrder[category].filter(id => id !== itemId);
        await updateShop(shop.id, {
          ...shop,
          itemOrder: {
            ...itemOrder,
            [category]: newOrder
          }
        });
      }

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

  const validateItemCode = (code, currentItemId) => {
    if (!code) return true; // Optional field
    return !existingItemCodes.some(existingCode => 
      existingCode === code && 
      menuItems.find(item => item.itemCode === code)?.id !== currentItemId
    );
  };

  const handleItemCodeChange = async (itemId, newCode) => {
    try {
      if (!validateItemCode(newCode, itemId)) {
        showToast({
          title: 'Error',
          description: 'This item code is already in use',
          type: 'error'
        });
        return;
      }

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
        <Header shop={shop} pageTitle={getPageTitle()} />
        <div className="max-w-4xl mx-auto p-6">
          {!selectedCategory ? (
            // Categories View
            <>
              <div className="mb-6">
                <button
                  onClick={() => navigate('/my-shops')}
                  className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
                >
                  Back to Shops
                </button>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={orderedCategories}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {orderedCategories.map((category) => (
                      <SortableCategory
                        key={category}
                        category={category}
                        itemCount={menuItems.filter(item => item.category === category).length}
                        onClick={() => setSelectedCategory(category)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            // Menu Items View
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
                  >
                    Back
                  </button>
                  {currentStore && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Store className="w-4 h-4" />
                      <span>{currentStore.name}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddItem}
                  className="p-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={itemOrder[selectedCategory] || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {itemOrder[selectedCategory]?.map((itemId) => {
                      const item = menuItems.find(i => i.id === itemId);
                      if (!item) return null;

                      return (
                        <SortableMenuItem
                          key={itemId}
                          item={item}
                          shop={shop}  
                          onEdit={handleEditItem}
                          onDelete={(item) => setShowDeleteConfirm(item)}
                          renderItemCode={renderItemCode}
                          renderItemTags={renderItemTags}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
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