import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { Upload, X, ChefHat, Flame, Star } from 'lucide-react';
import { getShopByUsername, addMenuItem, updateMenuItem } from '../../firebase/utils';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ShopMenuCreateForm = () => {
  const { username, category, itemId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    promotionalPrice: '',
    description: '',
    preparationTime: '',
    isSpicy: false,
    isChefRecommended: false,
    isPopular: false,
    imageFile: null,
    imagePreview: null
  });

  useEffect(() => {
    loadShop();
    if (itemId) {
      loadItem();
    }
  }, [username, itemId]);

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

  const loadItem = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'menuItems', itemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const itemData = docSnap.data();
        setFormData({
          ...itemData,
          imagePreview: itemData.image,
          promotionalPrice: itemData.promotionalPrice || '',
          preparationTime: itemData.preparationTime || ''
        });
        setIsEditMode(true);
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load item data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop) return;

    setIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price),
        promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null,
        category: category,
      };

      if (isEditMode) {
        await updateMenuItem(itemId, submissionData, formData.imageFile);
        showToast({
          title: 'Success',
          description: 'Menu item updated successfully'
        });
      } else {
        await addMenuItem(shop.id, submissionData, formData.imageFile);
        showToast({
          title: 'Success',
          description: 'Menu item added successfully'
        });
      }
      navigate(`/menu/${username}`);
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.message || 'Failed to save menu item',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit' : 'Add'} Menu Item
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="flex justify-center">
            {formData.imagePreview ? (
              <div className="relative">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="w-[200px] h-[200px] object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    imageFile: null,
                    imagePreview: null
                  }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg flex items-center justify-center w-[200px] h-[200px]">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <span className="text-sm text-gray-500 mt-2 block">Upload Image</span>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regular Price
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                step="0.01"
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotional Price
              </label>
              <input
                type="number"
                value={formData.promotionalPrice}
                onChange={(e) => setFormData({ ...formData, promotionalPrice: e.target.value })}
                step="0.01"
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows="3"
              required
            />
          </div>

          {/* Preparation Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preparation Time (mins)
            </label>
            <input
              type="text"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="e.g., 15-20"
            />
          </div>

          {/* Tags */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isSpicy}
                onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                className="hidden"
              />
              <div className={`p-2 rounded-full ${formData.isSpicy ? 'bg-red-500' : 'bg-gray-100'}`}>
                <Flame className={`w-4 h-4 ${formData.isSpicy ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className="text-sm">Spicy</span>
            </label>

            <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isChefRecommended}
                onChange={(e) => setFormData({ ...formData, isChefRecommended: e.target.checked })}
                className="hidden"
              />
              <div className={`p-2 rounded-full ${formData.isChefRecommended ? 'bg-yellow-500' : 'bg-gray-100'}`}>
                <ChefHat className={`w-4 h-4 ${formData.isChefRecommended ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className="text-sm">Chef's Choice</span>
            </label>

            <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="hidden"
              />
              <div className={`p-2 rounded-full ${formData.isPopular ? 'bg-purple-500' : 'bg-gray-100'}`}>
                <Star className={`w-4 h-4 ${formData.isPopular ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className="text-sm">Popular</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(`/menu/${username}`)}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && <LoadingSpinner />}
              {isEditMode ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ShopMenuCreateForm;