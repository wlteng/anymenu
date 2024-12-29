import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { LoadingSpinner } from '../ui/loading';
import { useToast } from '../../contexts/ToastContext';
import { Upload, X } from 'lucide-react';
import { createStore, updateStore } from '../../firebase/utils';

const defaultFormData = {
  name: '',
  storeNumber: '',
  storeImageFile: null,
  storeImagePreview: null,
};

const StoreForm = ({ shop, store = null, isOpen, onClose, onSave }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        storeNumber: store.storeNumber || '',
        storeImagePreview: store.storeImage || null,
        storeImageFile: null,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [store]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          storeImageFile: file,
          storeImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop?.id) return;
    
    setIsLoading(true);
    try {
      const storeData = {
        ...formData,
      };

      if (store) {
        await updateStore(store.id, storeData);
        showToast({
          title: 'Success',
          description: 'Store updated successfully'
        });
      } else {
        await createStore(shop.id, storeData);
        showToast({
          title: 'Success',
          description: 'Store created successfully'
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving store:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save store',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <DialogTitle className="px-6 py-4 text-xl font-semibold m-0 bg-white">
            {store ? 'Edit Store' : 'Create Store'}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Store Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Image
              </label>
              <div className="flex justify-center">
                {formData.storeImagePreview ? (
                  <div className="relative">
                    <img
                      src={formData.storeImagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        storeImageFile: null,
                        storeImagePreview: null
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg flex items-center justify-center w-32 h-32">
                    <div className="text-center">
                      <Upload size={24} className="mx-auto text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2 block">Store Image</span>
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
            </div>

            {/* Store Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Number
                </label>
                <input
                  type="text"
                  value={formData.storeNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeNumber: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t p-6 bg-gray-50">
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
                disabled={isLoading || !formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700"
              >
                {isLoading && <LoadingSpinner />}
                {store ? 'Save Changes' : 'Create Store'}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoreForm;