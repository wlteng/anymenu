import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading';
import { useToast } from '../../contexts/ToastContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { getShopByUsername } from '../../firebase/utils';
import Header from '../Layout/Header';

// Import sections
import BasicSection from './BasicSection';
import SeoSection from './SeoSection';
import SocialPreviewSection from './SocialPreviewSection';
import SocialLinksSection from './SocialLinksSection';

const CompanyInfo = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    whatsappNumber: '',
    seoTitle: '',
    seoDescription: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogImageFile: null,
    ogImagePreview: null,
    websiteUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    keywords: '',
  });

  useEffect(() => {
    loadShop();
  }, [username]);

  const loadShop = async () => {
    if (!username) return;
    
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
      setFormData({
        description: shopData.description || '',
        whatsappNumber: shopData.whatsappNumber || '',
        seoTitle: shopData.seoTitle || '',
        seoDescription: shopData.seoDescription || '',
        ogTitle: shopData.ogTitle || '',
        ogDescription: shopData.ogDescription || '',
        ogImage: shopData.ogImage || '',
        ogImagePreview: shopData.ogImage || null,
        websiteUrl: shopData.websiteUrl || '',
        facebookUrl: shopData.facebookUrl || '',
        twitterUrl: shopData.twitterUrl || '',
        instagramUrl: shopData.instagramUrl || '',
        keywords: shopData.keywords || '',
      });
    } catch (error) {
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

  const handleOGImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          ogImageFile: file,
          ogImagePreview: reader.result
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
      let ogImageUrl = formData.ogImage;

      if (formData.ogImageFile) {
        const timestamp = Date.now();
        const originalName = formData.ogImageFile.name;
        const extension = originalName.split('.').pop();
        const uniqueFileName = `og_${timestamp}.${extension}`;

        const ogImageRef = ref(storage, `shops/${shop.id}/${uniqueFileName}`);
        await uploadBytes(ogImageRef, formData.ogImageFile);
        ogImageUrl = await getDownloadURL(ogImageRef);

        if (formData.ogImage) {
          try {
            const oldImageRef = ref(storage, formData.ogImage);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.warn('Old OG image not found:', error);
          }
        }
      }

      const shopRef = doc(db, 'shops', shop.id);
      await updateDoc(shopRef, {
        description: formData.description,
        whatsappNumber: formData.whatsappNumber,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        ogTitle: formData.ogTitle,
        ogDescription: formData.ogDescription,
        ogImage: ogImageUrl,
        websiteUrl: formData.websiteUrl,
        facebookUrl: formData.facebookUrl,
        twitterUrl: formData.twitterUrl,
        instagramUrl: formData.instagramUrl,
        keywords: formData.keywords,
      });

      showToast({
        title: 'Success',
        description: 'Company information updated successfully'
      });
      navigate('/my-shops');
    } catch (error) {
      console.error('Error updating company info:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update company information',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Move the route check to the render logic
  if (!location.pathname.includes('/company-info')) {
    return null;
  }

  if (isLoading && !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header shop={shop} pageTitle="Company Information" />
      
      <div className="max-w-3xl mx-auto px-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/my-shops')}
                className="text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 px-4 py-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/my-shops')}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                {isLoading && <LoadingSpinner />}
                Save
              </button>
            </div>
          </div>

          <div className="pb-6">
            <BasicSection 
              formData={formData} 
              handleChange={handleChange} 
            />

            <SeoSection 
              formData={formData} 
              handleChange={handleChange} 
            />

            <SocialPreviewSection 
              formData={formData}
              handleChange={handleChange}
              handleOGImageChange={handleOGImageChange}
              setFormData={setFormData}
            />

            <SocialLinksSection 
              formData={formData} 
              handleChange={handleChange} 
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfo;