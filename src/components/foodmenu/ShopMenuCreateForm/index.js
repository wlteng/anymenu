// index.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { LoadingSpinner } from '../../ui/loading';
import Header from '../../Layout/Header';
import { ImageUpload } from './ImageUpload';
import { FoodSpecialties } from './FoodSpecialties';
import { PriceInputs } from './PriceInputs';
import { VariantPrice } from './VariantPrice';
import { foodSpecialties } from '../../../data/general';
import { 
  getShopByUsername, 
  addMenuItem, 
  updateMenuItem 
} from '../../../firebase/utils';
import { loadShop, loadItem } from './utils';

const ShopMenuCreateForm = () => {
  const { username, category, itemId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('store');
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
    itemCode: '',
    isSpicy: false,
    isChefRecommended: false,
    isPopular: false,
    hasAllergens: false,  // Added
    allergyNote: '',      // Added
    imageFile: null,
    imagePreview: null,
    category: category || '',
    variants: []
  });

  useEffect(() => {
    const initializeForm = async () => {
      await loadShop(username, setShop, showToast, navigate);
      if (itemId) {
        await loadItem(itemId, setFormData, setIsEditMode, showToast);
      } else if (category) {
        setFormData(prev => ({ ...prev, category }));
      }
    };
    
    initializeForm();
  }, [username, itemId, category, navigate, showToast]);

  const handleImageChange = (file, preview) => {
    setFormData(prev => ({
      ...prev,
      imageFile: file,
      imagePreview: preview
    }));
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
        variants: formData.variants.map(variant => ({
          ...variant,
          price: parseFloat(variant.price),
          promotionalPrice: variant.promotionalPrice ? parseFloat(variant.promotionalPrice) : null
        }))
      };

      if (shop.shopType === 'Food Court' && storeId) {
        submissionData.storeId = storeId;
      }

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

  return (
    <>
      <Header shop={shop} pageTitle={`${isEditMode ? 'Edit' : 'Add'} ${category} Item`} />
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ImageUpload
            imagePreview={formData.imagePreview}
            onImageChange={handleImageChange}
            onImageRemove={() => setFormData(prev => ({
              ...prev,
              imageFile: null,
              imagePreview: null
            }))}
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, category: e.target.value }));
                  if (!isEditMode) {
                    navigate(`/menu/${username}/${e.target.value}/add${storeId ? `?store=${storeId}` : ''}`);
                  }
                }}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select Category</option>
                {shop?.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

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

            <PriceInputs
              regularPrice={formData.price}
              promotionalPrice={formData.promotionalPrice}
              onPriceChange={(field, value) => setFormData(prev => ({
                ...prev,
                [field]: value
              }))}
            />

            <VariantPrice
              variants={formData.variants}
              onChange={(newVariants) => setFormData(prev => ({
                ...prev,
                variants: newVariants
              }))}
            />

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

            <FoodSpecialties
              specialties={foodSpecialties}
              selectedSpecialties={{
                isSpicy: formData.isSpicy,
                isChefRecommended: formData.isChefRecommended,
                isPopular: formData.isPopular,
                hasAllergens: formData.hasAllergens
              }}
              allergyNote={formData.allergyNote}
              onChange={(property, value) => setFormData(prev => ({
                ...prev,
                [property]: value
              }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(`/menu/${username}`)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
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