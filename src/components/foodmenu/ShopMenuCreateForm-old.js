import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { Upload, X } from 'lucide-react';
import { 
  getShopByUsername, 
  addMenuItem, 
  updateMenuItem, 
  getMenuItems 
} from '../../firebase/utils';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { foodSpecialties } from '../../data/general';
import * as Icons from 'lucide-react';

const ShopMenuCreateForm = () => {
  const { username, category, itemId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('store');
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingItemCodes, setExistingItemCodes] = useState([]);
  const [itemCodeError, setItemCodeError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    promotionalPrice: '',
    description: '',
    preparationTime: '',
    itemCode: '',
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
    loadExistingItemCodes();
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

  const loadExistingItemCodes = async () => {
    try {
      const menuItems = await getMenuItems(shop?.id);
      const codes = menuItems
        .map(item => item.itemCode)
        .filter(code => code && code !== '');
      setExistingItemCodes(codes);
    } catch (error) {
      console.error('Error loading existing item codes:', error);
    }
  };

  const validateItemCode = (code) => {
    if (!code) return true; // Optional field
    if (isEditMode && formData.itemCode === code) return true; // Same code in edit mode
    return !existingItemCodes.includes(code);
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
          preparationTime: itemData.preparationTime || '',
          itemCode: itemData.itemCode || ''
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

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const renderSpecialtyTag = (specialty) => {
    const Icon = Icons[specialty.icon];
    const isActive = formData[specialty.property];

    return (
      <label key={specialty.id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, [specialty.property]: e.target.checked }))}
          className="hidden"
        />
        <div className={`p-2 rounded-full ${isActive ? specialty.bgColor : 'bg-gray-100'}`}>
          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        </div>
        <span className="text-sm">{specialty.label}</span>
      </label>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop) return;

    if (formData.itemCode && !validateItemCode(formData.itemCode)) {
      setItemCodeError('This item code is already in use');
      return;
    }

    setIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price),
        promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null,
        category: category,
      };

      // Add storeId for food court shops
      if (shop.shopType === 'Food Court' && storeId) {
        submissionData.storeId = storeId;
      }

      // Keep existing image if no new image is uploaded during edit
      if (!formData.imageFile && isEditMode) {
        submissionData.image = formData.imagePreview;
      }

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

  const handleItemCodeChange = (e) => {
    const newCode = e.target.value;
    setFormData(prev => ({ ...prev, itemCode: newCode }));
    setItemCodeError('');
    if (newCode && !validateItemCode(newCode)) {
      setItemCodeError('This item code is already in use');
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
      <Header shop={shop} pageTitle={`${isEditMode ? 'Edit' : 'Add'} ${category} Item`} />
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit' : 'Add'} {category} Item
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload with Drag & Drop */}
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
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative cursor-pointer group"
              >
                <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg flex flex-col items-center justify-center w-[200px] h-[200px] transition-colors group-hover:border-blue-500">
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
                    <span className="text-sm text-gray-500 group-hover:text-blue-500">
                      Drag & drop image here
                    </span>
                    <span className="text-xs text-gray-400 block mt-1">
                      or click to browse
                    </span>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
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

          {/* Item Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Code (Optional)
            </label>
            <input
              type="text"
              value={formData.itemCode}
              onChange={handleItemCodeChange}
              className={`w-full p-2 border rounded-lg ${itemCodeError ? 'border-red-500' : ''}`}
              placeholder="e.g., A1, B2, etc."
            />
            {itemCodeError && (
              <p className="text-sm text-red-500 mt-1">{itemCodeError}</p>
            )}
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
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows="3"
              placeholder="Enter item description"
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
            {foodSpecialties.map(specialty => renderSpecialtyTag(specialty))}
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
              disabled={isLoading || Boolean(itemCodeError)}
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