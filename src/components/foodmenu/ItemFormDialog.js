import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '../../components/ui/dialog';
import { ChefHat, Flame, Star, X, Upload } from 'lucide-react';

const ItemFormDialog = ({ isOpen, onClose, onSave, editItem = null, category = '' }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    promotionalPrice: '',
    description: '',
    preparationTime: '',
    isSpicy: false,
    isChefRecommended: false,
    isPopular: false,
    image: null,
    imageFile: null,
    imagePreview: null
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset form data when dialog closes
      setFormData({
        title: '',
        price: '',
        promotionalPrice: '',
        description: '',
        preparationTime: '',
        isSpicy: false,
        isChefRecommended: false,
        isPopular: false,
        image: null,
        imageFile: null,
        imagePreview: null
      });
    } else if (editItem) {
      // Populate form data if editing an existing item
      setFormData({
        ...editItem,
        promotionalPrice: editItem.promotionalPrice || '',
        preparationTime: editItem.preparationTime || '',
        imagePreview: editItem.image || null,
        imageFile: null
      });
    }
  }, [isOpen, editItem]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      category,
      price: parseFloat(formData.price),
      promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null
    };
    onSave(submissionData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editItem ? 'Edit' : 'Add'} {category} Item
            </DialogTitle>
            <DialogDescription>
              {editItem ? 'Update the details of your menu item.' : 'Fill in the details to add a new menu item.'}
            </DialogDescription>
          </DialogHeader>

          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

          <DialogTitle className="text-xl font-semibold mb-6">
            {editItem ? 'Edit' : 'Add'} {category} Item
          </DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="flex justify-center">
              {formData.imagePreview ? (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-[150px] h-[150px] object-cover rounded-lg"
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
                <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg flex items-center justify-center w-[150px] h-[150px]">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <span className="text-sm text-gray-500 mt-1">Upload Image</span>
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

            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
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
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
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
                  name="promotionalPrice"
                  value={formData.promotionalPrice}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Preparation Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Time (mins)
              </label>
              <input
                type="text"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., 15-20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                rows="3"
                required
              />
            </div>

            {/* Tags */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  name="isSpicy"
                  checked={formData.isSpicy}
                  onChange={handleChange}
                />
                <Flame className="w-4 h-4 text-red-500" />
                <span className="text-sm">Spicy</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  name="isChefRecommended"
                  checked={formData.isChefRecommended}
                  onChange={handleChange}
                />
                <ChefHat className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Chef's Choice</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleChange}
                />
                <Star className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Popular</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {editItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemFormDialog;