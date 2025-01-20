import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { Plus, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { getShopByUsername, updateShop } from '../../firebase/utils';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../ui/alert';
import { Dialog, DialogContent } from '../ui/dialog';
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

// Sortable Category Component
const SortableCategory = ({ id, name, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between p-4 bg-white rounded-lg border"
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <span className="font-medium">{name}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(id, name)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(id, name)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ShopCategoriesManager = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState({ id: '', name: '' });
  const [deletingCategory, setDeletingCategory] = useState({ id: '', name: '' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadShop();
  }, [username]);

  const loadShop = async () => {
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
      setCategories(shopData.categoryOrder || shopData.categories || []);
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
    
    if (!active || !over || active.id === over.id) return;

    try {
      const oldIndex = categories.indexOf(active.id);
      const newIndex = categories.indexOf(over.id);
      
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);
      
      await updateShop(shop.id, {
        ...shop,
        categories: newCategories,
        categoryOrder: newCategories
      });

      showToast({
        title: 'Success',
        description: 'Category order updated'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update category order'
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const updatedCategories = [...categories, newCategory.trim()];
      await updateShop(shop.id, {
        ...shop,
        categories: updatedCategories,
        categoryOrder: updatedCategories
      });
      
      setCategories(updatedCategories);
      setNewCategory('');
      setShowAddDialog(false);
      
      showToast({
        title: 'Success',
        description: 'Category added successfully'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to add category'
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory.name.trim()) return;
    
    try {
      const updatedCategories = categories.map(cat => 
        cat === editingCategory.id ? editingCategory.name.trim() : cat
      );
      
      await updateShop(shop.id, {
        ...shop,
        categories: updatedCategories,
        categoryOrder: updatedCategories
      });
      
      setCategories(updatedCategories);
      setShowEditDialog(false);
      
      showToast({
        title: 'Success',
        description: 'Category updated successfully'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update category'
      });
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const updatedCategories = categories.filter(cat => cat !== deletingCategory.id);
      
      await updateShop(shop.id, {
        ...shop,
        categories: updatedCategories,
        categoryOrder: updatedCategories
      });
      
      setCategories(updatedCategories);
      setShowDeleteDialog(false);
      
      showToast({
        title: 'Success',
        description: 'Category deleted successfully'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to delete category'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  if (!shop) return null;

  return (
    <>
      <Header shop={shop} pageTitle="Manage Categories" />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/my-shops')}
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            Back to Shops
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={categories}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {categories.map((category) => (
                <SortableCategory
                  key={category}
                  id={category}
                  name={category}
                  onEdit={(id, name) => {
                    setEditingCategory({ id, name });
                    setShowEditDialog(true);
                  }}
                  onDelete={(id, name) => {
                    setDeletingCategory({ id, name });
                    setShowDeleteDialog(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Category Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Add Category</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border rounded-lg"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Edit Category</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border rounded-lg"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowEditDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditCategory}
                    disabled={!editingCategory.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Category Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <div className="p-6 space-y-6">
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deletingCategory.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default ShopCategoriesManager;