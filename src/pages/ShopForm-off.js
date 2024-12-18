import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Type, Upload, X, Check, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/loading';
import { currencyList } from '../data/general';
import { getShopByUsername, updateShop } from '../firebase/utils';
import { usernameUtils } from '../firebase/username-utils';
import { useToast } from '../contexts/ToastContext';
import { availableCategories } from '../data/general';

const templates = [
  { id: 'template1', name: '1 Column', description: 'Classic single column design' },
  { id: 'template2', name: '2 Column', description: 'Medium size images (5 columns on desktop)' },
  { id: 'template3', name: '3 Column', description: 'Small size images (8 columns on desktop)' }
];

const ShopForm = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    textLogo: '',
    useTextLogo: false,
    squareLogoFile: null,
    squareLogoPreview: null,
    rectangleLogoFile: null,
    rectangleLogoPreview: null,
    defaultTemplate: 'template1',
    currencyCode: 'IDR',
    language: 'id',
    country: 'Indonesia'
  });

  const [usernameStatus, setUsernameStatus] = useState({
    isChecking: false,
    isAvailable: true,
    message: ''
  });

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
      setFormData({
        ...shopData,
        textLogo: shopData.textLogo || '',
        useTextLogo: shopData.useTextLogo || false,
        squareLogoPreview: shopData.squareLogo || null,
        rectangleLogoPreview: shopData.rectangleLogo || null,
        defaultTemplate: shopData.defaultTemplate || 'template1',
        currencyCode: shopData.currencyCode || 'IDR',
        language: shopData.language || 'id',
        country: shopData.country || 'Indonesia'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load shop',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = async (e) => {
    const newUsername = e.target.value.toLowerCase();
    setFormData(prev => ({ ...prev, username: newUsername }));
    
    if (!newUsername) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: ''
      });
      return;
    }

    setUsernameStatus({
      isChecking: true,
      isAvailable: false,
      message: 'Checking availability...'
    });

    try {
      if (newUsername === username) {
        setUsernameStatus({
          isChecking: false,
          isAvailable: true,
          message: ''
        });
        return;
      }

      usernameUtils.validateFormat(newUsername);
      usernameUtils.checkMinLength(newUsername);
      const isAvailable = await usernameUtils.checkAvailability(newUsername);
      
      setUsernameStatus({
        isChecking: false,
        isAvailable,
        message: isAvailable ? 'Username is available' : 'Username is already taken'
      });
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: error.message
      });
    }
  };

  const handleLogoChange = (type) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [`${type}LogoFile`]: file,
          [`${type}LogoPreview`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name,
        username: formData.username,
        textLogo: formData.textLogo || '',
        useTextLogo: formData.useTextLogo || false,
        defaultTemplate: formData.defaultTemplate || 'template1',
        currencyCode: formData.currencyCode || 'IDR',
        language: formData.language || 'id',
        country: formData.country || 'Indonesia'
      };

      if (formData.squareLogoFile) {
        updateData.squareLogoFile = formData.squareLogoFile;
        updateData.previousSquareLogo = formData.squareLogo;
      }

      if (formData.rectangleLogoFile) {
        updateData.rectangleLogoFile = formData.rectangleLogoFile;
        updateData.previousRectangleLogo = formData.rectangleLogo;
      }

      await updateShop(formData.id, updateData);
      showToast({
        title: 'Success',
        description: 'Shop updated successfully'
      });
      navigate('/my-shops');
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update shop',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/my-shops')}
              className="p-2 hover:bg-gray-100 rounded-full mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Edit Shop</h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSave} className="space-y-8">
            {/* App Logo (Square) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                App Logo
              </label>
              <div className="flex items-center space-x-4">
                {formData.squareLogoPreview ? (
                  <div className="relative">
                    <img
                      src={formData.squareLogoPreview}
                      alt="App Logo Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        squareLogoFile: null,
                        squareLogoPreview: null
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg p-4 w-32 h-32 flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload Image</span>
                    <input
                      type="file"
                      onChange={handleLogoChange('square')}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Header Logo (Rectangle) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Header Logo
              </label>
              <div className="flex items-center">
                {formData.rectangleLogoPreview ? (
                  <div className="relative w-full">
                    <img
                      src={formData.rectangleLogoPreview}
                      alt="Header Logo Preview"
                      className="w-full h-32 object-contain rounded-lg border bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        rectangleLogoFile: null,
                        rectangleLogoPreview: null
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg p-4 w-full flex flex-col items-center justify-center h-32">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload Image</span>
                    <input
                      type="file"
                      onChange={handleLogoChange('rectangle')}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div>
              {/* Shop Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Username */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="flex h-12">
                    <span className="inline-flex items-center px-4 rounded-l-lg border border-gray-300 bg-gray-50 text-gray-500">
                      domain.com/
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={handleUsernameChange}
                      className={`flex-1 px-4 rounded-r-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                        usernameStatus.message 
                          ? usernameStatus.isAvailable 
                            ? 'border-green-500' 
                            : 'border-red-500'
                          : ''
                      }`}
                      required
                    />
                  </div>
                  {usernameStatus.isChecking ? (
                    <LoadingSpinner className="absolute right-3 top-1/2 -translate-y-1/2" />
                  ) : usernameStatus.message && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus.isAvailable ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {usernameStatus.message && (
                  <p className={`mt-1 text-sm ${
                    usernameStatus.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
              </div>

              {/* Currency Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency & Country
                </label>
                <select
                  value={formData.currencyCode}
                  onChange={(e) => {
                    const selectedCurrency = currencyList.find(c => c.code === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      currencyCode: selectedCurrency.code,
                      language: selectedCurrency.language,
                      country: selectedCurrency.country
                    }));
                  }}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {currencyList.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.country} ({currency.symbol} {currency.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Categories Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableCategories.map(category => (
                    <label
                      key={category}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.categories.includes(category) ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => {
                          const newCategories = formData.categories.includes(category)
                            ? formData.categories.filter(c => c !== category)
                            : [...formData.categories, category];
                          setFormData(prev => ({ ...prev, categories: newCategories }));
                        }}
                        className="mr-2"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Default Menu Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Default Menu Template
              </label>
              <div className="grid grid-cols-3 gap-4">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className={`relative flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.defaultTemplate === template.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={formData.defaultTemplate === template.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultTemplate: e.target.value }))}
                      className="hidden"
                    />
                    <span className="font-medium">{template.name}</span>
                    <span className="text-sm text-gray-500">{template.description}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Header Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Header Logo
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!formData.useTextLogo}
                      onChange={() => setFormData(prev => ({ ...prev, useTextLogo: false }))}
                      name="logoStyle"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Use Header Logo</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.useTextLogo}
                      onChange={() => setFormData(prev => ({ ...prev, useTextLogo: true }))}
                      name="logoStyle"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Use Text Logo</span>
                  </label>
                </div>

                {formData.useTextLogo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Logo
                    </label>
                    <div className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.textLogo}
                        onChange={(e) => setFormData(prev => ({ ...prev, textLogo: e.target.value }))}
                        className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter text to display"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-6">
              <button
                type="button"
                onClick={() => navigate('/my-shops')}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !usernameStatus.isAvailable}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading && <LoadingSpinner />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopForm;