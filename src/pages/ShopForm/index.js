import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getShopByUsername, updateShop } from '../../firebase/utils';
import { usernameUtils } from '../../firebase/username-utils';
import { useToast } from '../../contexts/ToastContext';
import Form from './Form';

const ShopForm = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '', // Add id to initial state
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
    country: 'Indonesia',
    categories: [],
    showItemCodes: false,
    // Preserve existing logo URLs
    squareLogo: null,
    rectangleLogo: null
  });

  const [usernameStatus, setUsernameStatus] = useState({
    isChecking: false,
    isAvailable: true,
    message: ''
  });

  useEffect(() => {
    if (username) {
      loadShop();
    }
  }, [username]);

  const loadShop = async () => {
    setIsLoading(true);
    try {
      const shopData = await getShopByUsername(username);
      console.log('Loaded shop data:', shopData); // Debug log

      if (!shopData) {
        showToast({
          title: 'Error',
          description: 'Shop not found',
          type: 'error'
        });
        navigate('/my-shops');
        return;
      }

      // Update form data with loaded shop data
      setFormData({
        ...formData,
        ...shopData,
        id: shopData.id, // Ensure ID is set
        textLogo: shopData.textLogo || '',
        useTextLogo: Boolean(shopData.useTextLogo),
        squareLogoPreview: shopData.squareLogo || null,
        rectangleLogoPreview: shopData.rectangleLogo || null,
        // Preserve original logo URLs
        squareLogo: shopData.squareLogo || null,
        rectangleLogo: shopData.rectangleLogo || null,
        categories: shopData.categories || [],
        showItemCodes: Boolean(shopData.showItemCodes),
        defaultTemplate: shopData.defaultTemplate || 'template1',
        currencyCode: shopData.currencyCode || 'IDR',
        language: shopData.language || 'id',
        country: shopData.country || 'Indonesia'
      });

      // Set username status to available for existing username
      setUsernameStatus({
        isChecking: false,
        isAvailable: true,
        message: ''
      });
    } catch (error) {
      console.error('Error loading shop:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load shop data',
        type: 'error'
      });
      navigate('/my-shops');
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
      if (!formData.id) {
        throw new Error('Shop ID is missing');
      }

      // Create clean data object removing undefined/null values
      const cleanData = {
        name: formData.name,
        username: formData.username,
        textLogo: formData.textLogo || '',
        useTextLogo: Boolean(formData.useTextLogo),
        defaultTemplate: formData.defaultTemplate || 'template1',
        currencyCode: formData.currencyCode || 'IDR',
        language: formData.language || 'id',
        country: formData.country || 'Indonesia',
        categories: formData.categories || [],
        showItemCodes: Boolean(formData.showItemCodes)
      };

      // Only include existing logo URLs if they exist
      if (formData.squareLogo) {
        cleanData.squareLogo = formData.squareLogo;
      }
      if (formData.rectangleLogo) {
        cleanData.rectangleLogo = formData.rectangleLogo;
      }

      // Handle new logo uploads
      if (formData.squareLogoFile) {
        cleanData.squareLogoFile = formData.squareLogoFile;
        if (formData.squareLogo) {
          cleanData.previousSquareLogo = formData.squareLogo;
        }
      }

      if (formData.rectangleLogoFile) {
        cleanData.rectangleLogoFile = formData.rectangleLogoFile;
        if (formData.rectangleLogo) {
          cleanData.previousRectangleLogo = formData.rectangleLogo;
        }
      }

      console.log('Saving shop with data:', cleanData); // Debug log
      await updateShop(formData.id, cleanData);
      
      showToast({
        title: 'Success',
        description: 'Shop updated successfully'
      });
      navigate('/my-shops');
    } catch (error) {
      console.error('Error updating shop:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update shop: ' + error.message,
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
          <Form
            formData={formData}
            setFormData={setFormData}
            usernameStatus={usernameStatus}
            handleUsernameChange={handleUsernameChange}
            handleLogoChange={handleLogoChange}
            handleSave={handleSave}
            isLoading={isLoading}
            onCancel={() => navigate('/my-shops')}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopForm;